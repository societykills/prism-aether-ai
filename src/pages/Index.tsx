import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, MessageSquare, ChevronDown, Upload, FileText, X } from "lucide-react";
import NovaOrb from "@/components/nova/NovaOrb";
import ParticleField from "@/components/nova/ParticleField";
import ModeSelector, { AssistantMode } from "@/components/nova/ModeSelector";
import ChatPanel from "@/components/nova/ChatPanel";
import ToolsPanel from "@/components/nova/ToolsPanel";
import ActivityLog, { LogEntry } from "@/components/nova/ActivityLog";
import StatusBar from "@/components/nova/StatusBar";
import TerminalPanel from "@/components/nova/TerminalPanel";
import { toast } from "sonner";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const Index = () => {
  const [mode, setMode] = useState<AssistantMode>("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const dragCounter = useRef(0);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = useCallback((files: FileList) => {
    const newFiles: DroppedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setDroppedFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      addLog("tool", `File received: ${f.name}`);
    });
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} received`, {
      description: "Files ready for processing.",
    });
  }, [addLog]);

  const removeFile = (id: string) => {
    setDroppedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  return (
    <div
      className="h-screen flex flex-col bg-background nova-grid-bg overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Particle field */}
      <ParticleField count={60} active />

      {/* Ambient glow effects */}
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(190 100% 50% / 0.06), transparent 70%)" }} />
      <div className="fixed bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(260 80% 60% / 0.05), transparent 70%)" }} />

      {/* Scanline overlay */}
      <div className="fixed inset-0 nova-scanline pointer-events-none z-50 opacity-15" />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: "hsl(222 47% 4% / 0.85)" }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 p-12 rounded-2xl border-2 border-dashed border-primary/50"
              style={{ boxShadow: "0 0 60px hsl(190 100% 50% / 0.2), inset 0 0 40px hsl(190 100% 50% / 0.05)" }}
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Upload className="w-16 h-16 text-primary" />
              </motion.div>
              <p className="font-display text-xl text-primary tracking-widest glow-text">DROP FILES HERE</p>
              <p className="text-sm text-muted-foreground font-mono">NOVA will analyze your files</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-2.5 z-10 relative"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="font-display text-sm font-bold tracking-[0.3em] text-primary/60">NOVA</h1>
            <span className="text-[9px] font-mono text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
          <motion.button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`p-2 rounded-lg transition-all ${
              terminalOpen ? "bg-primary/20 text-primary glow-border" : "text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Terminal className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative z-[1]">
        {/* Center stage */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!chatOpen ? (
              <motion.div
                key="orb-view"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <NovaOrb
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  size="lg"
                  onClick={() => setChatOpen(true)}
                />

                {/* Dropped files display */}
                <AnimatePresence>
                  {droppedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-wrap justify-center gap-2 max-w-lg"
                    >
                      {droppedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass glow-border text-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono text-foreground max-w-[120px] truncate">{file.name}</span>
                          <span className="text-muted-foreground text-[10px]">{formatFileSize(file.size)}</span>
                          <button onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick actions */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2 mt-2 max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {["What can you do?", "Help me code", "Search the web", "Write an email"].map((q, i) => (
                    <motion.button
                      key={q}
                      onClick={() => setChatOpen(true)}
                      className="text-xs px-4 py-2 rounded-full glass glow-border text-primary/70 hover:text-primary transition-all hover:bg-primary/5"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-primary/30 mr-1">→</span>{q}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.button
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="font-mono">Open Chat Interface</span>
                  <ChevronDown className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <NovaOrb isProcessing={isProcessing} isSpeaking={isSpeaking} size="sm" />
                    <div>
                      <p className="text-xs font-display text-primary/80 tracking-widest">NOVA AI</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : `${mode.toUpperCase()} MODE`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* File chips in chat mode */}
                    {droppedFiles.length > 0 && (
                      <div className="flex gap-1 mr-2">
                        {droppedFiles.slice(0, 3).map((f) => (
                          <span key={f.id} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded glass text-primary/70">
                            <FileText className="w-2.5 h-2.5" />
                            {f.name.length > 10 ? f.name.slice(0, 10) + "…" : f.name}
                          </span>
                        ))}
                        {droppedFiles.length > 3 && (
                          <span className="text-[10px] font-mono text-muted-foreground px-1">+{droppedFiles.length - 3}</span>
                        )}
                      </div>
                    )}
                    <motion.button
                      onClick={() => setChatOpen(false)}
                      className="text-xs font-mono text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg glass transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      ← Back to Orb
                    </motion.button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatPanel
                    mode={mode}
                    onProcessingChange={setIsProcessing}
                    onSpeakingChange={setIsSpeaking}
                    onLog={addLog}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal overlay */}
          <AnimatePresence>
            {terminalOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 z-20"
              >
                <TerminalPanel isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="w-64 border-l border-primary/10 p-3 space-y-3 overflow-y-auto hidden lg:block bg-background/30 backdrop-blur-sm"
        >
          <ToolsPanel onToolSelect={handleToolSelect} />
          <ActivityLog entries={logs} />

          <div className="glass rounded-xl p-3">
            <h3 className="text-[10px] font-display tracking-widest text-primary/40 uppercase mb-2">System</h3>
            <div className="space-y-2">
              {[
                { label: "CPU", value: 82 },
                { label: "GPU", value: 94 },
                { label: "MEM", value: 64 },
              ].map((m) => (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                    <span>{m.label}</span>
                    <span className="text-primary/60">{m.value}%</span>
                  </div>
                  <div className="h-0.5 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/50 rounded-full"
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
        className="px-4 py-1 z-10 relative"
      >
        <StatusBar />
      </motion.footer>
    </div>
  );
};

export default Index;
