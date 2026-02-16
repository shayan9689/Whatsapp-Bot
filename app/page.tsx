"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "./components/ThemeContext";
import Logo from "./components/Logo";

type Message = {
  role: "user" | "assistant";
  content: string;
  source: "web" | "whatsapp";
  timestamp: number;
};

const SUGGESTED_PROMPTS = [
  "What are your skills?",
  "Tell me about your projects",
  "How can I contact you?",
  "What's your experience?",
];

export default function ChatPage() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (loading) return;
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        if (data.messages?.length) setMessages(data.messages);
      } catch {
        // Redis not configured - ignore
      }
    };
    fetchMessages();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    if (!text) setInput("");
    setLoading(true);

    const userMsg: Message = {
      role: "user",
      content: msg,
      source: "web",
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        source: "web",
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          source: "web",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem" }}>
      <div
        data-theme={theme}
        className="chat-container"
        style={{
          width: "100%",
          maxWidth: "440px",
          height: "min(90vh, 700px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            background: "var(--bg-header)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <Logo size={44} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Portfolio Assistant
              </h1>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Web + WhatsApp sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleTheme()}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            style={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--bg-input)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === "dark" ? "rgba(51, 65, 85, 0.8)" : "rgba(226, 232, 240, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-input)";
            }}
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </header>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem", 
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            minHeight: 0,
          }}
        >
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "20px", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                How can I help?
              </p>
              <p style={{ margin: "0.5rem 0 1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)", textAlign: "center", maxWidth: 280 }}>
                Ask about skills, projects, or experience. Messages from WhatsApp appear here too.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="prompt-chip"
                    onClick={() => send(prompt)}
                    disabled={loading}
                    style={{
                      padding: "0.5rem 0.875rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "0.8125rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className="msg-enter"
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "88%",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "var(--bg-user-msg)" : "var(--bg-bot-msg)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "0.9375rem",
                  lineHeight: 1.5,
                  boxShadow: msg.role === "user" ? "0 2px 8px rgba(37, 99, 235, 0.25)" : "none",
                }}
              >
                {msg.content}
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-secondary)",
                  marginTop: "0.25rem",
                  display: "block",
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {msg.source === "whatsapp" ? "WhatsApp" : "Web"}
              </span>
            </div>
          ))}
          {loading && (
            <div
              className="msg-enter"
              style={{
                alignSelf: "flex-start",
                padding: "0.875rem 1.125rem",
                borderRadius: "16px 16px 16px 4px",
                background: "var(--bg-bot-msg)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-secondary)" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-secondary)" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-secondary)" }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-header)",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              autoComplete="off"
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
                fontSize: "0.9375rem",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                border: "none",
                background: loading || !input.trim() ? "rgba(59, 130, 246, 0.35)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: loading || !input.trim() ? "none" : "0 2px 8px rgba(37, 99, 235, 0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
