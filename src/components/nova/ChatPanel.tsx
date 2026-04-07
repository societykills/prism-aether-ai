import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage, { Message } from "./ChatMessage";
import WaveformVisualizer from "./WaveformVisualizer";
import type { AssistantMode } from "./ModeSelector";

interface ChatPanelProps {
  mode: AssistantMode;
}

const modePrompts: Record<AssistantMode, string> = {
  general: "How can I assist you today?",
  business: "Ready for business operations. What do you need?",
  developer: "Developer mode active. What shall we build?",
  trading: "Markets loaded. What's your play?",
  creative: "Creative engine online. Let's create something remarkable.",
};

const modeResponses: Record<AssistantMode, string[]> = {
  general: [
    "Done. I've analyzed your request and here's what I recommend.",
    "Processing complete. Here's my assessment.",
    "Understood. Let me break that down for you.",
  ],
  business: [
    "I've drafted that for you. Review and approve when ready.",
    "Strategy analysis complete. Three key insights emerged.",
    "Revenue projection updated. Numbers look promising.",
  ],
  developer: [
    "Code optimized. Reduced complexity by 40%.",
    "Bug identified. Deploying fix now.",
    "Architecture reviewed. I recommend a microservices approach.",
  ],
  trading: [
    "Market sentiment: cautiously bullish. Key levels identified.",
    "Pattern detected. Historical accuracy: 73%.",
    "Risk assessment complete. Position sizing adjusted.",
  ],
  creative: [
    "Content generated. Three variations ready for review.",
    "Design concept finalized. Clean, modern, impactful.",
    "Copy written. Conversion-optimized with A/B variants.",
  ],
};

const ChatPanel = ({ mode }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsProcessing(true);
    const responses = modeResponses[mode];
    const response = responses[Math.floor(Math.random() * responses.length)];

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    // Stream character by character
    let streamed = "";
    const assistantId = crypto.randomUUID();
    
    for (let i = 0; i < response.length; i++) {
      streamed += response[i];
      const partial = streamed;
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantId);
        if (existing) {
          return prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m));
        }
        return [...prev, { id: assistantId, role: "assistant", content: partial, timestamp: new Date() }];
      });
      await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
    }

    setIsProcessing(false);
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    simulateResponse(input.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <p className="text-sm text-muted-foreground font-mono">{modePrompts[mode]}</p>
          </motion.div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isProcessing && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-primary font-mono"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            NOVA is thinking...
          </motion.div>
        )}
      </div>

      {/* Waveform */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4"
          >
            <WaveformVisualizer isActive={isListening} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-2.5 rounded-lg transition-all ${
              isListening
                ? "bg-primary text-primary-foreground glow-box-strong"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message NOVA [${mode.toUpperCase()}]...`}
            className="flex-1 bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:glow-border focus:ring-1 focus:ring-primary/30 font-mono"
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed glow-box"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
