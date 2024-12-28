import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { Loader2, Brain, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CategoryStat {
  category: string;
  count: number;
}

interface UserStats {
  totalEntries: number;
  averageWordsPerEntry: number;
  mostUsedCategory: string;
  entriesThisWeek: number;
}

export const Insights = () => {
  const { toast } = useToast();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);

  // Fetch user's subscription tier
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();
      
      return data;
    }
  });

  // Fetch category statistics
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

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('content, created_at, category')
        .eq('user_id', user.id);

      if (!entries) return null;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const stats: UserStats = {
        totalEntries: entries.length,
        averageWordsPerEntry: Math.round(
          entries.reduce((acc, entry) => acc + entry.content.split(' ').length, 0) / entries.length
        ),
        mostUsedCategory: entries
          .reduce((acc: Record<string, number>, entry) => {
            const category = entry.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {})
          .reduce((a, b) => (a[1] > b[1] ? a : b))[0],
        entriesThisWeek: entries.filter(
          entry => new Date(entry.created_at) > oneWeekAgo
        ).length
      };

      return stats;
    }
  });

  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Insights Generated",
        description: data.insights,
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate insights. Please try again.",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleGenerateGoals = async () => {
    try {
      setIsGeneratingGoals(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-goals', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Goals Generated",
        description: "New goals have been created based on your journal entries.",
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-gray-500">Track your progress and achievements.</p>
      </header>
      
      {subscription?.tier === 'pro' && (
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
          >
            {isGeneratingInsights ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Generate AI Insights
          </Button>
          <Button
            onClick={handleGenerateGoals}
            disabled={isGeneratingGoals}
          >
            {isGeneratingGoals ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Target className="mr-2 h-4 w-4" />
            )}
            Generate AI Goals
          </Button>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryStats?.map((stat) => (
          <Card key={stat.category} className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">{stat.category}</h2>
            <p className="text-3xl font-bold">{stat.count}</p>
            <p className="text-sm text-gray-500">entries in this category</p>
          </Card>
        ))}
      </div>

      {userStats && (
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
      )}
      
      <div className="col-span-full">
        <AchievementsSection />
      </div>
    </div>
  );
};