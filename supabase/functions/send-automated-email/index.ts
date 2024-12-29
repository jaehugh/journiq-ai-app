import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { welcomeSequenceTemplates } from '../email-templates/welcome-sequence.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTemplate {
  subject: string;
  html: string;
}

const emailTemplates: Record<string, EmailTemplate> = {
  ...welcomeSequenceTemplates,
  // Add other email templates here
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, templateName } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user data
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    if (userError || !user?.email) throw new Error('User not found');

    // Get user's subscription tier
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();

    // Get user's profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    const template = emailTemplates[templateName];
    if (!template) throw new Error('Email template not found');

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Journiq <hello@journiq.app>',
        to: [user.email],
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'template', value: templateName },
          { name: 'subscription_tier', value: subscription?.tier || 'basic' },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    // Sync with Airtable
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-to-airtable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email: user.email,
        displayName: profile?.display_name,
        subscriptionTier: subscription?.tier || 'basic',
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending automated email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});