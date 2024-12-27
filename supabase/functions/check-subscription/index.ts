import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS = {
  PRO_MONTHLY: 'price_1QWk3ZAC3xzW6CxUplNxKSYf',
  PRO_YEARLY: 'price_1Qaks1AC3xzW6CxUylLcvd6O',
  PLUS_MONTHLY: 'price_1QTtXhAC3xzW6CxUVB0cNsPH',
  PLUS_YEARLY: 'price_1Qakt3AC3xzW6CxUTdBs9SE6',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    const email = user?.email

    if (!email) {
      throw new Error('No email found')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ tier: 'basic' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ tier: 'basic' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0].price.id

    let tier = 'basic'
    if ([PRICE_IDS.PRO_MONTHLY, PRICE_IDS.PRO_YEARLY].includes(priceId)) {
      tier = 'pro'
    } else if ([PRICE_IDS.PLUS_MONTHLY, PRICE_IDS.PLUS_YEARLY].includes(priceId)) {
      tier = 'plus'
    }

    return new Response(
      JSON.stringify({ 
        tier,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})