import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const TagsSection = () => {
  const { data: insights } = useQuery({
    queryKey: ['journalInsights'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('tags');

      if (error) throw error;

      const tagCount: Record<string, number> = {};
      entries?.forEach(entry => {
        entry.tags?.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return { topTags };
    },
  });

  return (
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
  );
};