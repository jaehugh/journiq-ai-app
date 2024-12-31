import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const openai = new OpenAI({ 
  apiKey: openAIApiKey,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2'
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, openai-beta',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Request method:', req.method);
    
    const { message } = await req.json();
    console.log('Received message:', message);

    if (!message) {
      console.error('No message provided in request');
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a thread with explicit v2 configuration
    console.log('Creating thread with OpenAI...');
    const thread = await openai.beta.threads.create();
    console.log('Created thread:', thread.id);

    // Add the user's message to the thread
    console.log('Adding message to thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Run the assistant with v2 configuration
    console.log('Starting assistant run...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_ZnAY2Kd3gCEcRtMkAJnN2ON4',
      model: "gpt-4-turbo-preview",
    });
    console.log('Created run:', run.id);

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log('Initial run status:', runStatus.status);
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (runStatus.status !== "completed" && attempts < maxAttempts) {
      if (runStatus.status === "failed") {
        console.error('Run failed:', runStatus);
        return new Response(
          JSON.stringify({ 
            error: "Assistant run failed",
            details: runStatus
          }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (runStatus.status === "expired") {
        console.error('Run expired:', runStatus);
        return new Response(
          JSON.stringify({ 
            error: "Assistant run expired",
            details: runStatus
          }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Updated run status:', runStatus.status);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error('Run timed out after 30 seconds');
      return new Response(
        JSON.stringify({ 
          error: "Assistant run timed out",
          details: runStatus
        }), 
        { 
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the assistant's response
    console.log('Retrieving messages...');
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data
      .filter(msg => msg.role === "assistant")
      .pop();

    if (!lastMessage) {
      console.error('No response message found from assistant');
      return new Response(
        JSON.stringify({ 
          error: "No response from assistant",
          details: messages
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Assistant response:', lastMessage.content[0].text.value);

    const response = {
      message: lastMessage.content[0].text.value,
      thread_id: thread.id,
    };

    return new Response(
      JSON.stringify(response), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});