import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EntryDialog } from "@/components/journal/EntryDialog";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useProfileData } from "@/hooks/use-profile-data";

type JournalEntry = Tables<"journal_entries">;
type Goal = Tables<"goals">;

export const Dashboard = () => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfileData();

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      return data;
    },
  });

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

  const { data: goals, isLoading: isLoadingGoals, refetch: refetchGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('is_achieved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: insights } = useQuery({
    queryKey: ['journalInsights'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('category, tags');

      if (error) throw error;

      // Count categories
      const categoryCount: Record<string, number> = {};
      entries?.forEach(entry => {
        if (entry.category) {
          categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
        }
      });

      // Count tags
      const tagCount: Record<string, number> = {};
      entries?.forEach(entry => {
        entry.tags?.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      // Sort and get top 5
      const topCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const topTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return { topCategories, topTags };
    },
  });

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleGenerateGoals = async () => {
    try {
      setIsGeneratingGoals(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('generate-goals', {
        body: { userId: user.id }
      });

      if (error) throw error;

      await refetchGoals();
      toast({
        title: "Success",
        description: "New goals have been generated based on your journal entries!",
      });
    } catch (error) {
      console.error('Error generating goals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate goals. Please try again.",
      });
    } finally {
      setIsGeneratingGoals(false);
    }
  };

  const toggleGoalAchievement = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ is_achieved: !goal.is_achieved })
        .eq('id', goal.id);

      if (error) throw error;
      refetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update goal status.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back to your journal{profile?.display_name ? `, ${profile.display_name}` : ''}!
        </p>
      </header>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold">Goals</h2>
            {subscription?.tier === 'pro' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateGoals}
                disabled={isGeneratingGoals}
                className="whitespace-nowrap"
              >
                {isGeneratingGoals ? "Generating..." : "Generate Goals"}
              </Button>
            )}
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {isLoadingGoals ? (
              <p className="text-sm text-gray-500">Loading goals...</p>
            ) : goals && goals.length > 0 ? (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={goal.is_achieved}
                    onChange={() => toggleGoalAchievement(goal)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    {goal.content}
                    {goal.is_ai_generated && (
                      <span className="ml-2 text-xs text-blue-500">(AI Generated)</span>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No active goals. Start by adding some!</p>
            )}
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Most Used Categories</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {insights?.topCategories.map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm">{category}</span>
                <span className="text-sm text-gray-500">{count} entries</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {insights?.topTags.map(([tag, count]) => (
              <span 
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag} ({count})
              </span>
            ))}
          </div>
        </Card>
        
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
