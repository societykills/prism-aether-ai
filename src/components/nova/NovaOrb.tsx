import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NovaOrbProps {
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
}

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";

const MatrixRain = ({ active }: { active: boolean }) => {
  const columns = 24;
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden opacity-60">
      {Array.from({ length: columns }).map((_, i) => {
        const delay = Math.random() * 2;
        const duration = 1.5 + Math.random() * 2;
        const left = (i / columns) * 100;
        const chars = Array.from({ length: 6 }, () =>
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ).join("\n");
        return (
          <motion.div
            key={i}
            className="absolute text-[6px] font-mono leading-[8px] text-primary whitespace-pre"
            style={{ left: `${left}%`, top: "-20%" }}
            animate={active ? {
              y: ["0%", "140%"],
              opacity: [0, 1, 1, 0],
            } : { y: "0%", opacity: 0 }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {chars}
          </motion.div>
        );
      })}
    </div>
  );
};

const NovaOrb = ({ isProcessing, isSpeaking, onClick }: NovaOrbProps) => {
  const [ripples, setRipples] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isActive = isProcessing || isSpeaking;

  // Waveform canvas for speaking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = isSpeaking
        ? "hsl(190, 100%, 50%)"
        : isProcessing
        ? "hsl(260, 80%, 60%)"
        : "hsl(190, 100%, 50%)";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = isActive ? 0.8 : 0.2;

      // Draw circular waveform
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.32;
      const points = 64;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 6 + Math.sin(t * 4 + i * 0.5) * 8 + Math.sin(t * 7 + i * 0.3) * 4
          : isProcessing
          ? 3 + Math.sin(t * 2 + i * 0.8) * 4
          : 1 + Math.sin(t + i * 0.5) * 1.5;
        const r = baseR + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner ring
      ctx.globalAlpha = isActive ? 0.4 : 0.1;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 2 + Math.sin(t * 6 + i * 0.7) * 5
          : 1 + Math.sin(t * 1.5 + i * 0.4) * 1;
        const r = baseR * 0.65 + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      t += 0.03;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isProcessing, isSpeaking, isActive]);

  // Speaking ripples
  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => {
      setRipples((prev) => [...prev.slice(-3), Date.now()]);
    }, 800);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <button
      onClick={onClick}
      className="relative group cursor-pointer flex flex-col items-center"
      aria-label="NOVA AI Orb"
    >
      {/* Ripple waves when speaking */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            className="absolute inset-0 rounded-full border border-primary/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ margin: "auto", width: 80, height: 80 }}
          />
        ))}
      </AnimatePresence>

      {/* Outer pulsing glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, hsl(190 100% 50% / 0.12), hsl(260 80% 60% / 0.06), transparent 70%)",
        }}
        animate={isActive
          ? { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }
          : { scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }
        }
        transition={{ duration: isActive ? 1.5 : 3, repeat: Infinity }}
      />

      {/* The orb */}
      <motion.div
        className="relative w-20 h-20 rounded-full overflow-hidden"
        style={{
          background: "radial-gradient(circle at 35% 35%, hsl(190 100% 40%), hsl(220 80% 12%), hsl(260 60% 8%))",
          boxShadow: isActive
            ? "0 0 30px hsl(190 100% 50% / 0.4), 0 0 80px hsl(190 100% 50% / 0.15), inset 0 0 20px hsl(190 100% 50% / 0.2)"
            : "0 0 15px hsl(190 100% 50% / 0.2), 0 0 40px hsl(190 100% 50% / 0.05)",
        }}
        animate={
          isProcessing
            ? { rotate: 360, scale: [1, 1.03, 1] }
            : isSpeaking
            ? { scale: [1, 1.06, 1, 1.04, 1] }
            : { scale: [1, 1.02, 1] }
        }
        transition={
          isProcessing
            ? { rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }
            : isSpeaking
            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 4, repeat: Infinity }
        }
        whileHover={{ scale: 1.12 }}
      >
        {/* Matrix rain inside orb */}
        <MatrixRain active={isActive} />

        {/* Waveform canvas */}
        <canvas
          ref={canvasRef}
          width={80}
          height={80}
          className="absolute inset-0 z-10"
        />

        {/* Core glow */}
        <motion.div
          className="absolute inset-0 rounded-full z-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(190 100% 50% / 0.15), transparent 60%)",
          }}
          animate={isSpeaking
            ? { opacity: [0.3, 0.7, 0.3] }
            : { opacity: [0.1, 0.2, 0.1] }
          }
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Center eye */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary"
            style={{
              boxShadow: "0 0 12px hsl(190 100% 50% / 0.8), 0 0 24px hsl(190 100% 50% / 0.4)",
            }}
            animate={
              isProcessing
                ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }
                : isSpeaking
                ? { opacity: [0.6, 1, 0.6], scale: [1, 1.4, 1] }
                : { opacity: [0.5, 0.8, 0.5] }
            }
            transition={{ duration: isSpeaking ? 0.4 : 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Status label */}
      <motion.p
        className="text-[9px] font-display text-primary/60 text-center mt-1.5 tracking-[0.25em] uppercase"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isProcessing ? "Thinking" : isSpeaking ? "Speaking" : "Online"}
      </motion.p>
    </button>
  );
};

export default NovaOrb;
