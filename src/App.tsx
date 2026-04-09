import React, { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

type Role = "user" | "assistant";
type Mode = "Fast" | "Deep Think" | "Business" | "Trading" | "Task";

type Message = {
  id: string;
  role: Role;
  text: string;
  time: string;
};

type MemoryItem = {
  id: string;
  text: string;
};

const STORAGE_KEYS = {
  messages: "aura_messages_v1",
  memory: "aura_memory_v1",
  mode: "aura_mode_v1",
  voice: "aura_voice_v1",
  name: "aura_name_v1",
};

const starterMessages: Message[] = [
  {
    id: crypto.randomUUID(),
    role: "assistant",
    text:
      "Good evening. I’m Aura — your premium AI workspace. I can help with ideas, writing, coding, trading-style analysis, task planning, and voice conversations. Try /help to see commands.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const starterMemory: MemoryItem[] = [
  { id: crypto.randomUUID(), text: "Prefers premium dark UI with futuristic styling." },
  { id: crypto.randomUUID(), text: "Wants voice AI, memory, and a powerful product feel." },
];

const modes: Mode[] = ["Fast", "Deep Think", "Business", "Trading", "Task"];

function getNowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildReply(input: string, mode: Mode, memory: MemoryItem[], userName: string) {
  const trimmed = input.trim();

  if (trimmed.startsWith("/help")) {
    return `Available commands:
• /help — show commands
• /clear — clear chat
• /remember <text> — save to memory
• /name <your name> — set your name
• /invoice — quick invoice assistant
• /analyze <market> — quick trading-style analysis
• /plan <goal> — turn a goal into action steps`;
  }

  if (trimmed.startsWith("/invoice")) {
    return `Invoice assistant ready.

Suggested workflow:
1. Add client details
2. Add line items
3. Add tax / discount
4. Add payment terms
5. Generate PDF/export

Want me to draft a sample invoice layout or client message next?`;
  }

  if (trimmed.startsWith("/analyze")) {
    const market = trimmed.replace("/analyze", "").trim() || "the market";
    return `Trading mode analysis for ${market}:

• Trend bias: neutral-to-bullish unless higher timeframe breaks down
• Focus areas: structure, liquidity zones, volume spikes, session timing
• Safer approach: wait for confirmation near key support/resistance
• Risk idea: fixed risk per trade, clear invalidation, no revenge entries

This is product-demo analysis, not financial advice. I can turn this into a more advanced dashboard next.`;
  }

  if (trimmed.startsWith("/plan")) {
    const goal = trimmed.replace("/plan", "").trim() || "your goal";
    return `Execution plan for ${goal}:

1. Define the exact outcome
2. Break it into 3 milestones
3. Identify tools and blockers
4. Complete the first visible version fast
5. Review, improve, repeat

Want me to generate a full weekly plan for this goal?`;
  }

  const memoryText =
    memory.length > 0
      ? `Relevant memory: ${memory.slice(0, 3).map((m) => m.text).join(" | ")}`
      : "No stored memory yet.";

  switch (mode) {
    case "Fast":
      return `Fast mode reply${userName ? ` for ${userName}` : ""}:

You said: "${trimmed}"

Quick answer:
• Main idea: ${trimmed.length > 50 ? trimmed.slice(0, 50) + "..." : trimmed}
• Best next step: keep it simple, make one improvement, test it immediately
• I can expand this if you want a deeper version.`;

    case "Deep Think":
      return `Deep Think mode${userName ? ` for ${userName}` : ""}:

You asked: "${trimmed}"

Here’s a stronger way to approach it:
1. Clarify the real objective
2. Remove anything that adds friction
3. Build the first version around speed, clarity, and trust
4. Add premium polish only after the core works

${memoryText}

My recommendation: focus first on the user experience, then power features, then automation.`;

    case "Business":
      return `Business mode:

Your request: "${trimmed}"

Recommended business framing:
• Outcome: what the product should achieve
• Offer: why people would pay for it
• Positioning: what makes it feel premium
• Retention: what keeps users coming back
• Monetization: free preview, paid pro tools, premium workflows

I can turn this into a landing page, pitch, or feature roadmap next.`;

    case "Trading":
      return `Trading mode:

Topic: "${trimmed}"

Structured response:
• Market context: trend, volatility, catalyst
• Execution: entry, invalidation, target logic
• Risk control: fixed risk, max daily loss, no overtrading
• Review: screenshot trades, track mistakes, improve process

This mode is best paired with charts, journaling, and alerts.`;

    case "Task":
      return `Task mode:

Goal detected: "${trimmed}"

Action steps:
1. Define success in one sentence
2. Do the fastest visible version
3. Remove blockers
4. Review results
5. Improve the next version

Want me to convert this into a checklist or workflow board?`;

    default:
      return `I’m ready to help with "${trimmed}".`;
  }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() =>
    typeof window === "undefined"
      ? starterMessages
      : safeLoad<Message[]>(STORAGE_KEYS.messages, starterMessages)
  );

  const [memory, setMemory] = useState<MemoryItem[]>(() =>
    typeof window === "undefined"
      ? starterMemory
      : safeLoad<MemoryItem[]>(STORAGE_KEYS.memory, starterMemory)
  );

  const [mode, setMode] = useState<Mode>(() =>
    typeof window === "undefined"
      ? "Deep Think"
      : safeLoad<Mode>(STORAGE_KEYS.mode, "Deep Think")
  );

  const [voiceOn, setVoiceOn] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : safeLoad<boolean>(STORAGE_KEYS.voice, false)
  );

  const [userName, setUserName] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : safeLoad<string>(STORAGE_KEYS.name, "")
  );

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memoryPanelOpen, setMemoryPanelOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.memory, JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mode, JSON.stringify(mode));
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.voice, JSON.stringify(voiceOn));
  }, [voiceOn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.name, JSON.stringify(userName));
  }, [userName]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    return `Good ${part}${userName ? `, ${userName}` : ""}. Ready to build something powerful today?`;
  }, [userName]);

  const sendMessage = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isThinking) return;

    if (text.startsWith("/clear")) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Chat cleared. Fresh workspace ready.",
          time: getNowTime(),
        },
      ]);
      setInput("");
      return;
    }

    if (text.startsWith("/remember")) {
      const remembered = text.replace("/remember", "").trim();
      if (remembered) {
        const item = { id: crypto.randomUUID(), text: remembered };
        setMemory((prev) => [item, ...prev]);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", text, time: getNowTime() },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: `Saved to memory: "${remembered}"`,
            time: getNowTime(),
          },
        ]);
      }
      setInput("");
      return;
    }

    if (text.startsWith("/name")) {
      const newName = text.replace("/name", "").trim();
      if (newName) {
        setUserName(newName);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", text, time: getNowTime() },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: `Got it. I’ll call you ${newName}.`,
            time: getNowTime(),
          },
        ]);
      }
      setInput("");
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      time: getNowTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const reply = buildReply(text, mode, memory, userName);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        time: getNowTime(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);

      if (voiceOn && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }, 800);
  };

  const toggleListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const removeMemory = (id: string) => {
    setMemory((prev) => prev.filter((item) => item.id !== id));
  };

  const quickCommand = (command: string) => {
    setCommandOpen(false);

    if (command === "/help") return sendMessage("/help");
    if (command === "/invoice") return sendMessage("/invoice");
    if (command === "/analyze BTCUSD") return sendMessage("/analyze BTCUSD");
    if (command === "/plan Launch premium AI app") return sendMessage("/plan Launch premium AI app");

    setInput(command);
  };

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="brand-row">
          <div className="brand-mark">A</div>
          {sidebarOpen && (
            <div>
              <h1>Aura AI</h1>
              <p>Premium assistant workspace</p>
            </div>
          )}
        </div>

        <button className="ghost-btn full" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? "Collapse Sidebar" : "Open Sidebar"}
        </button>

        {sidebarOpen && (
          <>
            <div className="panel">
              <div className="panel-title">AI Modes</div>
              <div className="mode-list">
                {modes.map((m) => (
                  <button
                    key={m}
                    className={`mode-chip ${mode === m ? "active" : ""}`}
                    onClick={() => setMode(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">Workspace</div>
              <button className="menu-btn" onClick={() => setCommandOpen(true)}>
                Open Command Bar
              </button>
              <button className="menu-btn" onClick={() => sendMessage("/help")}>
                Show Commands
              </button>
              <button className="menu-btn" onClick={() => setMessages(starterMessages)}>
                Reset Demo Chat
              </button>
            </div>

            <div className="panel">
              <div className="panel-title">Memory</div>
              <button
                className="ghost-btn full"
                onClick={() => setMemoryPanelOpen((v) => !v)}
              >
                {memoryPanelOpen ? "Hide Memory" : "Show Memory"}
              </button>

              {memoryPanelOpen && (
                <div className="memory-list">
                  {memory.length === 0 ? (
                    <div className="empty-state">No memory saved yet.</div>
                  ) : (
                    memory.map((item) => (
                      <div key={item.id} className="memory-card">
                        <span>{item.text}</span>
                        <button onClick={() => removeMemory(item.id)}>×</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div>
            <div className="status-line">
              <span className="status-dot" />
              <span>Online</span>
              <span className="separator">•</span>
              <span>{mode} Mode</span>
            </div>
            <h2>{greeting}</h2>
          </div>

          <div className="top-actions">
            <button
              className={`toggle-btn ${voiceOn ? "on" : ""}`}
              onClick={() => setVoiceOn((v) => !v)}
            >
              {voiceOn ? "Voice On" : "Voice Off"}
            </button>
            <button
              className={`toggle-btn ${listening ? "on" : ""}`}
              onClick={toggleListening}
            >
              {listening ? "Listening..." : "Mic"}
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <div className="eyebrow">AURA CORE</div>
            <h3>Futuristic AI with memory, voice, modes, and premium feel.</h3>
            <p>
              This version is built to preview instantly in Lovable and Vite. It includes
              a polished dark UI, local memory, slash commands, voice output, and an
              animated AI presence.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => sendMessage("/help")}>
                Explore Features
              </button>
              <button className="ghost-btn" onClick={() => setCommandOpen(true)}>
                Open Commands
              </button>
            </div>
          </div>

          <div className="orb-zone">
            <div className={`orb ${isThinking ? "thinking" : ""} ${listening ? "listening" : ""}`}>
              <div className="orb-core" />
              <div className="orb-ring orb-ring-1" />
              <div className="orb-ring orb-ring-2" />
            </div>
            <div className="orb-caption">
              {listening ? "Voice input active" : isThinking ? "Aura is thinking..." : "Aura is ready"}
            </div>
          </div>
        </section>

        <section className="chat-shell">
          <div className="chat-toolbar">
            <div className="toolbar-left">
              <span className="pill">Premium UI</span>
              <span className="pill">Memory</span>
              <span className="pill">Voice</span>
              <span className="pill">Slash Commands</span>
            </div>
            <button className="ghost-btn" onClick={() => sendMessage("/clear")}>
              Clear Chat
            </button>
          </div>

          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-row ${message.role === "user" ? "user" : "assistant"}`}
              >
                <div className="message-avatar">
                  {message.role === "user" ? "J" : "A"}
                </div>
                <div className={`message-bubble ${message.role}`}>
                  <div className="message-meta">
                    <strong>{message.role === "user" ? "You" : "Aura"}</strong>
                    <span>{message.time}</span>
                  </div>
                  <div className="message-text">
                    {message.text.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="message-row assistant">
                <div className="message-avatar">A</div>
                <div className="message-bubble assistant thinking-bubble">
                  <div className="message-meta">
                    <strong>Aura</strong>
                    <span>{getNowTime()}</span>
                  </div>
                  <div className="thinking-line">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <div className="composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Aura... Try /help, /remember, /plan, /invoice, /analyze"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="composer-actions">
              <button className="ghost-btn" onClick={toggleListening}>
                {listening ? "Stop Mic" : "Use Mic"}
              </button>
              <button
                className="ghost-btn"
                onClick={() => {
                  if (!input.trim()) return;
                  const item = { id: crypto.randomUUID(), text: input.trim() };
                  setMemory((prev) => [item, ...prev]);
                  setInput("");
                }}
              >
                Remember
              </button>
              <button className="primary-btn" onClick={() => sendMessage()}>
                Send
              </button>
            </div>
          </div>
        </section>
      </main>

      {commandOpen && (
        <div className="command-overlay" onClick={() => setCommandOpen(false)}>
          <div className="command-modal" onClick={(e) => e.stopPropagation()}>
            <div className="command-header">
              <h3>Command Bar</h3>
              <button onClick={() => setCommandOpen(false)}>×</button>
            </div>
            <div className="command-list">
              <button onClick={() => quickCommand("/help")}>/help</button>
              <button onClick={() => quickCommand("/invoice")}>/invoice</button>
              <button onClick={() => quickCommand("/analyze BTCUSD")}>/analyze BTCUSD</button>
              <button onClick={() => quickCommand("/plan Launch premium AI app")}>
                /plan Launch premium AI app
              </button>
              <button onClick={() => quickCommand("/remember I want a Jarvis-style AI app")}>
                /remember I want a Jarvis-style AI app
              </button>
              <button onClick={() => quickCommand("/name Jude")}>/name Jude</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
