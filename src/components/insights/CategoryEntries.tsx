import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EntryDialog } from "@/components/journal/EntryDialog";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

interface CategoryEntriesProps {
  category: string;
  onClose: () => void;
}

type JournalEntry = Tables<"journal_entries">;

export const CategoryEntries = ({ category, onClose }: CategoryEntriesProps) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const { data: entries, refetch } = useQuery({
    queryKey: ['categoryEntries', category],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: false });

      return data;
    }
  });

  const handleEntryUpdated = () => {
    refetch();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">{category} Entries</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {entries?.map((entry) => (
          <Card 
            key={entry.id} 
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSelectedEntry(entry)}
          >
            <h3 className="font-semibold mb-2">{entry.title}</h3>
            <p className="text-sm text-gray-500 mb-2">
              {format(new Date(entry.created_at), 'PPP')}
            </p>
            <p className="line-clamp-3 text-gray-600">
              {entry.content}
            </p>
          </Card>
        ))}

        {entries?.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No entries found in this category
          </p>
        )}
      </div>

      {selectedEntry && (
        <EntryDialog
          entry={selectedEntry}
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
          onEntryUpdated={handleEntryUpdated}
        />
      )}
    </>
  );
};