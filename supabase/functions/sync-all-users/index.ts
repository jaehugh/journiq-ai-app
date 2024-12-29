import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const AIRTABLE_PAT = Deno.env.get('AIRTABLE_API_KEY');
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');

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

    // Fetch all users and their data
    const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Fetch profiles and subscriptions
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*');
    if (profilesError) throw profilesError;

    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('subscriptions')
      .select('*');
    if (subscriptionsError) throw subscriptionsError;

    // Create a map of user data
    const userMap = new Map();
    users.users.forEach(user => {
      const profile = profiles.find(p => p.id === user.id);
      const subscription = subscriptions.find(s => s.user_id === user.id);
      
      userMap.set(user.id, {
        email: user.email,
        fullName: profile?.display_name || '',
        subscriptionTier: subscription?.tier || 'basic',
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        avatarUrl: profile?.avatar_url,
      });
    });

    // Sync with Resend
    const resendPromises = Array.from(userMap.values()).map(async (userData) => {
      try {
        await fetch('https://api.resend.com/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            first_name: userData.fullName,
            data: {
              subscription_tier: userData.subscriptionTier,
            },
          }),
        });
      } catch (error) {
        console.error(`Failed to sync user ${userData.email} with Resend:`, error);
      }
    });

    // Sync with Airtable
    const airtablePromises = Array.from(userMap.entries()).map(async ([userId, userData]) => {
      try {
        await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [{
              fields: {
                'User ID': userId,
                'Full Name': userData.fullName,
                'Email Address': userData.email,
                'Profile Photo': userData.avatarUrl || '',
                'Date Joined': userData.createdAt,
                'Role': userData.subscriptionTier,
                'Interaction History': '',  // Can be populated if we track interactions
                'Feedback Given': '',       // Can be populated if we track feedback
                'Emails Sent': '',          // Can be populated if we track emails
                'Entrepreneurs': false,      // Default values based on screenshot
                'Coaches': false,           // These can be updated later
                'Founders': false,          // based on user categorization
              },
            }],
          }),
        });
      } catch (error) {
        console.error(`Failed to sync user ${userData.email} with Airtable:`, error);
      }
    });

    // Wait for all sync operations to complete
    await Promise.all([...resendPromises, ...airtablePromises]);

    // Log the sync operation
    await supabaseClient
      .from('job_logs')
      .insert({
        job_name: 'sync_all_users',
        status: 'success',
        response: { users_synced: userMap.size },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${userMap.size} users` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});