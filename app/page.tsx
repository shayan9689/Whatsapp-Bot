import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const webhookUrl = `${protocol}://${host}/api/webhook`;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "600px" }}>
      <h1>WhatsApp RAG Bot</h1>
      <p>Set this URL in Twilio webhook:</p>
      <code style={{ display: "block", background: "#f4f4f4", padding: "1rem", wordBreak: "break-all" }}>
        {webhookUrl}
      </code>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
        Method: POST · Test: <a href="/api/webhook">/api/webhook</a>
      </p>
    </main>
  );
}
