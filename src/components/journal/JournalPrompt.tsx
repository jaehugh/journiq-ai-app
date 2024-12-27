import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JournalPromptProps {
  onPromptSelect: (prompt: string) => void;
}

export const JournalPrompt = ({ onPromptSelect }: JournalPromptProps) => {
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

  return (
    <>
      <Button 
        variant="outline" 
        onClick={generatePrompt}
        disabled={isGeneratingPrompt}
      >
        {isGeneratingPrompt ? "Generating..." : "Generate Prompt"}
      </Button>

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
                onPromptSelect(generatedPrompt);
                setPromptDialogOpen(false);
              }}
            >
              Use Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};