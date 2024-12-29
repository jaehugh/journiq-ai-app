import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
  welcome: {
    subject: 'Welcome to Journiq!',
    html: `
      <h1>Welcome to Journiq!</h1>
      <p>We're excited to have you join our community of journalers.</p>
      <p>Here are some tips to get started:</p>
      <ul>
        <li>Create your first journal entry</li>
        <li>Set up your profile</li>
        <li>Explore AI-powered insights</li>
      </ul>
    `,
  },
  weekly_newsletter: {
    subject: 'Your Weekly Journaling Insights',
    html: `
      <h1>Your Weekly Journaling Summary</h1>
      <p>Here's what you've accomplished this week:</p>
      <ul>
        <li>Number of entries: {entry_count}</li>
        <li>Most used category: {top_category}</li>
        <li>Writing streak: {streak} days</li>
      </ul>
    `,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, templateName, customData } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    if (userError || !user?.email) throw new Error('User not found');

    const template = emailTemplates[templateName];
    if (!template) throw new Error('Email template not found');

    // Customize template with user data
    let html = template.html;
    if (customData) {
      Object.entries(customData).forEach(([key, value]) => {
        html = html.replace(`{${key}}`, String(value));
      });
    }

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
        html: html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

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