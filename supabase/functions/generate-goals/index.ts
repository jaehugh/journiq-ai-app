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

    // Fetch user's journal entries
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('content, tags, category')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch existing goals
    const { data: existingGoals } = await supabase
      .from('goals')
      .select('content')
      .eq('user_id', userId)
      .eq('is_achieved', false);

    const entriesContext = entries?.map(entry => `
      Content: ${entry.content}
      Tags: ${entry.tags?.join(', ')}
      Category: ${entry.category}
    `).join('\n');

    const existingGoalsContext = existingGoals?.map(goal => 
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
            content: `You are an AI that generates actionable, specific goals based on journal entries. 
            Consider existing goals to avoid duplicates and ensure goals build upon each other.
            Generate 3 new goals that are concrete and measurable.
            Format each goal as a JSON object with a 'content' field.`
          },
          {
            role: 'user',
            content: `Based on these journal entries:\n${entriesContext}\n\nExisting goals:\n${existingGoalsContext}\n\nGenerate 3 new goals.`
          }
        ],
      }),
    });

    const data = await response.json();
    const goalsText = data.choices[0].message.content;
    
    try {
      const goals = JSON.parse(goalsText);
      
      // Insert new goals
      const { error } = await supabase
        .from('goals')
        .insert(
          goals.map((goal: { content: string }) => ({
            user_id: userId,
            content: goal.content,
            is_ai_generated: true,
          }))
        );

      if (error) throw error;

      return new Response(JSON.stringify({ goals }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing goals:', parseError);
      throw new Error('Failed to parse AI-generated goals');
    }
  } catch (error) {
    console.error('Error in generate-goals function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});