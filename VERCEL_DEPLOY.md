# Deploy WhatsApp RAG Bot to Vercel

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - WhatsApp RAG Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js—click **Deploy** (or **Configure** if you want to change settings)

## 3. Add Environment Variables

In your Vercel project: **Settings** → **Environment Variables**

Add these (same as your `.env`):

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | your_openai_key |
| `TWILIO_ACCOUNT_SID` | your_twilio_sid |
| `TWILIO_AUTH_TOKEN` | your_twilio_token |
| `TWILIO_WHATSAPP_NUMBER` | whatsapp:+14155238886 |
| `CHROMA_API_KEY` | your_chroma_key |
| `CHROMA_TENANT` | your_tenant_uuid |
| `CHROMA_DATABASE` | whatsappbot |

Apply to: **Production**, **Preview**, **Development**

## 4. Redeploy

After adding env vars: **Deployments** → click **⋯** on latest → **Redeploy**

## 5. Update Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
2. Set **When a message comes in** to:
   ```
   https://YOUR_APP.vercel.app/api/webhook
   ```
   (Replace `YOUR_APP` with your actual Vercel project name)
3. Method: **POST**
4. Save

## Done

Your bot now runs on Vercel—no ngrok needed. Messages go: Phone → Twilio → Vercel → Chroma + OpenAI → Reply.
