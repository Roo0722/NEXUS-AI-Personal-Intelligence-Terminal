// netlify/functions/chat.js
// Secure backend proxy: Groq (primary) + OpenRouter (backup)
// API keys never exposed to frontend

exports.handler = async function (event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { messages, model, provider, stream } = body;

  if (!messages || !Array.isArray(messages)) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "messages array is required" }),
    };
  }

  // Try primary (Groq), fall back to OpenRouter
  const activeProvider = provider || "groq";

  try {
    if (activeProvider === "groq") {
      return await callGroq(messages, model, stream);
    } else {
      return await callOpenRouter(messages, model, stream);
    }
  } catch (primaryError) {
    console.error(`Primary provider (${activeProvider}) failed:`, primaryError.message);

    // Auto-fallback to the other provider
    try {
      console.log("Attempting fallback provider...");
      if (activeProvider === "groq") {
        return await callOpenRouter(messages, "openai/gpt-3.5-turbo", stream);
      } else {
        return await callGroq(messages, "llama3-8b-8192", stream);
      }
    } catch (fallbackError) {
      console.error("Fallback provider also failed:", fallbackError.message);
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: "Both AI providers are unavailable. Please try again later.",
          details: fallbackError.message,
        }),
      };
    }
  }
};

async function callGroq(messages, model, stream) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable not set");
  }

  const selectedModel = model || "llama3-8b-8192";

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
      stream: false, // We handle streaming simulation on the frontend
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      content,
      provider: "groq",
      model: selectedModel,
      usage: data.usage || {},
    }),
  };
}

async function callOpenRouter(messages, model, stream) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable not set");
  }

  const selectedModel = model || "openai/gpt-3.5-turbo";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.SITE_URL || "https://localhost",
      "X-Title": "SecureGroqChatbot",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      content,
      provider: "openrouter",
      model: selectedModel,
      usage: data.usage || {},
    }),
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}
