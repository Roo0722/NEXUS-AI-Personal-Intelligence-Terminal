// netlify/functions/imagine.js
// Free image generation via Pollinations.ai — no API key required

exports.handler = async function (event, context) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
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

  const { prompt, width = 1024, height = 1024, model = "flux" } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "prompt is required" }),
    };
  }

  // Sanitize and encode
  const safePrompt = prompt.trim().slice(0, 500);
  const encodedPrompt = encodeURIComponent(safePrompt);

  // Pollinations.ai free image generation
  const seed = Math.floor(Math.random() * 999999);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true&enhance=true`;

  // Verify the image URL is reachable
  try {
    const check = await fetch(imageUrl, { method: "HEAD" });
    if (!check.ok) {
      throw new Error(`Pollinations returned ${check.status}`);
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: "Image generation service unavailable. Try again shortly.",
        details: err.message,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      imageUrl,
      prompt: safePrompt,
      width,
      height,
      model,
      seed,
    }),
  };
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}
