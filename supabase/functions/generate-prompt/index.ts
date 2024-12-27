import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch user's active goals
    const { data: goals } = await supabase
      .from('goals')
      .select('content')
      .eq('user_id', userId)
      .eq('is_achieved', false);

    const goalsContext = goals?.map(goal => 
      `- ${goal.content}`
    ).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI that generates thoughtful journal prompts. 
            Consider the user's current goals when generating prompts to help them 
            reflect on their progress and challenges.`
          },
          {
            role: 'user',
            content: `Generate a journal prompt that helps reflect on these goals:\n${goalsContext}`
          }
        ],
      }),
    });

    const data = await response.json();
    const prompt = data.choices[0].message.content;

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});