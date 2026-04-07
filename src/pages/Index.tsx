import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import NovaOrb from "@/components/nova/NovaOrb";
import ModeSelector, { AssistantMode } from "@/components/nova/ModeSelector";
import ChatPanel from "@/components/nova/ChatPanel";
import ToolsPanel from "@/components/nova/ToolsPanel";
import ActivityLog, { LogEntry } from "@/components/nova/ActivityLog";
import StatusBar from "@/components/nova/StatusBar";
import TerminalPanel from "@/components/nova/TerminalPanel";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<AssistantMode>("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "system", text: "NOVA AI initialized", time: new Date().toLocaleTimeString() },
    { id: "2", type: "system", text: "AI Core: ONLINE", time: new Date().toLocaleTimeString() },
    { id: "3", type: "system", text: "All systems operational", time: new Date().toLocaleTimeString() },
  ]);

  const addLog = useCallback((type: LogEntry["type"], text: string) => {
    setLogs((prev) =>
      [{ id: crypto.randomUUID(), type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50)
    );
  }, []);

  const handleToolSelect = (toolId: string) => {
    const toolNames: Record<string, string> = {
      invoice: "Invoice Generator",
      email: "Email Writer",
      idea: "Idea Engine",
      code: "Code Generator",
      marketing: "Marketing Creator",
      task: "Task Runner",
    };
    addLog("tool", `Launched ${toolNames[toolId]}`);
    toast.success(`${toolNames[toolId]} activated`, { description: "Use in chat to interact." });
  };

  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode);
    addLog("system", `Mode: ${newMode.toUpperCase()}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background nova-grid-bg overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(190 100% 50% / 0.04), transparent 70%)" }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(260 80% 60% / 0.04), transparent 70%)" }} />

      {/* Scanline overlay */}
      <div className="fixed inset-0 nova-scanline pointer-events-none z-50 opacity-20" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-2.5 glass-strong border-b border-primary/10 z-10 relative"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="font-display text-lg font-bold tracking-[0.2em] glow-text text-primary">
              NOVA
            </h1>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">AI</span>
          </div>
          <div className="h-5 w-px bg-border/50" />
          <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
        </div>
        <div className="flex items-center gap-4">
          {/* Terminal toggle */}
          <motion.button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`p-2 rounded-lg transition-all ${
              terminalOpen ? "bg-primary/20 text-primary glow-border" : "glass text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
            title="Toggle Terminal"
          >
            <Terminal className="w-4 h-4" />
          </motion.button>
          <NovaOrb isProcessing={isProcessing} isSpeaking={isSpeaking} />
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative z-[1]">
        {/* Chat */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 flex flex-col min-w-0"
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatPanel
              mode={mode}
              onProcessingChange={setIsProcessing}
              onSpeakingChange={setIsSpeaking}
              onLog={addLog}
            />
          </div>

          {/* Terminal */}
          <AnimatePresence>
            {terminalOpen && <TerminalPanel isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />}
          </AnimatePresence>
        </motion.main>

        {/* Right sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="w-72 border-l border-primary/10 p-4 space-y-4 overflow-y-auto hidden lg:block bg-background/50 backdrop-blur-sm"
        >
          <ToolsPanel onToolSelect={handleToolSelect} />
          <ActivityLog entries={logs} />

          {/* AI Suggestions */}
          <div className="glass rounded-xl p-4 glow-box">
            <h3 className="text-xs font-display tracking-widest text-nova-glow-secondary/70 uppercase mb-3">
              AI Suggestions
            </h3>
            <div className="space-y-1.5">
              {[
                "Analyze my code for bugs",
                "Generate a marketing plan",
                "Search for latest tech news",
                "Write a professional email",
              ].map((s, i) => (
                <motion.button
                  key={s}
                  className="w-full text-left text-xs text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-primary/5 transition-all hover:pl-3"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <span className="text-primary/40 mr-1.5">→</span>{s}
                </motion.button>
              ))}
            </div>
          </div>

          {/* System metrics */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-display tracking-widest text-primary/50 uppercase mb-3">
              System
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "CPU", value: 82 },
                { label: "GPU", value: 94 },
                { label: "Memory", value: 64 },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{m.label}</span>
                    <span className="text-primary/70">{m.value}%</span>
                  </div>
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Status bar */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 py-1.5 z-10 relative"
      >
        <StatusBar />
      </motion.footer>
    </div>
  );
};

export default Index;
