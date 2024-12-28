import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryStat {
  category: string;
  count: number;
}

export const CategoryStats = () => {
  const { data: categoryStats } = useQuery({
    queryKey: ['categoryStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('category')
        .eq('user_id', user.id);

      const stats: CategoryStat[] = [];
      const categoryCounts: Record<string, number> = {};

      entries?.forEach(entry => {
        const category = entry.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      Object.entries(categoryCounts).forEach(([category, count]) => {
        stats.push({ category, count });
      });

      return stats.sort((a, b) => b.count - a.count);
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categoryStats?.map((stat) => (
        <Card key={stat.category} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">{stat.category}</h2>
          <p className="text-3xl font-bold">{stat.count}</p>
          <p className="text-sm text-gray-500">entries in this category</p>
        </Card>
      ))}
    </div>
  );
};