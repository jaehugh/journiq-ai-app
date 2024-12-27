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

const DEFAULT_CATEGORIES = [
  "Personal",
  "Business",
  "Goals",
  "Reflection",
  "Ideas",
  "Learning",
  "Other"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, userTier } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // For basic users, we'll only use default categories and no AI processing
    if (userTier === 'basic') {
      return new Response(
        JSON.stringify({
          title: 'Untitled Entry',
          category: 'Other',
          tags: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
            content: userTier === 'pro' ? 
              'You are an AI assistant that analyzes journal entries. Generate a concise title, relevant category, and up to 5 tags. For categories, either suggest a custom one or choose from: Personal, Business, Goals, Reflection, Ideas, Learning, Other. Tags should be single words or short phrases.' :
              'You are an AI assistant that analyzes journal entries. Choose a category from: Personal, Business, Goals, Reflection, Ideas, Learning, Other. Also generate up to 5 relevant tags.'
          },
          {
            role: 'user',
            content: `Analyze this journal entry and provide: ${userTier === 'pro' ? 'a title, ' : ''}a category${userTier === 'plus' ? ' from the predefined list' : ''}, and relevant tags:\n\n${content}`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse AI response
    const titleMatch = userTier === 'pro' ? aiResponse.match(/Title:?\s*([^\n]+)/i) : null;
    const categoryMatch = aiResponse.match(/Category:?\s*([^\n]+)/i);
    const tagsMatch = aiResponse.match(/Tags:?\s*([^\n]+)/i);

    const title = userTier === 'pro' && titleMatch ? titleMatch[1].trim() : 'Untitled Entry';
    const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
    const tags = tagsMatch ? 
      tagsMatch[1]
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5) : 
      [];

    // For plus users, ensure category is from default list
    const finalCategory = userTier === 'plus' && !DEFAULT_CATEGORIES.includes(category) ? 
      'Other' : 
      category;

    return new Response(
      JSON.stringify({
        title,
        category: finalCategory,
        tags
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-tag-entry function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});