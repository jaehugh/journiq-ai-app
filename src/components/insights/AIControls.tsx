import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, Target } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const AIControls = () => {
  const { toast } = useToast();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return data;
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

  if (subscription?.tier !== 'pro') return null;

  return (
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
  );
};