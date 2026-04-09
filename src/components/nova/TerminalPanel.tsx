import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal as TermIcon, X, Minus } from "lucide-react";

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

const COMMANDS: Record<string, (args: string[], currentTime: Date, sessionStart: number) => string[]> = {
  help: () => [
    "Available commands:",
    "  help    — Show commands",
    "  date    — Current date/time",
    "  time    — Precise time with timezone",
    "  uptime  — Session duration",
    "  cal     — Calendar",
    "  neofetch— System info",
    "  clear   — Clear terminal",
  ],
  
  date: (_, currentTime) => [
    "╔════════════════════════════════════╗",
    "║         CURRENT DATE/TIME            ║",
    "╠════════════════════════════════════╣",
    `║ ${currentTime.toString().padEnd(34)} ║`,
    "╚════════════════════════════════════╝",
  ],
  
  time: (_, currentTime) => [
    `Local Time: ${currentTime.toLocaleTimeString()}`,
    `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `UTC: ${currentTime.toUTCString()}`,
    `Timestamp: ${Math.floor(currentTime.getTime() / 1000)}`,
  ],
  
  uptime: (_, currentTime, sessionStart) => {
    const uptime = Date.now() - sessionStart;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    return [`Session Uptime: ${hours}h ${minutes}m ${seconds}s`];
  },
  
  cal: (_, currentTime) => {
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const monthName = currentTime.toLocaleString("default", { month: "long" });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = currentTime.getDate();
    
    let lines = [`   ${monthName} ${year}   `, "Su Mo Tu We Th Fr Sa"];
    let line = "   ".repeat(firstDay);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day === today ? `[${day.toString().padStart(2)}]` : day.toString().padStart(2, " ");
      if ((firstDay + day - 1) % 7 === 6) {
        line += " " + dayStr;
        lines.push(line);
        line = "";
      } else {
        line += " " + dayStr;
      }
    }
    if (line.trim()) lines.push(line);
    return lines;
  },
  
  neofetch: (_, currentTime) => [
    `        ▄▄▄▄▄▄▄▄▄         nova@nova-ai`,
    `      ▄█████████████▄      ───────────────`,
    `    ▄███████████████████▄   OS: NOVA AI v2.0`,
    `   ████████████████████████  Date: ${currentTime.toLocaleDateString()}`,
    `  █████████████████████████  Time: ${currentTime.toLocaleTimeString()}`,
    `  █████████████████████████  Kernel: real-time`,
    `   ████████████████████████  Shell: nova-sh`,
    `    ▀███████████████████▀   ${currentTime.getFullYear()} Build`,
    `      ▀█████████████▀`,
    `        ▀▀▀▀▀▀▀▀▀`,
  ],
  
  clear: () => [],
  
  default: (args) => [`Command not found: ${args[0]}. Type 'help' for commands.`],
};

const TerminalPanel = ({ isOpen, onClose }: TerminalPanelProps) => {
  const [lines, setLines] = useState<TermLine[]>([
    { type: "system", text: `NOVA Terminal — ${new Date().toLocaleDateString()}` },
    { type: "system", text: "Type 'help' for commands. Real-time active." },
    { type: "system", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [sessionStart] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const execute = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    const now = new Date();
    
    const newLines: TermLine[] = [{ type: "input", text: `nova@ai:~$ ${cmd}` }];

    if (!command) {
      setLines((p) => [...p, ...newLines]);
      return;
    }

    if (command === "clear") {
      setLines([{ type: "system", text: `Cleared at ${now.toLocaleTimeString()}` }]);
      return;
    }

    const handler = COMMANDS[command] || COMMANDS.default;
    const output = handler(args, now, sessionStart);
    newLines.push(...output.map((text) => ({ type: "output" as const, text })));

    setLines((p) => [...p, ...newLines]);
    setHistory((p) => [cmd, ...p]);
    setHistIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) {
        const idx = histIdx - 1;
        setHistIdx(idx);
        setInput(history[idx]);
      } else {
        setHistIdx(-1);
        setInput("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 300 }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      className="border-t border-primary/30 flex flex-col bg-background/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-mono text-primary/80">NOVA Terminal</span>
          <span className="text-[9px] font-mono text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <Minus className="w-3 h-3" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "text-primary"
                : line.type === "error"
                ? "text-destructive"
                : line.type === "system"
                ? "text-nova-glow-secondary/70"
                : "text-foreground/80"
            }
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-primary mr-1">nova@ai:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground font-mono text-xs caret-primary"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalPanel;
