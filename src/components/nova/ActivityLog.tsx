import { motion } from "framer-motion";
import { Zap, MessageSquare, Wrench, Clock } from "lucide-react";

interface LogEntry {
  id: string;
  type: "chat" | "tool" | "system";
  text: string;
  time: string;
}

interface ActivityLogProps {
  entries: LogEntry[];
}

const iconMap = {
  chat: MessageSquare,
  tool: Wrench,
  system: Zap,
};

const ActivityLog = ({ entries }: ActivityLogProps) => {
  return (
    <div className="glass rounded-xl p-4 glow-box">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-display tracking-widest text-primary/70 uppercase">
          Activity Log
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Clock className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No activity yet.</p>
        )}
        {entries.map((entry, i) => {
          const Icon = iconMap[entry.type];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 text-xs group"
            >
              <Icon className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground flex-1 truncate">{entry.text}</span>
              <span className="text-muted-foreground/50 font-mono text-[10px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                {entry.time}
              </span>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-2 pt-2 border-t border-border/30 text-[9px] text-muted-foreground font-mono text-center">
        {new Date().toLocaleDateString("en-US", { 
          weekday: "short", year: "numeric", month: "short", day: "numeric" 
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
export type { LogEntry };
