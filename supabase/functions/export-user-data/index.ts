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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch all user data
    const [journalEntries, goals, achievements] = await Promise.all([
      supabaseClient
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabaseClient
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabaseClient
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false }),
    ]);

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      journal_entries: journalEntries.data || [],
      goals: goals.data || [],
      achievements: achievements.data || [],
      exported_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(exportData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});