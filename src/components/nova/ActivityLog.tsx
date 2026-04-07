import { motion } from "framer-motion";
import { Zap, MessageSquare, Wrench } from "lucide-react";

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
      <h3 className="text-xs font-display tracking-widest text-primary/70 uppercase mb-3">
        Activity Log
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
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
              className="flex items-start gap-2 text-xs"
            >
              <Icon className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground flex-1 truncate">{entry.text}</span>
              <span className="text-muted-foreground/50 font-mono text-[10px] shrink-0">{entry.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
export type { LogEntry };
