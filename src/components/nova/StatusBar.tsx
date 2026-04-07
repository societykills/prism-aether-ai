import { Wifi, Cpu, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const StatusBar = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 glass-strong rounded-lg text-[10px] font-mono text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>ONLINE</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          <span>CONNECTED</span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span>GPU ACTIVE</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-primary" />
          <span>SECURE</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-primary" />
          <span>NOVA v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
