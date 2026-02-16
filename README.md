# WhatsApp RAG Bot

A production-ready WhatsApp chatbot using Next.js, Twilio, OpenAI, and Chroma (RAG). Answers questions from your portfolio documents.

**Features:**
- Web chat UI + WhatsApp (Twilio)
- Bidirectional sync: messages from web appear in WhatsApp; WhatsApp messages appear in web

## Tech Stack

- **Next.js 14** (App Router)
- **Chroma** - Vector database for RAG
- **OpenAI** - Embeddings + Chat
- **Twilio** - WhatsApp Sandbox
- **Vercel** - Deployment

## Setup (Step by Step)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Chroma

Chroma must be running before indexing or using the bot.

**Option A: Chroma Cloud** (recommended for Windows – no Docker, free $5 credits)

1. Sign up at [trychroma.com](https://trychroma.com/signup)
2. Create a database in the dashboard
3. Get your API key and add to `.env`:
   ```
   CHROMA_API_KEY=your_api_key
   ```
4. The `chromadb` CLI can connect your DB: `npx chromadb db connect YOUR_DB_NAME --env-file` (if supported on your OS)

**Option B: Docker** (Linux/Mac or Windows with Docker)

```bash
docker run -p 8000:8000 chromadb/chroma
```

Then set `CHROMA_URL=http://localhost:8000` in `.env`.

**Note:** Chroma CLI (`chromadb run`) does not support Windows x64 – use Chroma Cloud or Docker.

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required:
- `OPENAI_API_KEY` - From [platform.openai.com](https://platform.openai.com)
- `TWILIO_ACCOUNT_SID` - From [Twilio Console](https://console.twilio.com)
- `TWILIO_AUTH_TOKEN` - From Twilio Console
- `TWILIO_WHATSAPP_NUMBER` - e.g. `whatsapp:+14155238886` (Sandbox)
- `CHROMA_API_KEY`, `CHROMA_TENANT`, `CHROMA_DATABASE` - From [Chroma Cloud](https://trychroma.com)

For web ↔ WhatsApp sync:
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - From [Upstash](https://console.upstash.com) (free tier)
- `MIRROR_WHATSAPP_NUMBER` - (optional) Your WhatsApp number to receive copies of web chat messages

### 4. Add Portfolio Documents

Place `.txt` or `.md` files in `data/portfolio-docs/`. A sample file is included.

### 5. Index Documents into Chroma

```bash
npm run index
```

### 6. Run the App

```bash
npm run dev
```

### 7. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
2. Set the webhook URL to: `https://YOUR_DOMAIN/api/webhook`
3. For local dev, use [ngrok](https://ngrok.com): `ngrok http 3000` then use `https://xxx.ngrok.io/api/webhook`

## Project Structure

```
/app/page.tsx               # Web chat UI
/app/api/webhook/route.ts   # Twilio webhook (WhatsApp)
/app/api/chat/route.ts      # Chat API for web frontend
/app/api/messages/route.ts  # Poll messages (WhatsApp → web)
/lib/bot.ts                 # Shared RAG + reply logic
/lib/redis.ts               # Message storage (Upstash)
/lib/twilio-send.ts         # Send WhatsApp (web → WhatsApp mirror)
/lib/openai.ts              # OpenAI client
/lib/rag.ts                 # RAG: chunk, index, retrieve
/lib/vector.ts              # Chroma client
/data/portfolio-docs/       # Your .txt / .md files
/scripts/index-portfolio.ts # Indexing script
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. For Chroma: use [Chroma Cloud](https://trychroma.com) and set `CHROMA_URL`
5. Set Twilio webhook to `https://your-app.vercel.app/api/webhook`
