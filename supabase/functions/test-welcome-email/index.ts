import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a temporary user entry in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'john@journiqapp.com',
      email_confirm: true,
      user_metadata: { display_name: 'John' }
    });

    if (userError) throw userError;

    // Trigger welcome email
    const response = await fetch(`${supabaseUrl}/functions/v1/send-automated-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id,
        templateName: 'welcome'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send welcome email: ${await response.text()}`);
    }

    // Clean up the temporary user
    await supabase.auth.admin.deleteUser(userData.user.id);

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});