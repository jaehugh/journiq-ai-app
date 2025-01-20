import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const CategoryStats = () => {
  const { data: insights } = useQuery({
    queryKey: ['journalInsights'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('category, tags');

      if (error) throw error;

      const categoryCount: Record<string, number> = {};
      entries?.forEach(entry => {
        if (entry.category) {
          categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return { topCategories };
    },
  });

  return (
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
  );
};