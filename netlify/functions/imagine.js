export async function onRequestPost({ request, env }) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
    }

    // Using Pollinations.ai for simple, keyless generation
    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 10000)}`;

    // We return the URL directly to the client to render
    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
