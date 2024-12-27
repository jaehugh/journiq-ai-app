import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_CATEGORIES = [
  "Personal",
  "Business",
  "Goals",
  "Reflection",
  "Ideas",
  "Learning",
  "Other"
];

export const NewEntry = () => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch user's subscription tier
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      return subscription || { tier: 'basic' };
    },
  });

  const generatePrompt = async () => {
    try {
      setIsGeneratingPrompt(true);
      const { data, error } = await supabase.functions.invoke('generate-prompt');
      
      if (error) throw error;
      
      setGeneratedPrompt(data.prompt);
      setPromptDialogOpen(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please write something before saving.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Get AI-generated title, tags, and category
      const { data: aiData, error: aiError } = await supabase.functions.invoke('auto-tag-entry', {
        body: { 
          content,
          userTier: subscription?.tier || 'basic'
        }
      });

      if (aiError) throw aiError;

      const finalCategory = subscription?.tier === 'pro' ? 
        (category || customCategory || aiData.category) :
        (category || aiData.category);

      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            content,
            title: subscription?.tier === 'pro' ? aiData.title : (title || 'Untitled Entry'),
            category: finalCategory,
            tags: aiData.tags
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });
      
      setContent("");
      setTitle("");
      setCategory("");
      setCustomCategory("");
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
        <p className="text-gray-500">Write or record your thoughts.</p>
      </header>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={generatePrompt}
              disabled={isGeneratingPrompt}
            >
              {isGeneratingPrompt ? "Generating..." : "Generate Prompt"}
            </Button>
            <Button variant="outline">
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
          </div>

          {subscription?.tier !== 'pro' && (
            <Input
              placeholder="Entry title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}
          
          {subscription?.tier !== 'basic' && (
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {subscription?.tier === 'pro' && (
                <Input
                  placeholder="Or enter a custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>
          )}
          
          <Textarea
            placeholder="Start writing your journal entry..."
            className="min-h-[300px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={saveEntry}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Journal Prompt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg">{generatedPrompt}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPromptDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setContent((prev) => 
                  prev ? `${prev}\n\n${generatedPrompt}` : generatedPrompt
                );
                setPromptDialogOpen(false);
              }}
            >
              Use Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};