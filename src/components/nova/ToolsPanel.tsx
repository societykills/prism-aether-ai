import { FileText, Mail, Lightbulb, Code, Megaphone, Terminal } from "lucide-react";
import { motion } from "framer-motion";

interface ToolsPanelProps {
  onToolSelect: (tool: string) => void;
}

const tools = [
  { id: "invoice", label: "Invoice Gen", icon: FileText, color: "text-primary" },
  { id: "email", label: "Email Writer", icon: Mail, color: "text-primary" },
  { id: "idea", label: "Idea Engine", icon: Lightbulb, color: "text-nova-glow-secondary" },
  { id: "code", label: "Code Gen", icon: Code, color: "text-primary" },
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "text-nova-glow-secondary" },
  { id: "task", label: "Run Task", icon: Terminal, color: "text-primary" },
];

const ToolsPanel = ({ onToolSelect }: ToolsPanelProps) => {
  return (
    <div className="glass rounded-xl p-4 glow-box">
      <h3 className="text-xs font-display tracking-widest text-primary/70 uppercase mb-3">
        Smart Tools
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 border border-transparent hover:glow-border transition-all text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <tool.icon className={`w-4 h-4 ${tool.color}`} />
            <span className="text-xs font-medium text-foreground">{tool.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ToolsPanel;
