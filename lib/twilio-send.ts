/**
 * Send WhatsApp message via Twilio (for web → WhatsApp mirror)
 */

import twilio from "twilio";

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!sid || !token || !from) return false;

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  try {
    const client = twilio(sid, token);
    await client.messages.create({
      from,
      to: toFormatted,
      body,
    });
    return true;
  } catch (e) {
    console.error("Twilio send error:", e);
    return false;
  }
}
