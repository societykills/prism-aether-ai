import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Upload, PanelLeftClose, PanelRightClose } from "lucide-react";
import ParticleField from "@/components/nova/ParticleField";
import ModeSelector, { AssistantMode } from "@/components/nova/ModeSelector";
import ChatPanel from "@/components/nova/ChatPanel";
import { LogEntry } from "@/components/nova/ActivityLog";
import StatusBar from "@/components/nova/StatusBar";
import TerminalPanel from "@/components/nova/TerminalPanel";
import CustomInstructionsPanel from "@/components/nova/CustomInstructionsPanel";
import ProjectStateSidebar from "@/components/nova/ProjectStateSidebar";
import LivePreviewPanel from "@/components/nova/LivePreviewPanel";
import NovaOrb from "@/components/nova/NovaOrb";
import { toast } from "sonner";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  analysis: string;
}

const Index = () => {
  const [mode, setMode] = useState<AssistantMode>("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const dragCounter = useRef(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "system", text: "NOVA initialized", time: new Date().toLocaleTimeString() },
    { id: "2", type: "system", text: "Clock synced", time: new Date().toLocaleTimeString() },
    { id: "3", type: "system", text: "All systems nominal", time: new Date().toLocaleTimeString() },
  ]);

  const addLog = useCallback((type: LogEntry["type"], text: string) => {
    setLogs((prev) =>
      [{ id: crypto.randomUUID(), type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50)
    );
  }, []);

  const analyzeFile = useCallback((file: DroppedFile) => {
    setIsAnalyzing(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const typeMap: Record<string, string> = {
      js: "JavaScript source", ts: "TypeScript source", tsx: "React component",
      jsx: "React component", py: "Python script", json: "JSON data",
      csv: "CSV dataset", md: "Markdown document", html: "HTML document",
      css: "Stylesheet", sql: "SQL query", txt: "Plain text",
      pdf: "PDF document", png: "Image", jpg: "Image", svg: "SVG vector",
    };
    const fileType = typeMap[ext] || `${ext.toUpperCase()} file`;
    const sizeKB = (file.size / 1024).toFixed(1);

    setTimeout(() => {
      const analysis: FileAnalysis = {
        name: file.name,
        size: file.size,
        type: file.type,
        analysis: `${fileType} detected (${sizeKB} KB). Structure indexed and ready for contextual reference. Optimization points: compression ratio, modular imports, and caching strategy applicable.`,
      };
      setFileAnalyses((prev) => [...prev, analysis]);
      setIsAnalyzing(false);
      addLog("tool", `Analyzed: ${file.name} → ${fileType}`);
    }, 800 + Math.random() * 600);
  }, [addLog]);

  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode);
    addLog("system", `Mode: ${newMode.toUpperCase()}`);
  };

  const processFiles = useCallback((files: FileList) => {
    const newFiles: DroppedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type,
    }));
    setDroppedFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      addLog("tool", `File injected: ${f.name}`);
      analyzeFile(f);
    });
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} injected & analyzing`);
    setRightPanelOpen(true);
  }, [addLog, analyzeFile]);

  const removeFile = (id: string) => setDroppedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); dragCounter.current = 0;
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  return (
    <div
      className="h-screen flex flex-col bg-background nova-grid-bg overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ParticleField count={40} active />

      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, hsl(190 100% 50% / 0.04), transparent 70%)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, hsl(260 80% 60% / 0.03), transparent 70%)" }} />
      <div className="fixed inset-0 nova-scanline pointer-events-none z-50 opacity-10" />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "hsl(222 47% 4% / 0.9)" }}>
            <motion.div className="flex flex-col items-center gap-4 p-12 rounded-2xl border-2 border-dashed border-primary/50 glow-box-strong" initial={{ scale: 0.9 }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Upload className="w-16 h-16 text-primary" />
              </motion.div>
              <p className="font-display text-lg text-primary tracking-widest glow-text">INJECT FILES</p>
              <p className="text-[10px] font-mono text-muted-foreground">Auto-analysis will begin immediately</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2 z-10 relative border-b border-border/20"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors" title="Toggle state panel">
            <PanelLeftClose className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="font-display text-sm font-bold tracking-[0.3em] text-primary/60">NOVA</h1>
            <span className="text-[9px] font-mono text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">v2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
          <CustomInstructionsPanel />
          <motion.button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`p-2 rounded-lg transition-all ${terminalOpen ? "bg-primary/20 text-primary glow-border" : "text-muted-foreground hover:text-foreground"}`}
            whileTap={{ scale: 0.9 }}
          >
            <Terminal className="w-4 h-4" />
          </motion.button>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors" title="Toggle preview panel">
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Three-column layout */}
      <div className="flex-1 flex overflow-hidden relative z-[1]">
        {/* Left: Project State */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 overflow-hidden hidden md:block"
            >
              <ProjectStateSidebar
                logs={logs}
                droppedFiles={droppedFiles}
                onRemoveFile={removeFile}
                mode={mode}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/20">
            <NovaOrb isProcessing={isProcessing} isSpeaking={isSpeaking} size="sm" />
            <div>
              <p className="text-[10px] font-display text-primary/70 tracking-widest">NOVA NEXUS</p>
              <p className="text-[9px] font-mono text-muted-foreground">
                {isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : `${mode.toUpperCase()} · READY`}
              </p>
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

          {/* Terminal overlay */}
          <AnimatePresence>
            {terminalOpen && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-0 left-0 right-0 z-20">
                <TerminalPanel isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live Preview */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 overflow-hidden hidden lg:block"
            >
              <LivePreviewPanel fileAnalyses={fileAnalyses} isAnalyzing={isAnalyzing} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="px-4 py-1 z-10 relative">
        <StatusBar />
      </motion.footer>
    </div>
  );
};

export default Index;
