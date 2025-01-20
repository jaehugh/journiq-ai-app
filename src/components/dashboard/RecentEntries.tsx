import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { EntryDialog } from "@/components/journal/EntryDialog";
import { Tables } from "@/integrations/supabase/types";

type JournalEntry = Tables<"journal_entries">;

export const RecentEntries = () => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: recentEntries, isLoading: isLoadingEntries, refetch } = useQuery({
    queryKey: ['recentEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  return (
    <Card className="col-span-full p-4 md:p-6 space-y-4">
      <h2 className="text-lg md:text-xl font-semibold">Recent Entries</h2>
      {isLoadingEntries ? (
        <p className="text-sm text-gray-500">Loading recent entries...</p>
      ) : recentEntries && recentEntries.length > 0 ? (
        <div className="space-y-4">
          {recentEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleEntryClick(entry)}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-2">
                <h3 className="font-medium">{entry.title}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.tags?.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {entry.category && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-auto">
                    {entry.category}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No entries yet. Start journaling!</p>
      )}

      {selectedEntry && (
        <EntryDialog
          entry={selectedEntry}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onEntryUpdated={refetch}
        />
      )}
    </Card>
  );
};