import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  totalEntries: number;
  averageWordsPerEntry: number;
  mostUsedCategory: string;
  entriesThisWeek: number;
}

export const UserStats = () => {
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('content, created_at, category')
        .eq('user_id', user.id);

      if (!entries?.length) return null;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const categoryCount: Record<string, number> = {};
      let totalWords = 0;

      entries.forEach(entry => {
        const category = entry.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        totalWords += entry.content.split(' ').length;
      });

      const mostUsedCategory = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)[0][0];

      const stats: UserStats = {
        totalEntries: entries.length,
        averageWordsPerEntry: Math.round(totalWords / entries.length),
        mostUsedCategory,
        entriesThisWeek: entries.filter(
          entry => new Date(entry.created_at) > oneWeekAgo
        ).length
      };

      return stats;
    }
  });

  if (!userStats) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Total Entries</h2>
        <p className="text-3xl font-bold">{userStats.totalEntries}</p>
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Entries This Week</h2>
        <p className="text-3xl font-bold">{userStats.entriesThisWeek}</p>
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Avg. Words per Entry</h2>
        <p className="text-3xl font-bold">{userStats.averageWordsPerEntry}</p>
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Most Used Category</h2>
        <p className="text-3xl font-bold">{userStats.mostUsedCategory}</p>
      </Card>
    </div>
  );
};