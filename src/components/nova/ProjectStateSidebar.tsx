import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, FileText, Activity, Cpu, HardDrive, Wifi, X, ChevronDown, ChevronRight } from "lucide-react";
import ActivityLog, { LogEntry } from "./ActivityLog";

interface ProjectVariable {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "object";
}

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ProjectStateSidebarProps {
  logs: LogEntry[];
  droppedFiles: DroppedFile[];
  onRemoveFile: (id: string) => void;
  mode: string;
  isProcessing: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ProjectStateSidebar = ({ logs, droppedFiles, onRemoveFile, mode, isProcessing }: ProjectStateSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    state: true,
    files: true,
    activity: true,
    system: false,
  });

  const [variables] = useState<ProjectVariable[]>([
    { key: "session_id", value: crypto.randomUUID().slice(0, 8), type: "string" },
    { key: "mode", value: mode, type: "string" },
    { key: "uptime", value: "0s", type: "string" },
    { key: "msg_count", value: "0", type: "number" },
  ]);

  const [metrics, setMetrics] = useState({ cpu: 24, mem: 38, gpu: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.min(99, Math.max(10, metrics.cpu + (Math.random() - 0.5) * 8)),
        mem: Math.min(99, Math.max(20, metrics.mem + (Math.random() - 0.5) * 4)),
        gpu: isProcessing ? Math.min(99, metrics.gpu + 5) : Math.max(5, metrics.gpu - 2),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [metrics, isProcessing]);

  const toggle = (section: string) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const SectionHeader = ({ id, icon: Icon, label, count }: { id: string; icon: any; label: string; count?: number }) => (
    <button onClick={() => toggle(id)} className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-display tracking-widest text-primary/50 uppercase hover:text-primary/70 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
        {count !== undefined && <span className="text-[9px] font-mono text-muted-foreground bg-muted/30 px-1.5 rounded">{count}</span>}
      </div>
      {expandedSections[id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
    </button>
  );

  return (
    <div className="h-full flex flex-col border-r border-primary/10 bg-nova-surface/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/30 flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-display tracking-widest text-primary/70">PROJECT STATE</span>
        <motion.div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5">
        {/* Global State */}
        <div>
          <SectionHeader id="state" icon={Activity} label="Global State" count={variables.length} />
          {expandedSections.state && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-3 pb-2 space-y-1">
              {variables.map((v) => (
                <div key={v.key} className="flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded bg-muted/10 hover:bg-muted/20 transition-colors">
                  <span className="text-primary/60">{v.key}</span>
                  <span className="text-foreground/70 truncate ml-2 max-w-[80px]">
                    {v.key === "mode" ? mode : v.value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Injected Files */}
        <div>
          <SectionHeader id="files" icon={FileText} label="Injected Files" count={droppedFiles.length} />
          {expandedSections.files && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-3 pb-2 space-y-1">
              {droppedFiles.length === 0 ? (
                <p className="text-[10px] font-mono text-muted-foreground/40 italic px-2 py-1">Drop files to inject</p>
              ) : (
                droppedFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded bg-muted/10 group hover:bg-muted/20 transition-colors">
                    <FileText className="w-3 h-3 text-primary/50 shrink-0" />
                    <span className="text-foreground/70 truncate flex-1">{f.name}</span>
                    <span className="text-muted-foreground/40 shrink-0">{formatFileSize(f.size)}</span>
                    <button onClick={() => onRemoveFile(f.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* Activity Log */}
        <div>
          <SectionHeader id="activity" icon={Wifi} label="Activity" count={logs.length} />
          {expandedSections.activity && (
            <div className="px-2 pb-2">
              <ActivityLog entries={logs} />
            </div>
          )}
        </div>

        {/* System Metrics */}
        <div>
          <SectionHeader id="system" icon={Cpu} label="System" />
          {expandedSections.system && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-3 pb-2 space-y-2">
              {[
                { label: "CPU", value: Math.round(metrics.cpu), color: "bg-primary/50" },
                { label: "MEM", value: Math.round(metrics.mem), color: "bg-nova-glow-secondary/50" },
                { label: "GPU", value: Math.round(metrics.gpu), color: "bg-primary/50" },
              ].map((m) => (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                    <span>{m.label}</span>
                    <span className="text-primary/60">{m.value}%</span>
                  </div>
                  <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${m.color} rounded-full`} animate={{ width: `${m.value}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/50 pt-1">
                <HardDrive className="w-3 h-3" />
                <span>Real-time metrics</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStateSidebar;
