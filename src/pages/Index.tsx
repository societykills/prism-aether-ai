import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import NovaOrb from "@/components/nova/NovaOrb";
import ModeSelector, { AssistantMode } from "@/components/nova/ModeSelector";
import ChatPanel from "@/components/nova/ChatPanel";
import ToolsPanel from "@/components/nova/ToolsPanel";
import ActivityLog, { LogEntry } from "@/components/nova/ActivityLog";
import StatusBar from "@/components/nova/StatusBar";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<AssistantMode>("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "system", text: "NOVA AI initialized", time: new Date().toLocaleTimeString() },
    { id: "2", type: "system", text: "All systems operational", time: new Date().toLocaleTimeString() },
  ]);

  const addLog = useCallback((type: LogEntry["type"], text: string) => {
    setLogs((prev) => [
      { id: crypto.randomUUID(), type, text, time: new Date().toLocaleTimeString() },
      ...prev,
    ].slice(0, 50));
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
    toast.success(`${toolNames[toolId]} activated`, {
      description: "Tool is ready for use in chat.",
    });
  };

  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode);
    addLog("system", `Switched to ${newMode.toUpperCase()} mode`);
  };

  return (
    <div className="h-screen flex flex-col bg-background nova-grid-bg overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 nova-scanline pointer-events-none z-50 opacity-30" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 glass-strong border-b border-border z-10"
      >
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg font-bold tracking-wider glow-text text-primary">
            NOVA<span className="text-foreground/80 ml-1.5 text-sm font-normal">AI</span>
          </h1>
          <div className="h-4 w-px bg-border" />
          <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
        </div>
        <div className="flex items-center gap-3">
          <NovaOrb isProcessing={isProcessing} isSpeaking={false} />
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat - main area */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col min-w-0"
        >
          <ChatPanel mode={mode} />
        </motion.main>

        {/* Right sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-72 border-l border-border p-4 space-y-4 overflow-y-auto hidden lg:block"
        >
          <ToolsPanel onToolSelect={handleToolSelect} />
          <ActivityLog entries={logs} />

          {/* AI Suggestions */}
          <div className="glass rounded-xl p-4 glow-box">
            <h3 className="text-xs font-display tracking-widest text-nova-glow-secondary/70 uppercase mb-3">
              AI Suggestions
            </h3>
            <div className="space-y-2">
              {["Review daily metrics", "Optimize workflow", "Generate report"].map((s, i) => (
                <motion.button
                  key={s}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  → {s}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Status bar */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-2 z-10"
      >
        <StatusBar />
      </motion.footer>
    </div>
  );
};

export default Index;
