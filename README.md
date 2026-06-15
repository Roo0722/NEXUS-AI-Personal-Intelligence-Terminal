# NEXUS AI — Personal Intelligence Terminal

A secure, self-hosted AI chatbot with a dark futuristic UI inspired by Vercel's Chatbot design. Built for personal use with zero API key exposure to the browser. Deployed as a static site + serverless functions on **Cloudflare Pages** (free tier).

---

## Educational Purpose
The NEXUS-AI-Personal-Intelligence-Terminal project is created and maintained strictly for educational, research, and learning purposes. It is an experimental project and is not intended for commercial use, production environments, or professional deployment.

---

## Features

- **Dual AI provider**: Groq (primary, ultra-fast) + OpenRouter (backup, broader model selection)
- **Automatic failover**: If one provider fails, the other is tried automatically
- **Image generation**: Free, no-key image generation via Pollinations.ai (Flux model)
- **Chat history**: Persistent sessions stored in localStorage
- **Model selection**: Switch between Llama 3 8B, Llama 3 70B, Mixtral 8x7B, Gemma 2 9B
- **Zero client-side key exposure**: All API keys live in Cloudflare environment variables only
- **Dark minimalist UI**: Clean, modern design with high typographic contrast (Vercel-inspired)
- **Responsive layout**: Collapsible sidebar, mobile-friendly interface

---

## Architecture

```
Browser (index.html)
  └─► /api/chat    ─► Cloudflare Pages Function ─► Groq API (primary)
  │                                            └► OpenRouter API (fallback)
  └─► /api/imagine ─► Cloudflare Pages Function ─► Pollinations.ai (free, no key)
```

- `index.html` — complete single-page frontend, no build step needed
- `functions/chat.js` — secure proxy for Groq + OpenRouter (Cloudflare Workers runtime)
- `functions/imagine.js` — free image generation proxy (Cloudflare Workers runtime)
- `_redirects` — Cloudflare Pages routing configuration
- `_headers` — security headers configuration

---

## Deployment (Cloudflare Pages Free Tier)

### Step 1 — Fork / Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/NEXUS-AI-Personal-Intelligence-Terminal.git
cd NEXUS-AI-Personal-Intelligence-Terminal
```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — NEXUS AI"
git remote add origin https://github.com/YOUR_USERNAME/NEXUS-AI-Personal-Intelligence-Terminal.git
git push -u origin main
```

### Step 3 — Deploy on Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and navigate to **Workers & Pages**
2. Click **"Create application" → "Pages" → "Connect to Git"**
3. Select your repository and branch (main/master)
4. Configure build settings:
   - **Build command**: `echo 'No build step required'`
   - **Build output directory**: `.`
5. Click **"Save and Deploy"**

### Step 4 — Set Environment Variables

In your Cloudflare Pages dashboard:
**Settings → Environment Variables → Production → Add variable**

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SITE_URL` | Your Cloudflare Pages URL, e.g. `https://your-site.pages.dev` |

Then go to **Deployments → Retry deployment** to apply the variables.

### Step 5 — Done

Visit your Cloudflare Pages URL. The app is live.

---

## Getting API Keys (Free Tiers)

### Groq (Primary)
1. Sign up at [console.groq.com](https://console.groq.com)
2. Go to **API Keys → Create API Key**
3. Free tier: generous rate limits, extremely fast inference

### OpenRouter (Backup)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to **Keys → Create Key**
3. Free tier: several free models available (marked `:free` in the model list)

### Pollinations.ai (Image Generation)
- **No key required.** Completely free and handled server-side.

---

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:8788`. The Wrangler CLI will load functions and proxy requests locally.

Create a `.env` file in the project root for local dev (never commit this):
```
GROQ_API_KEY=your_groq_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
SITE_URL=http://localhost:8788
```

---

## Available Models

### Groq (Free)
| Model | Speed | Quality |
|---|---|---|
| llama3-8b-8192 | Fastest | Good |
| llama3-70b-8192 | Fast | Better |
| mixtral-8x7b-32768 | Fast | Great (large context) |
| gemma2-9b-it | Fast | Good |

### OpenRouter (Free models marked)
| Model | Notes |
|---|---|
| openai/gpt-3.5-turbo | Paid |
| openai/gpt-4o-mini | Paid |
| anthropic/claude-3-haiku | Paid |
| anthropic/claude-3.5-sonnet | Paid |
| google/gemma-2-9b-it:free | Free |
| meta-llama/llama-3-8b-instruct:free | Free |
| mistralai/mistral-7b-instruct:free | Free |

---

## Security Notes

- API keys are **only** in Cloudflare environment variables — never in source code or the browser
- Never commit `.env` files (covered by `.gitignore`)
- Rotate keys immediately if accidentally exposed
- The Content-Security-Policy header in `_headers` restricts what the page can load
- All connections use HTTPS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (no framework, no build step) |
| Styling | Tailwind CSS (CDN) |
| Typography | Inter (Google Fonts) |
| Backend | Cloudflare Pages Functions (V8 Workers runtime) |
| AI (primary) | Groq API |
| AI (backup) | OpenRouter API |
| Images | Pollinations.ai (free, Flux model) |
| Hosting | Cloudflare Pages (free tier) |

---

## Migration from Netlify

If you're migrating from Netlify:

1. **Delete** `netlify.toml` and `netlify/functions/` folder
2. **Create** `functions/` folder with Cloudflare-compatible functions
3. **Update** `_redirects` to point to `/functions/` instead of `/.netlify/functions/`
4. **Set** environment variables in Cloudflare Dashboard instead of Netlify
5. **Deploy** using Cloudflare Pages instead of Netlify

Key differences:
- Cloudflare Functions use `export async function onRequestPost({ request, env })` syntax
- Environment variables accessed via `env.VARIABLE_NAME` instead of `process.env.VARIABLE_NAME`
- Build output directory is `.` (root) for static sites

---

## License

MIT — personal use, modify freely.
