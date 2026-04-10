import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NovaOrbProps {
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
  size?: "sm" | "lg";
}

const NovaOrb = ({ isProcessing, isSpeaking, onClick, size = "sm" }: NovaOrbProps) => {
  const [ripples, setRipples] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isActive = isProcessing || isSpeaking;

  const isLarge = size === "lg";
  const orbSize = isLarge ? 180 : 44;
  const canvasSize = orbSize * 2; // Higher resolution canvas

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.3;

      // Outer ambient glow
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 1.4);
      grad.addColorStop(0, `hsla(190, 100%, 50%, ${isActive ? 0.08 : 0.03})`);
      grad.addColorStop(0.5, `hsla(260, 80%, 60%, ${isActive ? 0.04 : 0.01})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ring 1 — primary waveform
      const points = 120;
      ctx.strokeStyle = isSpeaking ? "hsl(190, 100%, 55%)" : isProcessing ? "hsl(240, 80%, 65%)" : "hsl(190, 100%, 45%)";
      ctx.lineWidth = isLarge ? 2 : 1.5;
      ctx.globalAlpha = isActive ? 0.9 : 0.3;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 6 + Math.sin(t * 6 + i * 0.5) * 10 + Math.sin(t * 11 + i * 0.3) * 5
          : isProcessing
          ? 3 + Math.sin(t * 3 + i * 0.7) * 5
          : 1 + Math.sin(t * 0.8 + i * 0.4) * 1.5;
        const r = baseR + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Ring 2 — inner pulse
      ctx.globalAlpha = isActive ? 0.5 : 0.15;
      ctx.lineWidth = isLarge ? 1.5 : 1;
      ctx.strokeStyle = "hsl(200, 90%, 50%)";
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const amp = isSpeaking
          ? 2 + Math.sin(t * 8 + i * 0.7) * 6
          : 0.5 + Math.sin(t * 1.2 + i * 0.5) * 1;
        const r = baseR * 0.65 + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Ring 3 — accent ring (large only)
      if (isLarge) {
        ctx.globalAlpha = isActive ? 0.35 : 0.1;
        ctx.strokeStyle = "hsl(260, 80%, 60%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const amp = isSpeaking
            ? 1 + Math.sin(t * 4 + i * 1.1) * 4
            : 0.3 + Math.sin(t * 0.6 + i * 0.3) * 0.8;
          const r = baseR * 0.85 + amp;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Core dot glow
      ctx.globalAlpha = 1;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, isLarge ? 12 : 6);
      coreGrad.addColorStop(0, `hsla(190, 100%, 60%, ${isSpeaking ? 1 : isProcessing ? 0.8 : 0.5})`);
      coreGrad.addColorStop(0.5, `hsla(190, 100%, 50%, ${isActive ? 0.4 : 0.15})`);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, isLarge ? 12 : 6, 0, Math.PI * 2);
      ctx.fill();

      t += 0.025;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isProcessing, isSpeaking, isActive, isLarge, canvasSize]);

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
      {/* Ripple waves */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            className="absolute rounded-full border border-primary/20"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ width: orbSize, height: orbSize, top: 0, left: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Rotating ring — large only */}
      {isLarge && (
        <motion.div
          className="absolute rounded-full border border-primary/8"
          style={{ width: orbSize + 30, height: orbSize + 30, top: -15, left: -15 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[0, 120, 240].map((deg) => (
            <motion.div
              key={deg}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                top: "50%", left: "50%",
                transform: `rotate(${deg}deg) translateX(${(orbSize + 30) / 2}px) translate(-50%, -50%)`,
              }}
              animate={{ opacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: deg / 360 }}
            />
          ))}
        </motion.div>
      )}

      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: orbSize * 1.5,
          height: orbSize * 1.5,
          top: -(orbSize * 0.25),
          left: -(orbSize * 0.25),
          background: `radial-gradient(circle, hsl(190 100% 50% / ${isActive ? 0.12 : 0.05}), hsl(260 80% 60% / 0.03), transparent 70%)`,
        }}
        animate={isActive
          ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
          : { scale: [1, 1.03, 1], opacity: [0.3, 0.5, 0.3] }
        }
        transition={{ duration: isActive ? 1 : 4, repeat: Infinity }}
      />

      {/* The orb — cleaner gradient */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: orbSize,
          height: orbSize,
          background: `radial-gradient(circle at 38% 32%, hsl(190 80% 30%), hsl(220 60% 8%), hsl(240 40% 4%))`,
          boxShadow: isActive
            ? `0 0 ${orbSize * 0.4}px hsl(190 100% 50% / 0.3), 0 0 ${orbSize}px hsl(190 100% 50% / 0.08), inset 0 0 ${orbSize * 0.2}px hsl(190 100% 50% / 0.1)`
            : `0 0 ${orbSize * 0.15}px hsl(190 100% 50% / 0.12), inset 0 1px 0 hsl(190 100% 60% / 0.08)`,
        }}
        animate={
          isProcessing
            ? { rotate: 360, scale: [1, 1.02, 1] }
            : isSpeaking
            ? { scale: [1, 1.04, 0.98, 1.02, 1] }
            : { scale: [1, 1.01, 1] }
        }
        transition={
          isProcessing
            ? { rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }
            : isSpeaking
            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 5, repeat: Infinity }
        }
        whileHover={{ scale: isLarge ? 1.05 : 1.08 }}
      >
        {/* High-res waveform canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="absolute inset-0 w-full h-full z-10"
        />

        {/* Glass highlight */}
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(190 100% 80% / 0.06) 0%, transparent 50%)",
          }}
        />
      </motion.div>

      {/* Status label */}
      {isLarge && (
        <>
          <motion.p
            className="font-display text-xl font-bold tracking-[0.4em] glow-text text-primary mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            NOVA
          </motion.p>
          <motion.p
            className="font-mono text-[10px] text-primary/40 tracking-widest uppercase mt-1"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isProcessing ? "Processing" : isSpeaking ? "Speaking" : "Online"}
          </motion.p>
        </>
      )}
    </button>
  );
};

export default NovaOrb;
