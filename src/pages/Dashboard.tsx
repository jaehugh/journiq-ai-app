import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EntryDialog } from "@/components/journal/EntryDialog";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

type JournalEntry = Tables<"journal_entries">;

export const Dashboard = () => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: recentEntries, isLoading, refetch } = useQuery({
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your journal.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Goals</h2>
          <p className="text-sm text-gray-500">Set and track your personal and business goals.</p>
        </Card>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Insights</h2>
          <p className="text-sm text-gray-500">AI-powered analysis of your journal entries.</p>
        </Card>
        
        <Card className="col-span-full p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Entries</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading recent entries...</p>
          ) : recentEntries && recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{entry.title}</h3>
                    <span className="text-xs text-gray-500">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.tags?.map((tag: string) => (
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
        </Card>
      </div>

      {selectedEntry && (
        <EntryDialog
          entry={selectedEntry}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onEntryUpdated={refetch}
        />
      )}
    </div>
  );
};