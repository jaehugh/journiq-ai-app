import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoiceInput } from "./VoiceInput";

const DEFAULT_CATEGORIES = [
  "Personal",
  "Business",
  "Goals",
  "Reflection",
  "Ideas",
  "Learning",
  "Other"
];

interface JournalFormProps {
  subscription?: { tier: string };
}

export const JournalForm = ({ subscription }: JournalFormProps) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleVoiceInput = (text: string) => {
    setContent((prevContent) => {
      // Add a space if there's existing content
      const separator = prevContent ? ' ' : '';
      return prevContent + separator + text;
    });
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
    <div className="space-y-4">
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
            <SelectContent className="bg-white dark:bg-gray-800">
              {DEFAULT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="cursor-pointer">
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
      
      <div className="space-y-2">
        <div className="flex justify-end">
          <VoiceInput onVoiceInput={handleVoiceInput} />
        </div>
        <Textarea
          placeholder="Start writing your journal entry..."
          className="min-h-[300px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveEntry}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  );
};