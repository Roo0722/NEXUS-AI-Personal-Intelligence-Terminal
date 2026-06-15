// functions/api/chat.js
// Cloudflare Pages Function for Chat API
// Secure backend proxy: Groq (primary) + OpenRouter (backup)

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { messages, model, provider, stream } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), { 
        status: 400,
        headers: corsHeaders()
      });
    }

    // Try primary (Groq), fall back to OpenRouter
    const activeProvider = provider || "groq";

    try {
      if (activeProvider === "groq") {
        return await callGroq(messages, model, stream, env);
      } else {
        return await callOpenRouter(messages, model, stream, env);
      }
    } catch (primaryError) {
      console.error(`Primary provider (${activeProvider}) failed:`, primaryError.message);

      // Auto-fallback to the other provider
      try {
        console.log("Attempting fallback provider...");
        if (activeProvider === "groq") {
          return await callOpenRouter(messages, "openai/gpt-3.5-turbo", stream, env);
        } else {
          return await callGroq(messages, "llama3-8b-8192", stream, env);
        }
      } catch (fallbackError) {
        console.error("Fallback provider also failed:", fallbackError.message);
        return new Response(JSON.stringify({
          error: "Both AI providers are unavailable. Please try again later.",
          details: fallbackError.message,
        }), {
          status: 502,
          headers: corsHeaders()
        });
      }
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: corsHeaders()
    });
  }
}

async function callGroq(messages, model, stream, env) {
  const GROQ_API_KEY = env.GROQ_API_KEY;
  
  console.log("Groq API Key present:", !!GROQ_API_KEY);
  console.log("Groq API Key length:", GROQ_API_KEY ? GROQ_API_KEY.length : 0);
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable not set in Cloudflare Pages");
  }

  const selectedModel = model || "llama3-8b-8192";

  console.log("Calling Groq API with model:", selectedModel);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false,
    }),
  });

  console.log("Groq API response status:", response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq API error response:", errText);
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return new Response(JSON.stringify({
    content,
    provider: "groq",
    model: selectedModel,
    usage: data.usage || {},
  }), {
    status: 200,
    headers: corsHeaders()
  });
}

async function callOpenRouter(messages, model, stream, env) {
  const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
  
  console.log("OpenRouter API Key present:", !!OPENROUTER_API_KEY);
  console.log("OpenRouter API Key length:", OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0);
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable not set in Cloudflare Pages");
  }

  const selectedModel = model || "openai/gpt-3.5-turbo";

  console.log("Calling OpenRouter API with model:", selectedModel);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": env.SITE_URL || "https://localhost",
      "X-Title": "NEXUS-AI-Terminal",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  console.log("OpenRouter API response status:", response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenRouter API error response:", errText);
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return new Response(JSON.stringify({
    content,
    provider: "openrouter",
    model: selectedModel,
    usage: data.usage || {},
  }), {
    status: 200,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

// Handle OPTIONS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
