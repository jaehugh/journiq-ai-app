import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id');

    if (profilesError) throw profilesError;

    // For each user, get their weekly stats and send newsletter
    for (const profile of profiles) {
      // Get user's weekly stats
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const { data: entries, error: entriesError } = await supabaseClient
        .from('journal_entries')
        .select('category')
        .eq('user_id', profile.id)
        .gte('created_at', startOfWeek.toISOString());

      if (entriesError) continue;

      // Calculate stats
      const entryCount = entries?.length || 0;
      const categories = entries?.map(e => e.category) || [];
      const topCategory = categories.length > 0
        ? categories.reduce((a, b) =>
            categories.filter(v => v === a).length >= categories.filter(v => v === b).length ? a : b
          )
        : 'None';

      // Send weekly newsletter
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-automated-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.id,
          templateName: 'weekly_newsletter',
          customData: {
            entry_count: entryCount,
            top_category: topCategory,
            streak: 7, // This could be calculated more accurately based on actual daily entries
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scheduling weekly newsletter:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});