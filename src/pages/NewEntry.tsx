import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JournalPrompt } from "@/components/journal/JournalPrompt";
import { JournalForm } from "@/components/journal/JournalForm";

export const NewEntry = () => {
  // Fetch user's subscription tier
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      return subscription || { tier: 'basic' };
    },
  });

  const handlePromptSelect = (prompt: string) => {
    // This will be implemented when voice input is ready
    console.log("Selected prompt:", prompt);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
        <p className="text-gray-500">Write or record your thoughts.</p>
      </header>
      
      <Card className="p-6">
        <div className="space-y-4">
          <JournalPrompt onPromptSelect={handlePromptSelect} />
          <JournalForm subscription={subscription} />
        </div>
      </Card>
    </div>
  );
};