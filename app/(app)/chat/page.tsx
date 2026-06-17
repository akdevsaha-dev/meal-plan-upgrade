"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  console.log("[CHAOS render] ChatPage");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/chat", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .catch(() => { });

    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(() => { });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(customText?: string) {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading || rateLimitError) return;

    setRateLimitError(null);

    const userMessage: Message = { role: "user", content: textToSend };
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    if (!customText) setInput("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          if (!customText) {
            setInput(textToSend);
          }
          setMessages(messages);
          setRateLimitError("Upgrade plan to continue daily limit over");
          setLoading(false);
          return;
        }
        throw new Error(`Chat API error (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const copy = [...prev];
          if (copy.length > 0) {
            copy[copy.length - 1] = {
              role: "assistant",
              content: assistantContent,
            };
          }
          return copy;
        });
      }
    } catch (err) {
      console.error("Failed to stream chat:", err);
      setRateLimitError("Something went wrong. Please check your connection and try again.");
      if (!customText) {
        setInput(textToSend);
      }
      setMessages(messages);
      setLoading(false);
    }
  }

  const suggestions = [
    "Give me a high-protein dinner recipe",
    "Suggest a quick low-carb lunch",
    "Adapt chocolate cake for vegan diet",
  ];

  return (
    <div className="relative flex h-[calc(100vh-64px)] flex-col font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-tr from-amber-50/20 via-stone-50/40 to-orange-50/20 dark:from-neutral-950 dark:via-neutral-900/60 dark:to-neutral-950"
        aria-hidden="true"
      />
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">

        {/* Custom Premium Header */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-neutral-900/75 border-b border-neutral-100 dark:border-neutral-800/60 px-6 py-4 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ChefLogo size={36} priority />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full" />
            </div>
            <div>
              <h1 className="font-extrabold text-neutral-800 dark:text-neutral-100 text-base tracking-tight flex items-center gap-1.5">
                Chef Ferraro
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                Elite AI Culinary Guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Active Assistant
            </span>
          </div>
        </div>

        {/* Chat Message Box */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-12 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-4 bg-gradient-to-tr from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-950 rounded-full shadow-md border border-orange-100/50 dark:border-neutral-800 mb-6">
                  <ChefLogo size={64} priority />
                </div>
                <h2 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
                  Welcome to Chef Ferraro
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md">
                  Your premium AI companion. Ask me to formulate, adapt, scale, or explain recipes and custom cooking procedures.
                </p>

                {/* Onboarding Suggestion Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 w-full max-w-2xl px-4">
                  {suggestions.map((text, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(text)}
                      className="bg-white/60 dark:bg-neutral-900/50 hover:bg-orange-50/50 dark:hover:bg-neutral-800/60 hover:border-orange-200 dark:hover:border-orange-900/40 backdrop-blur-xs border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl p-4 text-xs font-semibold text-neutral-600 dark:text-neutral-300 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.01]"
                    >
                      {text}
                      <span className="block text-orange-500 font-bold mt-2 hover:translate-x-1 transition-transform">
                        Ask &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-neutral-800 border border-orange-200/40 dark:border-neutral-700/40 flex items-center justify-center shrink-0 shadow-xs">
                    <ChefLogo size={20} priority href={null} />
                  </div>
                )}

                <div
                  className={`relative px-4.5 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-tr-none shadow-md shadow-orange-500/10 max-w-[80%]"
                    : "bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-100 dark:border-neutral-800/80 shadow-xs max-w-[80%]"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Premium Thinking/Loading state */}
            {loading && (
              <div className="flex items-start gap-3.5 justify-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-neutral-800 border border-orange-200/40 dark:border-neutral-700/40 flex items-center justify-center shrink-0 shadow-xs">
                  <ChefLogo size={20} priority href={null} />
                </div>
                <div className="bg-white/85 dark:bg-neutral-900/85 rounded-2xl rounded-tl-none border border-neutral-100 dark:border-neutral-800/80 px-5 py-4 flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input and Rate Limit Warnings */}
        <div className="backdrop-blur-md bg-linear-to-t from-white/95 via-white/80 to-transparent dark:from-neutral-950/95 dark:via-neutral-950/80 dark:to-transparent px-6 py-6 border-t border-neutral-100 dark:border-neutral-900/60">
          <div className="max-w-4xl mx-auto space-y-4">

            {/* Custom Banner Rate Limit */}
            {rateLimitError && (
              <div className="bg-red-50/90 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/50 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">
                      Rate Limit Reached
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {rateLimitError}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setRateLimitError(null)}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <Link
                    href="/settings"
                    className="flex-1 sm:flex-initial text-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/10 transition-all cursor-pointer flex items-center justify-center"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}

            {/* Input Floating Panel */}
            <div className={`relative flex items-center bg-white dark:bg-neutral-900/90 border rounded-2xl shadow-xl transition-all duration-300 p-2 ${rateLimitError
              ? "border-red-300/60 dark:border-red-900/40 opacity-75 pointer-events-none"
              : "border-neutral-200/80 dark:border-neutral-800/80 focus-within:ring-3 focus-within:ring-orange-500/15 focus-within:border-orange-500"
              }`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={rateLimitError ? "Limit reached. Upgrade to continue." : "Ask Chef Ferraro anything..."}
                disabled={loading || rateLimitError !== null}
                className="flex-1 border-0 focus:ring-0 text-sm py-2 px-4 bg-transparent placeholder-neutral-400 dark:placeholder-neutral-500 outline-none text-neutral-800 dark:text-neutral-100"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim() || rateLimitError !== null}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">
              Chef Ferraro can make mistakes. Always check key recipes and dietary suggestions.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
