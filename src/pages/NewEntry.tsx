import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const NewEntry = () => {
  const [content, setContent] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const { toast } = useToast();

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            content,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });
      
      setContent("");
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
      });
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
          
          <Textarea
            placeholder="Start writing your journal entry..."
            className="min-h-[300px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex justify-end">
            <Button onClick={saveEntry}>Save Entry</Button>
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
          <div className="flex justify-end">
            <Button onClick={() => setPromptDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};