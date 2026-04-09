import { Wifi, Cpu, Shield, Zap, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const StatusBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "2-digit"
  });

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  });

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
        <div className="flex items-center gap-1 text-primary/70">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Clock className="w-3 h-3" />
          <motion.span 
            key={currentTime.getSeconds()}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="font-bold min-w-[70px]"
          >
            {formatTime(currentTime)}
          </motion.span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-primary" />
          <span>SECURE</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-primary" />
          <span>NOVA v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;

        
