import { Brain, Briefcase, Code, TrendingUp, Palette } from "lucide-react";
import { motion } from "framer-motion";

export type AssistantMode = "general" | "business" | "developer" | "trading" | "creative";

interface ModeSelectorProps {
  activeMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const modes: { id: AssistantMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "general", label: "General", icon: Brain, desc: "All-purpose assistant" },
  { id: "business", label: "Business", icon: Briefcase, desc: "Emails, invoices, strategy" },
  { id: "developer", label: "Developer", icon: Code, desc: "Code, debug, architect" },
  { id: "trading", label: "Trading", icon: TrendingUp, desc: "Markets & analysis" },
  { id: "creative", label: "Creative", icon: Palette, desc: "Content & design" },
];

const ModeSelector = ({ activeMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "glass glow-border glow-box text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
