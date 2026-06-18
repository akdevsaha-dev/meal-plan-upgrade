"use client";

import ChefLogo from "@/app/components/ChefLogo";
import ChatRecipeCard, { Recipe } from "@/app/components/ChatRecipeCard";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChatSkeleton } from "@/app/components/Skeletons";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const BACKGROUNDS = ["cui1", "cui2", "cui3", "gallery"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [usage, setUsage] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [bgImage, setBgImage] = useState<string>("cui1");
  const [showBgSelector, setShowBgSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Sync background selection with localStorage
  useEffect(() => {
    const savedBg = localStorage.getItem("chat-bg");
    if (savedBg && [...BACKGROUNDS, "none"].includes(savedBg)) {
      setBgImage(savedBg);
    }
  }, []);

  const handleBgChange = (bg: string) => {
    setBgImage(bg);
    localStorage.setItem("chat-bg", bg);
  };

  // Close selector dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowBgSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("/api/chat", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
          }
          if (data.recipes) {
            const recipeMap: Record<string, Recipe> = {};
            data.recipes.forEach((r: Recipe) => {
              recipeMap[r.id] = r;
            });
            setRecipes(recipeMap);
          }
        })
        .catch((err) => {
          console.error("Failed to load chat history:", err);
        })
        .finally(() => {
          setIsInitialLoading(false);
        });

      fetch("/api/usage", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setUsage(data);
            const { usage: u, limits: l, plan } = data;
            const upgradeMessage = " Upgrade to the Pro Plan to unlock higher limits and unlimited features.";
            if (l.chatsPerMonth !== null && l.chatsPerMonth !== undefined && u.chatsMonth >= l.chatsPerMonth) {
              setRateLimitError(`Monthly Chef Ferraro chat limit reached (${u.chatsMonth}/${l.chatsPerMonth}).${plan === "free" ? upgradeMessage : ""}`);
            } else if (l.recipesPerDay !== null && l.recipesPerDay !== undefined && u.recipesToday >= l.recipesPerDay) {
              setRateLimitError(`Daily recipe limit reached (${u.recipesToday}/${l.recipesPerDay}).${plan === "free" ? upgradeMessage : ""}`);
            } else if (l.recipesPerMonth !== null && l.recipesPerMonth !== undefined && u.recipesMonth >= l.recipesPerMonth) {
              setRateLimitError(`Monthly recipe limit reached (${u.recipesMonth}/${l.recipesPerMonth}).${plan === "free" ? upgradeMessage : ""}`);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load usage data:", err);
        });
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
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || "Recipe limit reached. Please upgrade to Pro.";
          if (!customText) {
            setInput(textToSend);
          }
          setMessages(messages);
          setRateLimitError(errMsg);
          setLoading(false);
          return;
        }
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

      const recipeDataHeader = res.headers.get("X-Recipe-Data");
      if (recipeDataHeader) {
        try {
          const recipe: Recipe = JSON.parse(decodeURIComponent(recipeDataHeader));
          setRecipes((prev) => ({
            ...prev,
            [recipe.id]: recipe,
          }));
        } catch (e) {
          console.error("Failed to parse recipe data header:", e);
        }
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

  function getMessageRecipeId(content: string): string | null {
    const match = content.match(/<!-- recipeId:(.*?) -->/);
    return match ? match[1] : null;
  }

  function cleanMessageContent(content: string): string {
    return content.replace(/<!-- recipeId:(.*?) -->/g, "").trim();
  }

  const suggestions = [
    "Give me a high-protein dinner recipe",
    "Suggest a quick low-carb lunch",
    "Adapt chocolate cake for vegan diet",
  ];

  return (
    <div className="relative flex h-screen flex-col font-sans overflow-hidden bg-[#FAF9F6] text-neutral-800 select-none">

      <div className="h-20 backdrop-blur-md bg-[#FAF9F6]/85 border-b border-neutral-200/40 px-6 sm:px-12 flex justify-between items-center relative z-20">

        <div className="flex items-center gap-6">
          <Link
            href="/recipes"
            className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-neutral-500 hover:text-black transition-colors uppercase select-none"
            aria-label="Back to Recipes"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </Link>

          <div className="h-6 w-[1px] bg-neutral-200" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <ChefLogo size={32} priority href={null} />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full shadow-sm" />
            </div>
            <div>
              <h1 className="font-extrabold text-neutral-900 text-xs tracking-[0.25em] leading-none uppercase">
                Chef Ferraro
              </h1>
              <p className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                Elite AI Culinary Guide
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-30" ref={selectorRef}>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-orange-200/45 bg-orange-50/50 text-orange-600 text-[8.5px] font-bold uppercase tracking-[0.15em] select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Active Assistant
          </span>

          <button
            onClick={() => setShowBgSelector(!showBgSelector)}
            className="group flex items-center gap-2.5 px-4 py-2.5 bg-white border border-neutral-300 hover:border-black text-neutral-800 transition-all text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer shadow-3xs"
            aria-label="Switch background canvas"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>CANVAS</span>
          </button>

          {showBgSelector && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-neutral-300 rounded-none p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-3 py-2 select-none border-b border-neutral-100 pb-2.5 mb-2.5">
                Choose Backdrop
              </p>
              <div className="space-y-1">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => {
                      handleBgChange(bg);
                      setShowBgSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-[9px] font-bold uppercase tracking-[0.15em] text-left transition-all cursor-pointer ${bgImage === bg
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                      }`}
                  >
                    <span
                      className="w-5 h-5 rounded-none border border-neutral-200 bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('/images/${bg}.png')` }}
                    />
                    <span className="truncate">{bg === "gallery" ? "Art Gallery" : `Backdrop ${bg.replace("cui", "")}`}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    handleBgChange("none");
                    setShowBgSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-[9px] font-bold uppercase tracking-[0.15em] text-left transition-all cursor-pointer ${bgImage === "none"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                    }`}
                >
                  <span className="w-5 h-5 rounded-none border border-neutral-200 bg-[#FAF9F6] shrink-0" />
                  <span className="truncate">Solid Canvas (default)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative z-10">

        <div className="relative flex-1 max-w-5xl w-full mx-auto flex flex-col overflow-hidden bg-white border-x border-neutral-200/60 shadow-2xs">

          {BACKGROUNDS.map((bg) => (
            <div
              key={bg}
              className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out pointer-events-none"
              style={{
                backgroundImage: `url('/images/${bg}.png')`,
                opacity: bgImage === bg ? 0.45 : 0,
              }}
            />
          ))}

          {/* Clean watermark overlay */}
          <div
            className="absolute inset-0 z-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none transition-opacity duration-1000 ease-in-out"
            style={{ opacity: bgImage === "none" ? 0 : 1 }}
          />

          {/* Scrollable Message History Area */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 space-y-6 min-h-0">
            <div className="max-w-4xl mx-auto space-y-6">

              {isInitialLoading ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-12 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-4 bg-orange-50/50 border border-orange-100/50 rounded-full shadow-xs mb-6">
                    <ChefLogo size={64} priority href={null} />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-800 tracking-tight uppercase">
                    Welcome to Chef Ferraro
                  </h2>
                  <p className="text-xs text-neutral-500 mt-3 max-w-md font-medium leading-relaxed tracking-wide">
                    Your premium AI companion. Ask me to formulate, adapt, scale, or explain recipes and custom cooking procedures.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl px-4">
                    {suggestions.map((text, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(text)}
                        className="bg-white/80 hover:bg-orange-50/50 border border-neutral-200/60 rounded-2xl p-4 text-xs font-bold text-neutral-750 text-left transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.01]"
                      >
                        {text}
                        <span className="block text-orange-600 font-extrabold mt-3 hover:translate-x-1 transition-transform">
                          Ask &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((msg, i) => {
                const recipeId = getMessageRecipeId(msg.content);
                const cleanText = cleanMessageContent(msg.content);
                const associatedRecipe = recipeId ? recipes[recipeId] : null;

                return (
                  <div key={i} className="space-y-4">
                    {/* Text bubble */}
                    <div
                      className={`flex items-start gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                    >
                      {/* Assistant Avatar */}
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 shadow-xs">
                          <ChefLogo size={20} priority href={null} />
                        </div>
                      )}

                      <div
                        className={`relative px-5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${msg.role === "user"
                          ? "bg-neutral-900 text-white rounded-tr-none max-w-[80%]"
                          : "bg-white/95 border border-neutral-200/60 text-neutral-800 rounded-tl-none max-w-[85%]"
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{cleanText}</p>
                      </div>

                      {/* User Avatar */}
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          U
                        </div>
                      )}
                    </div>

                    {/* Render recipe card directly below the assistant message bubble */}
                    {associatedRecipe && (
                      <div className="flex justify-start pl-11.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ChatRecipeCard recipe={associatedRecipe} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Premium Thinking/Loading state */}
              {loading && (
                <div className="flex items-start gap-3.5 justify-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 shadow-xs">
                    <ChefLogo size={20} priority href={null} />
                  </div>
                  <div className="bg-white/95 border border-neutral-200/60 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Input and Rate Limit Warnings */}
          <div className="relative z-10 backdrop-blur-md bg-white/95 border-t border-neutral-200/60 px-6 py-5">
            <div className="max-w-4xl mx-auto space-y-3.5">

              {/* Custom Banner Rate Limit */}
              {rateLimitError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        Rate Limit Reached
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {rateLimitError}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setRateLimitError(null)}
                      className="flex-1 sm:flex-initial px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <Link
                      href="/settings"
                      className="flex-1 sm:flex-initial text-center bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/10 transition-all cursor-pointer flex items-center justify-center"
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}

              {/* Input Floating Panel */}
              <div className={`relative flex items-center bg-white border transition-all duration-300 p-1 ${rateLimitError
                ? "border-red-200 opacity-75 pointer-events-none rounded-none"
                : "border-neutral-300 focus-within:border-neutral-900 rounded-none"
                }`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={rateLimitError ? "LIMIT REACHED. UPGRADE TO CONTINUE." : "ASK CHEF FERRARO ANYTHING..."}
                  disabled={loading || rateLimitError !== null}
                  className="flex-1 border-none focus:ring-0 text-xs py-3.5 px-4 bg-transparent placeholder-neutral-300 outline-none text-neutral-850 font-medium tracking-widest uppercase"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim() || rateLimitError !== null}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3.5 rounded-none transition-all duration-200 active:scale-98 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0 border border-neutral-900 text-[10px] font-bold tracking-[0.2em] uppercase"
                  aria-label="Send message"
                >
                  SEND
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-400 font-semibold select-none tracking-wide uppercase">
                Chef Ferraro can make mistakes. Always check key recipes and dietary suggestions.
              </p>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
