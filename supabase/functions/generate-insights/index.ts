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
      .select('content, tags, category, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const entriesContext = entries?.map(entry => `
      Content: ${entry.content}
      Tags: ${entry.tags?.join(', ')}
      Category: ${entry.category}
      Date: ${entry.created_at}
    `).join('\n\n');

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
            content: `You are an AI that analyzes journal entries and provides meaningful insights. 
            Focus on patterns, trends, and potential areas of growth. 
            Provide 3-5 key insights in a clear, concise format.`
          },
          {
            role: 'user',
            content: `Based on these journal entries, provide key insights:\n${entriesContext}`
          }
        ],
      }),
    });

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});