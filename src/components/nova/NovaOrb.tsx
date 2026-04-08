import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NovaOrbProps {
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
  size?: "sm" | "lg";
}

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";

const MatrixRain = ({ active, count }: { active: boolean; count: number }) => {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden opacity-70">
      {Array.from({ length: count }).map((_, i) => {
        const delay = Math.random() * 2;
        const duration = 1.2 + Math.random() * 2;
        const left = (i / count) * 100;
        const chars = Array.from({ length: 8 }, () =>
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ).join("\n");
        return (
          <motion.div
            key={i}
            className="absolute font-mono leading-tight text-primary whitespace-pre"
            style={{ left: `${left}%`, top: "-20%", fontSize: "7px", lineHeight: "9px" }}
            animate={active ? {
              y: ["0%", "140%"],
              opacity: [0, 1, 1, 0],
            } : { y: "0%", opacity: 0.15 }}
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

const HexGrid = ({ size }: { size: number }) => {
  const hexCount = 6;
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      {Array.from({ length: hexCount }).map((_, i) => {
        const angle = (i / hexCount) * Math.PI * 2;
        const r = size * 0.28;
        const x = 50 + (Math.cos(angle) * r / size) * 100;
        const y = 50 + (Math.sin(angle) * r / size) * 100;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 border border-primary/20 rotate-45"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%) rotate(45deg)" }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        );
      })}
    </div>
  );
};

const NovaOrb = ({ isProcessing, isSpeaking, onClick, size = "sm" }: NovaOrbProps) => {
  const [ripples, setRipples] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isActive = isProcessing || isSpeaking;

  const isLarge = size === "lg";
  const orbSize = isLarge ? 200 : 80;
  const canvasSize = orbSize;

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

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.33;
      const points = 80;

      // Outer waveform ring
      ctx.strokeStyle = isSpeaking ? "hsl(190, 100%, 50%)" : isProcessing ? "hsl(260, 80%, 60%)" : "hsl(190, 100%, 50%)";
      ctx.lineWidth = isLarge ? 2 : 1.5;
      ctx.globalAlpha = isActive ? 0.8 : 0.25;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 8 + Math.sin(t * 5 + i * 0.4) * 12 + Math.sin(t * 9 + i * 0.2) * 6
          : isProcessing
          ? 4 + Math.sin(t * 2.5 + i * 0.6) * 6
          : 1.5 + Math.sin(t + i * 0.5) * 2;
        const r = baseR + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner ring
      ctx.globalAlpha = isActive ? 0.5 : 0.12;
      ctx.lineWidth = isLarge ? 1.5 : 1;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 3 + Math.sin(t * 7 + i * 0.6) * 7
          : 1 + Math.sin(t * 1.5 + i * 0.4) * 1.5;
        const r = baseR * 0.6 + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Third ring for large orb
      if (isLarge) {
        ctx.globalAlpha = isActive ? 0.3 : 0.08;
        ctx.strokeStyle = "hsl(260, 80%, 60%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const amp = isSpeaking
            ? 2 + Math.sin(t * 3 + i * 0.9) * 5
            : 0.5 + Math.sin(t * 0.8 + i * 0.3) * 1;
          const r = baseR * 0.85 + amp;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      t += 0.03;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isProcessing, isSpeaking, isActive, isLarge]);

  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => {
      setRipples((prev) => [...prev.slice(-4), Date.now()]);
    }, 600);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <button
      onClick={onClick}
      className="relative group cursor-pointer flex flex-col items-center"
      aria-label="NOVA AI Orb"
    >
      {/* Ripple waves */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            className="absolute rounded-full border border-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ width: orbSize, height: orbSize, top: 0, left: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Rotating outer ring (large only) */}
      {isLarge && (
        <motion.div
          className="absolute rounded-full border border-primary/10"
          style={{ width: orbSize + 40, height: orbSize + 40, top: -20, left: -20 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[0, 90, 180, 270].map((deg) => (
            <motion.div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(${(orbSize + 40) / 2}px) translate(-50%, -50%)`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: deg / 360 }}
            />
          ))}
        </motion.div>
      )}

      {/* Outer pulsing glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: orbSize * 1.6,
          height: orbSize * 1.6,
          top: -(orbSize * 0.3),
          left: -(orbSize * 0.3),
          background: "radial-gradient(circle, hsl(190 100% 50% / 0.1), hsl(260 80% 60% / 0.05), transparent 70%)",
        }}
        animate={isActive
          ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
          : { scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }
        }
        transition={{ duration: isActive ? 1.2 : 3, repeat: Infinity }}
      />

      {/* The orb */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: orbSize,
          height: orbSize,
          background: "radial-gradient(circle at 35% 30%, hsl(190 100% 35%), hsl(220 80% 10%), hsl(260 60% 6%))",
          boxShadow: isActive
            ? `0 0 ${orbSize / 2}px hsl(190 100% 50% / 0.35), 0 0 ${orbSize}px hsl(190 100% 50% / 0.12), inset 0 0 ${orbSize / 3}px hsl(190 100% 50% / 0.15)`
            : `0 0 ${orbSize / 4}px hsl(190 100% 50% / 0.15), 0 0 ${orbSize / 2}px hsl(190 100% 50% / 0.04)`,
        }}
        animate={
          isProcessing
            ? { rotate: 360, scale: [1, 1.03, 1] }
            : isSpeaking
            ? { scale: [1, 1.05, 0.98, 1.03, 1] }
            : { scale: [1, 1.015, 1] }
        }
        transition={
          isProcessing
            ? { rotate: { duration: 6, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }
            : isSpeaking
            ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 4, repeat: Infinity }
        }
        whileHover={{ scale: 1.08 }}
      >
        {/* Matrix rain */}
        <MatrixRain active={isActive} count={isLarge ? 40 : 24} />

        {/* Hex grid overlay */}
        {isLarge && <HexGrid size={orbSize} />}

        {/* Waveform canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="absolute inset-0 z-10"
        />

        {/* Core glow */}
        <motion.div
          className="absolute inset-0 rounded-full z-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(190 100% 50% / 0.12), transparent 55%)",
          }}
          animate={isSpeaking
            ? { opacity: [0.3, 0.8, 0.3] }
            : { opacity: [0.1, 0.2, 0.1] }
          }
          transition={{ duration: 0.8, repeat: Infinity }}
        />

        {/* Center eye */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <motion.div
            className="rounded-full bg-primary"
            style={{
              width: isLarge ? 14 : 12,
              height: isLarge ? 14 : 12,
              boxShadow: `0 0 ${isLarge ? 20 : 12}px hsl(190 100% 50% / 0.9), 0 0 ${isLarge ? 50 : 24}px hsl(190 100% 50% / 0.4)`,
            }}
            animate={
              isProcessing
                ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }
                : isSpeaking
                ? { opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }
                : { opacity: [0.5, 0.8, 0.5] }
            }
            transition={{ duration: isSpeaking ? 0.35 : 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Status label */}
      <motion.p
        className={`font-display text-primary/60 text-center tracking-[0.3em] uppercase ${isLarge ? "text-xs mt-4" : "text-[9px] mt-1.5"}`}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isProcessing ? "Thinking" : isSpeaking ? "Speaking" : "Online"}
      </motion.p>

      {/* NOVA label for large */}
      {isLarge && (
        <motion.p
          className="font-display text-2xl font-bold tracking-[0.4em] glow-text text-primary mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          NOVA
        </motion.p>
      )}
    </button>
  );
};

export default NovaOrb;
