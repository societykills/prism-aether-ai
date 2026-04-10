import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, FileSearch, Layers, Terminal, Code, ExternalLink } from "lucide-react";

interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  lines?: number;
  analysis: string;
}

interface LivePreviewPanelProps {
  fileAnalyses: FileAnalysis[];
  isAnalyzing: boolean;
}

const LivePreviewPanel = ({ fileAnalyses, isAnalyzing }: LivePreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "analysis">("preview");

  const tabs = [
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "analysis" as const, label: "Analysis", icon: FileSearch },
  ];

  return (
    <div className="h-full flex flex-col border-l border-primary/10 bg-nova-surface/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-display tracking-widest text-primary/70">LIVE PANEL</span>
        </div>
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {/* Live context display */}
              <div className="flex-1 p-3 space-y-3">
                <div className="glass rounded-lg p-3 glow-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-display tracking-widest text-primary/50 uppercase">System Output</span>
                  </div>
                  <div className="font-mono text-[10px] text-foreground/60 space-y-1 leading-relaxed">
                    <p className="text-primary/40">// Real-time system feed</p>
                    <p><span className="text-primary/60">status</span>: <span className="text-foreground/80">operational</span></p>
                    <p><span className="text-primary/60">engine</span>: <span className="text-foreground/80">NOVA v2.0</span></p>
                    <p><span className="text-primary/60">latency</span>: <span className="text-foreground/80">&lt;50ms</span></p>
                    <p><span className="text-primary/60">files_loaded</span>: <span className="text-foreground/80">{fileAnalyses.length}</span></p>
                  </div>
                </div>

                {/* Quick links */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-display tracking-widest text-primary/50 uppercase">Environment</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Runtime", value: "Edge Functions" },
                      { label: "Database", value: "Connected" },
                      { label: "Auth", value: "Ready" },
                      { label: "Storage", value: "Active" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-[10px] font-mono">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-primary/70">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-display tracking-widest text-primary/50 uppercase">Quick Actions</span>
                  </div>
                  <div className="space-y-1">
                    {["Run diagnostics", "Export state", "Sync context", "Clear cache"].map((action) => (
                      <button key={action} className="w-full text-left text-[10px] font-mono px-2 py-1.5 rounded bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors">
                        → {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-2"
            >
              {isAnalyzing && (
                <motion.div
                  className="glass rounded-lg p-3 glow-border"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                    <span className="text-[10px] font-mono text-primary">Analyzing file structure...</span>
                  </div>
                </motion.div>
              )}

              {fileAnalyses.length === 0 && !isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FileSearch className="w-8 h-8 text-muted-foreground/20 mb-3" />
                  <p className="text-[11px] font-mono text-muted-foreground/40">No files analyzed yet</p>
                  <p className="text-[9px] font-mono text-muted-foreground/30 mt-1">Drop files to auto-analyze</p>
                </div>
              ) : (
                fileAnalyses.map((fa, i) => (
                  <motion.div
                    key={`${fa.name}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono text-foreground/80 truncate max-w-[140px]">{fa.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{fa.type || "unknown"}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{fa.analysis}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LivePreviewPanel;
