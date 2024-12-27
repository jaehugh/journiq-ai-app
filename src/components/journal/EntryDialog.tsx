import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type JournalEntry = Tables<"journal_entries">;

interface EntryDialogProps {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryUpdated: () => void;
}

const CATEGORIES = [
  "Personal",
  "Business",
  "Goals",
  "Reflection",
  "Ideas",
  "Learning",
  "Other"
];

export const EntryDialog = ({ entry, open, onOpenChange, onEntryUpdated }: EntryDialogProps) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [category, setCategory] = useState(entry.category || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
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
    if (!confirm("Are you sure you want to delete this entry?")) return;

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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Entry title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your entry..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete Entry
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};