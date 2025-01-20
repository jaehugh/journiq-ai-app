import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Goal = Tables<"goals">;

export const GoalsSection = () => {
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const { toast } = useToast();

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
  );
};