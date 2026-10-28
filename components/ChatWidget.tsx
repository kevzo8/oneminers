"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, MessageCircle, Sparkles, X } from "lucide-react";
import { chatSuggestions } from "@/lib/data";

type Message = { role: "user" | "assistant"; content: string };

const initial: Message = {
  role: "assistant",
  content:
    "Hi — I'm the OneMiners assistant. Ask me about the demo site inventory, hosting terms, power costs, or run the numbers with you.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initial]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("oneminers:open-chat", openChat);
    return () => window.removeEventListener("oneminers:open-chat", openChat);
  }, []);

  async function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;

    const next: Message[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || "The assistant is unavailable.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`fixed bottom-6 right-6 z-[100] grid h-14 w-14 place-items-center rounded-full shadow-2xl transition-transform hover:scale-105 ${
          open ? "bg-white text-[#05070a]" : "bg-accent text-[#08120a] pulse-ring"
        }`}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open ? (
        <div className="fixed bottom-20 right-6 z-50 flex max-h-[min(560px,calc(100vh-10rem))] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-[#080d12]/95 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-accent/10">
                <Bot className="h-4 w-4 text-accent" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
              </span>
              <div>
                <div className="text-xs font-bold text-ink">OneMiners assistant</div>
                <div className="text-[10px] text-muted">Answers from site data</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-accent text-[#08120a]"
                      : "rounded-bl-md border border-line bg-white/[0.04] text-ink"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {busy ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white/[0.04] px-4 py-3">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-[11px] text-red-300">{error}</p> : null}

            {messages.length === 1 && !busy ? (
              <div className="pt-1">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <Sparkles className="h-3 w-3 text-accent" />
                  Try asking
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chatSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="border-t border-line p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 py-2 focus-within:border-accent/40">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about sites, hosting, profit..."
                className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted/60"
                aria-label="Message the assistant"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-[#08120a] transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-muted/60">
              Demo AI · answers from the site's own data
            </p>
          </form>
        </div>
      ) : null}
    </>
  );
}
