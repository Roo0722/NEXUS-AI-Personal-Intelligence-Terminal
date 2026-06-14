# NEXUS AI — Personal Intelligence Terminal

A secure, self-hosted AI chatbot with a dark futuristic UI. Built for personal use with zero API key exposure to the browser. Deployed as a static site + serverless functions on Netlify (free tier).

---

## Educational Purpose
The NEXUS-AI-Personal-Intelligence-Terminal project is created and maintained strictly for educational, research, and learning purposes. It is an experimental project and is not intended for commercial use, production environments, or professional deployment.

---

## Features

- **Dual AI provider**: Groq (primary, ultra-fast) + OpenRouter (backup, broader model selection)
- **Automatic failover**: If one provider fails, the other is tried automatically
- **Image generation**: Free, no-key image generation via Pollinations.ai (Flux model)
- **Markdown rendering**: Full GFM support with syntax-highlighted code blocks and copy buttons
- **Chat history**: Persistent sessions stored in localStorage, up to 50 conversations
- **Persona system**: Switch between Assistant, Coder, Analyst, Writer, Concise, or Custom system prompts
- **Export**: Download any conversation as a Markdown file
- **Zero client-side key exposure**: All API keys live in Netlify environment variables only
- **Dark futuristic UI**: Cyberpunk minimalism with Space Grotesk + Orbitron + JetBrains Mono typography

---

## Architecture

```
Browser (index.html)
  └─► /.netlify/functions/chat    ─► Groq API (primary)
  │                               └► OpenRouter API (fallback)
  └─► /.netlify/functions/imagine ─► Pollinations.ai (free, no key)
```

- `index.html` — complete single-page frontend, no build step needed
- `netlify/functions/chat.js` — secure proxy for Groq + OpenRouter
- `netlify/functions/imagine.js` — free image generation proxy
- `netlify.toml` — Netlify build + header + redirect config

---

## Deployment (Netlify Free Tier)

### Step 1 — Fork / Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/secure-groq-chatbot.git
cd secure-groq-chatbot
```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — NEXUS AI"
git remote add origin https://github.com/YOUR_USERNAME/secure-groq-chatbot.git
git push -u origin main
```

### Step 3 — Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and click **"Add new site" → "Import an existing project"**
2. Connect GitHub and select the `secure-groq-chatbot` repo
3. Netlify auto-detects `netlify.toml` — click **"Deploy site"**

### Step 4 — Set Environment Variables

In your Netlify dashboard:  
**Site Configuration → Environment Variables → Add a variable**

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SITE_URL` | Your Netlify URL, e.g. `https://your-site.netlify.app` |

Then go to **Deploys → Trigger deploy** to apply the variables.

### Step 5 — Done

Visit your Netlify URL. The app is live.

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
npx netlify dev
```

Then open `http://localhost:8888`. The Netlify CLI will load functions and proxy requests locally.

Create a `.env` file in the project root for local dev (never commit this):
```
GROQ_API_KEY=your_groq_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
SITE_URL=http://localhost:8888
```

---

## Available Models

### Groq (Free)
| Model | Speed | Quality |
|---|---|---|
| llama3-8b-8192 | Fastest | Good |
| llama3-70b-8192 | Fast | Better |
| llama-3.1-8b-instant | Ultra-fast | Good |
| llama-3.1-70b-versatile | Fast | Best Groq |
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

- API keys are **only** in Netlify environment variables — never in source code or the browser
- Never commit `.env` files (covered by `.gitignore`)
- Rotate keys immediately if accidentally exposed
- The Content-Security-Policy header in `netlify.toml` restricts what the page can load
- DOMPurify sanitizes all AI-generated HTML before rendering

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (no framework, no build step) |
| Markdown | marked.js v9 |
| Syntax highlighting | highlight.js v11 (GitHub Dark theme) |
| Sanitization | DOMPurify v3 |
| Typography | Space Grotesk, Orbitron, JetBrains Mono (Google Fonts) |
| Backend | Netlify Serverless Functions (Node.js 18+) |
| AI (primary) | Groq API |
| AI (backup) | OpenRouter API |
| Images | Pollinations.ai (free, Flux model) |
| Hosting | Netlify (free tier) |

---

## License

MIT — personal use, modify freely.
