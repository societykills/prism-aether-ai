import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Search, Volume2, VolumeX, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage, { Message } from "./ChatMessage";
import WaveformVisualizer from "./WaveformVisualizer";
import type { AssistantMode } from "./ModeSelector";
import { streamChat, streamSearch } from "@/lib/nova-api";
import { useSpeechRecognition, useWakeWord, useActiveListening, speak, stopSpeaking } from "@/hooks/use-speech";
import { toast } from "sonner";
import { getCustomInstructions } from "./CustomInstructionsPanel";

const MESSAGES_KEY = "nova-chat-messages";

interface ChatPanelProps {
  mode: AssistantMode;
  onProcessingChange?: (processing: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onLog?: (type: "chat" | "tool" | "system", text: string) => void;
}

const modeGreetings: Record<AssistantMode, string> = {
  general: "I'm NOVA. Say \"Hey NOVA\" or type to begin.",
  business: "Business systems online. Say \"Hey NOVA\" to begin.",
  developer: "Developer mode active. Say \"Hey NOVA\" to begin.",
  trading: "Markets loaded. Say \"Hey NOVA\" to begin.",
  creative: "Creative engine initialized. Say \"Hey NOVA\" to begin.",
};

const ChatPanel = ({ mode, onProcessingChange, onSpeakingChange, onLog }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [];
  });
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Default ON for conversational feel
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [wakeDetected, setWakeDetected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { isActive: isActiveListening, activeTranscript, listen: activeListen } = useActiveListening();

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Stable handleStream that reads from ref
  const handleStream = useCallback(async (userText: string, fromVoice = false) => {
    if (!userText.trim() || isProcessing) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);
    onLog?.("chat", `User: ${userText.trim().slice(0, 40)}...`);

    let assistantSoFar = "";
    const assistantId = crypto.randomUUID();

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const content = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId) {
          return prev.map((m) => (m.id === assistantId ? { ...m, content } : m));
        }
        return [...prev, { id: assistantId, role: "assistant", content, timestamp: new Date() }];
      });
    };

    const shouldSpeak = voiceEnabled || fromVoice;

    const onDone = () => {
      setIsProcessing(false);
      onLog?.("chat", `NOVA responded (${assistantSoFar.length} chars)`);
      if (shouldSpeak && assistantSoFar) {
        const speakText = assistantSoFar.replace(/[#*`_\[\]]/g, "").slice(0, 500);
        setIsSpeaking(true);
        speak(speakText, () => {
          setIsSpeaking(false);
        });
      }
    };

    const onError = (err: string) => {
      setIsProcessing(false);
      toast.error(err);
      onLog?.("system", `Error: ${err}`);
    };

    if (isSearchMode) {
      onLog?.("tool", `Searching: ${userText.trim().slice(0, 40)}`);
      await streamSearch({ query: userText.trim(), onDelta: upsert, onDone, onError });
    } else {
      const currentMsgs = messagesRef.current;
      const apiMsgs = [...currentMsgs, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const customInstructions = getCustomInstructions();
      await streamChat({ messages: apiMsgs, mode, customInstructions, onDelta: upsert, onDone, onError });
    }
  }, [isProcessing, mode, isSearchMode, voiceEnabled, onLog]);

  // Wake word handler
  const handleWake = useCallback((followUp: string) => {
    setWakeDetected(true);
    onLog?.("system", "Wake word detected: Hey NOVA");
    toast.success("Hey NOVA!", { description: "I'm listening...", duration: 2000 });
    
    // Play a subtle activation sound via TTS
    if (followUp.trim()) {
      // User already said something after "Hey NOVA"
      setTimeout(() => {
        setWakeDetected(false);
        handleStream(followUp, true);
      }, 300);
    } else {
      // Wait for user to say their command
      setTimeout(() => {
        activeListen((text) => {
          setWakeDetected(false);
          handleStream(text, true);
        });
      }, 200);
    }
  }, [handleStream, activeListen, onLog]);

  // Wake word listener — paused while processing or speaking
  const { isPassiveListening } = useWakeWord(
    handsFree,
    handleWake,
    isProcessing || isSpeaking || isActiveListening || isListening
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-100)));
    } catch {}
  }, [messages]);

  useEffect(() => { onProcessingChange?.(isProcessing); }, [isProcessing, onProcessingChange]);
  useEffect(() => { onSpeakingChange?.(isSpeaking); }, [isSpeaking, onSpeakingChange]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  const handleSend = () => handleStream(input);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalText) => {
        handleStream(finalText, true);
      });
    }
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    if (next) {
      setVoiceEnabled(true);
      toast.success("Hands-free mode ON", { description: "Say \"Hey NOVA\" to talk anytime." });
      onLog?.("system", "Hands-free voice mode activated");
    } else {
      toast.info("Hands-free mode OFF");
      onLog?.("system", "Hands-free voice mode deactivated");
    }
  };

  const isAnyListening = isListening || isActiveListening || wakeDetected;

  return (
    <div className="flex flex-col h-full">
      {/* Hands-free status bar */}
      <AnimatePresence>
        {handsFree && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-2"
          >
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg glass text-[10px] font-mono">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: isPassiveListening ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                animate={isPassiveListening ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-primary/70">
                {isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : isActiveListening ? "Listening to you..." : wakeDetected ? "Wake detected..." : isPassiveListening ? "Listening for \"Hey NOVA\"..." : "Starting microphone..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-4"
          >
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 30% 30%, hsl(190 100% 50% / 0.2), hsl(260 80% 60% / 0.1), transparent)",
                boxShadow: "0 0 40px hsl(190 100% 50% / 0.15)",
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="font-display text-2xl text-primary glow-text">N</span>
            </motion.div>
            <p className="text-sm text-muted-foreground font-mono max-w-md">{modeGreetings[mode]}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["What can you do?", "Help me code", "Search the web"].map((q) => (
                <motion.button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1.5 rounded-full glass glow-border text-primary/80 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
            {!handsFree && (
              <motion.button
                onClick={toggleHandsFree}
                className="flex items-center gap-2 mt-3 text-xs px-4 py-2 rounded-full glass glow-border text-primary/60 hover:text-primary transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <Radio className="w-3.5 h-3.5" />
                Enable hands-free voice
              </motion.button>
            )}
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
            className="flex items-center gap-3 text-xs text-primary font-mono px-4 py-3 glass rounded-xl glow-border"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span>NOVA is {isSearchMode ? "searching" : "processing"}...</span>
          </motion.div>
        )}
      </div>

      {/* Waveform when listening */}
      <AnimatePresence>
        {isAnyListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2"
          >
            <div className="glass rounded-xl p-3 glow-border">
              <p className="text-[10px] font-mono text-primary/70 mb-2 uppercase tracking-widest">
                {wakeDetected ? "● NOVA activated — speak now..." : isActiveListening ? "● Listening to your command..." : "● Listening..."}
              </p>
              {(activeTranscript || transcript) && (
                <p className="text-xs font-mono text-foreground/80 mb-2 italic">"{activeTranscript || transcript}"</p>
              )}
              <WaveformVisualizer isActive={isAnyListening} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4 border-t border-border glass-strong">
        <div className="flex items-center gap-2">
          {/* Hands-free toggle */}
          <motion.button
            onClick={toggleHandsFree}
            className={`p-2.5 rounded-lg transition-all shrink-0 ${
              handsFree
                ? "bg-primary text-primary-foreground glow-box-strong"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
            title={handsFree ? "Disable hands-free" : "Enable hands-free (Hey NOVA)"}
          >
            <Radio className="w-4 h-4" />
          </motion.button>

          {/* Manual voice input */}
          <motion.button
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-lg transition-all shrink-0 ${
              isListening
                ? "bg-primary text-primary-foreground glow-box-strong"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
            title={isListening ? "Stop listening" : "Push to talk"}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </motion.button>

          {/* Search toggle */}
          <motion.button
            onClick={() => setIsSearchMode(!isSearchMode)}
            className={`p-2.5 rounded-lg transition-all shrink-0 ${
              isSearchMode
                ? "bg-nova-glow-secondary text-secondary-foreground glow-box"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
            title={isSearchMode ? "Chat mode" : "Search mode"}
          >
            <Search className="w-4 h-4" />
          </motion.button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isSearchMode ? "Search the web..." : handsFree ? "Say \"Hey NOVA\" or type..." : `Message NOVA [${mode.toUpperCase()}]...`}
              className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono pr-10"
            />
            {isSearchMode && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-display text-nova-glow-secondary/60 uppercase">Search</span>
            )}
          </div>

          {/* Voice output toggle */}
          <motion.button
            onClick={toggleVoiceOutput}
            className={`p-2.5 rounded-lg transition-all shrink-0 ${
              voiceEnabled
                ? "bg-primary/20 text-primary glow-border"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
            title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          {/* Send */}
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed glow-box shrink-0"
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
