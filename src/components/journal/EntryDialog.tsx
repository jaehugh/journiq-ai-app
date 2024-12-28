import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { DeleteEntryDialog } from "./DeleteEntryDialog";
import { EntryForm } from "./EntryForm";

type JournalEntry = Tables<"journal_entries">;

interface EntryDialogProps {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryUpdated: () => void;
}

export const EntryDialog = ({ entry, open, onOpenChange, onEntryUpdated }: EntryDialogProps) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [category, setCategory] = useState(entry.category || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (subscription?.tier === 'pro' || subscription?.tier === 'plus') {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('auto-tag-entry', {
          body: { 
            content,
            userTier: subscription.tier
          }
        });

        if (aiError) throw aiError;

        const { error } = await supabase
          .from("journal_entries")
          .update({
            title: subscription.tier === 'pro' ? aiData.title : title,
            content,
            category: category || aiData.category,
            tags: aiData.tags,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            title,
            content,
            category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entry.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Entry updated successfully",
      });
      onEntryUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update entry",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
      
      // Clean up all states and close both dialogs
      setShowDeleteDialog(false);
      onEntryUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete entry",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        // Ensure delete dialog is closed when main dialog is closed
        if (!newOpen) {
          setShowDeleteDialog(false);
        }
        onOpenChange(newOpen);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <EntryForm
            title={title}
            content={content}
            category={category}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onCategoryChange={setCategory}
            onCancel={() => onOpenChange(false)}
            onSave={handleUpdate}
            onDelete={() => setShowDeleteDialog(true)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <DeleteEntryDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
};