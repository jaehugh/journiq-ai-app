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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    // Create a thread with explicit v2 configuration
    const thread = await openai.beta.threads.create();
    console.log('Created thread:', thread.id);

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Run the assistant with v2 configuration
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_ZnAY2Kd3gCEcRtMkAJnN2ON4',
      model: "gpt-4-turbo-preview", // Explicitly set the model
    });

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log('Initial run status:', runStatus.status);
    
    while (runStatus.status !== "completed") {
      if (runStatus.status === "failed") {
        console.error('Run failed:', runStatus);
        throw new Error("Assistant run failed");
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Updated run status:', runStatus.status);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data
      .filter(msg => msg.role === "assistant")
      .pop();

    if (!lastMessage) {
      console.error('No response from assistant');
      throw new Error("No response from assistant");
    }

    console.log('Assistant response:', lastMessage.content[0].text.value);

    const response = {
      message: lastMessage.content[0].text.value,
      thread_id: thread.id,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});