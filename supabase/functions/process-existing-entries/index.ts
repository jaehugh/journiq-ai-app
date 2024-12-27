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

    // Get user's subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (!subscription || subscription.tier === 'basic') {
      return new Response(
        JSON.stringify({ message: 'User is not eligible for AI processing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all entries without tags or categories
    const { data: entries, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .is('tags', null);

    if (fetchError) throw fetchError;

    console.log(`Processing ${entries?.length || 0} entries for user ${userId}`);

    // Process each entry
    for (const entry of entries || []) {
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
              content: subscription.tier === 'pro' ? 
                'You are an AI assistant that analyzes journal entries. Generate a concise title, relevant category, and up to 5 tags.' :
                'You are an AI assistant that analyzes journal entries. Choose a category from: Personal, Business, Goals, Reflection, Ideas, Learning, Other. Also generate up to 5 relevant tags.'
            },
            {
              role: 'user',
              content: `Analyze this journal entry and provide: ${subscription.tier === 'pro' ? 'a title, ' : ''}a category, and relevant tags:\n\n${entry.content}`
            }
          ],
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Parse AI response
      const titleMatch = subscription.tier === 'pro' ? aiResponse.match(/Title:?\s*([^\n]+)/i) : null;
      const categoryMatch = aiResponse.match(/Category:?\s*([^\n]+)/i);
      const tagsMatch = aiResponse.match(/Tags:?\s*([^\n]+)/i);

      const title = subscription.tier === 'pro' && titleMatch ? titleMatch[1].trim() : entry.title;
      const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
      const tags = tagsMatch ? 
        tagsMatch[1]
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
          .slice(0, 5) : 
        [];

      // Update the entry
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          title: subscription.tier === 'pro' ? title : entry.title,
          category,
          tags
        })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`Error updating entry ${entry.id}:`, updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Entries processed successfully',
        processedCount: entries?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-existing-entries function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});