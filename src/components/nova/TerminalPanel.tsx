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

const COMMANDS: Record<string, (args: string[]) => string[]> = {
  help: () => [
    "Available commands:",
    "  help          — Show this help",
    "  status        — System status",
    "  scan [target] — Simulate network scan",
    "  ping [host]   — Simulate ping",
    "  whoami        — Current user info",
    "  clear         — Clear terminal",
    "  date          — Current date/time",
    "  uptime        — System uptime",
    "  neofetch      — System info",
    "  matrix        — Enter the matrix",
    "  hack [target] — Simulate hack sequence",
    "  nmap [target] — Port scan simulation",
    "  ls            — List directory",
    "  cat [file]    — Read file contents",
  ],
  status: () => [
    "╔══════════════════════════════════╗",
    "║     NOVA SYSTEM STATUS           ║",
    "╠══════════════════════════════════╣",
    "║ CPU:      ████████░░  82%        ║",
    "║ Memory:   ██████░░░░  64%        ║",
    "║ GPU:      █████████░  94%        ║",
    "║ Network:  ████████░░  ACTIVE     ║",
    "║ AI Core:  ██████████  ONLINE     ║",
    "║ Security: ██████████  LOCKED     ║",
    "╚══════════════════════════════════╝",
  ],
  scan: (args) => {
    const target = args[0] || "local network";
    return [
      `Initiating scan on ${target}...`,
      "Scanning ports: 22, 80, 443, 3000, 5432, 8080...",
      `[+] ${target}:22   — SSH (OpenSSH 9.2)`,
      `[+] ${target}:80   — HTTP (nginx/1.24)`,
      `[+] ${target}:443  — HTTPS (TLS 1.3)`,
      `[+] ${target}:5432 — PostgreSQL`,
      `Scan complete. 4 services detected.`,
    ];
  },
  ping: (args) => {
    const host = args[0] || "nova.ai";
    return [
      `PING ${host} (142.250.80.14):`,
      `64 bytes: icmp_seq=1 ttl=117 time=${(Math.random() * 20 + 5).toFixed(1)}ms`,
      `64 bytes: icmp_seq=2 ttl=117 time=${(Math.random() * 20 + 5).toFixed(1)}ms`,
      `64 bytes: icmp_seq=3 ttl=117 time=${(Math.random() * 20 + 5).toFixed(1)}ms`,
      `--- ${host} ping statistics ---`,
      `3 packets transmitted, 3 received, 0% packet loss`,
    ];
  },
  whoami: () => ["nova-operator@NOVA-AI [ADMIN]", "Clearance: OMEGA", "Session: active since boot"],
  date: () => [new Date().toString()],
  uptime: () => [`System uptime: ${Math.floor(Math.random() * 200 + 50)} days, ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}`],
  neofetch: () => [
    "        ▄▄▄▄▄▄▄▄▄         nova-operator@nova-ai",
    "      ▄█████████████▄      ──────────────────────",
    "    ▄███████████████████▄   OS: NOVA AI v1.0",
    "   ████████████████████████  Kernel: quantum-7.2.1",
    "  █████████████████████████  CPU: Neural Engine x16",
    "  █████████████████████████  GPU: RTX NOVA 9000",
    "   ████████████████████████  RAM: 256GB Quantum",
    "    ▀███████████████████▀   Shell: nova-sh",
    "      ▀█████████████▀      AI Core: ACTIVE",
    "        ▀▀▀▀▀▀▀▀▀         Uptime: ETERNAL",
  ],
  matrix: () => [
    "Wake up, Neo...",
    "The Matrix has you...",
    "Follow the white rabbit.",
    "Knock, knock, Neo.",
    "",
    "01001110 01001111 01010110 01000001",
    "SYSTEM BREACH DETECTED — just kidding. 😏",
  ],
  hack: (args) => {
    const target = args[0] || "mainframe";
    return [
      `[*] Targeting ${target}...`,
      "[*] Bypassing firewall... ████████████ OK",
      "[*] Injecting payload... ████████████ OK",
      "[*] Escalating privileges... ████████████ OK",
      "[*] Extracting data... ████████████ OK",
      `[+] Access granted to ${target}`,
      "[!] Just a simulation. No actual hacking occurred. 🛡️",
    ];
  },
  nmap: (args) => {
    const target = args[0] || "192.168.1.0/24";
    return [
      `Starting Nmap 7.94 scan on ${target}`,
      "Scanning 256 hosts...",
      "",
      "PORT     STATE  SERVICE        VERSION",
      "22/tcp   open   ssh            OpenSSH 9.2",
      "80/tcp   open   http           nginx 1.24",
      "443/tcp  open   https          TLS 1.3",
      "3306/tcp closed mysql",
      "5432/tcp open   postgresql     16.1",
      "8080/tcp open   http-proxy     envoy",
      "27017/tcp closed mongodb",
      "",
      `Nmap done: 256 IPs scanned, 3 hosts up`,
    ];
  },
  ls: () => [
    "drwxr-xr-x  nova  nova  4096  /nova/core/",
    "drwxr-xr-x  nova  nova  4096  /nova/models/",
    "drwxr-xr-x  nova  nova  4096  /nova/data/",
    "-rw-r--r--  nova  nova  2048  /nova/config.yaml",
    "-rw-------  nova  nova   512  /nova/.secrets",
    "-rwxr-xr-x  nova  nova  8192  /nova/nova-engine",
  ],
  cat: (args) => {
    const file = args[0] || "config.yaml";
    if (file.includes("secret")) return ["[ACCESS DENIED] Clearance required: OMEGA+"];
    return [
      `# ${file}`,
      "ai_engine:",
      "  model: nova-quantum-v1",
      "  temperature: 0.7",
      "  max_tokens: 8192",
      "  stream: true",
      "security:",
      "  level: maximum",
      "  encryption: AES-256-GCM",
    ];
  },
};

const TerminalPanel = ({ isOpen, onClose }: TerminalPanelProps) => {
  const [lines, setLines] = useState<TermLine[]>([
    { type: "system", text: "NOVA Terminal v1.0 — Type 'help' for commands" },
    { type: "system", text: "Connected to NOVA AI Core" },
    { type: "system", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
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

    const newLines: TermLine[] = [{ type: "input", text: `nova@ai:~$ ${cmd}` }];

    if (!command) {
      setLines((p) => [...p, ...newLines]);
      return;
    }

    if (command === "clear") {
      setLines([{ type: "system", text: "Terminal cleared." }]);
      return;
    }

    const handler = COMMANDS[command];
    if (handler) {
      const output = handler(args);
      newLines.push(...output.map((text) => ({ type: "output" as const, text })));
    } else {
      newLines.push({ type: "error", text: `Command not found: ${command}. Type 'help' for available commands.` });
    }

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
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-mono text-primary/80">NOVA Terminal</span>
          <span className="text-[9px] font-mono text-muted-foreground">v1.0</span>
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

      {/* Terminal body */}
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
