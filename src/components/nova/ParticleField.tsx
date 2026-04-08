import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  glow: boolean;
}

const ParticleField = ({ count = 50, active = true }: { count?: number; active?: boolean }) => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      driftX: (Math.random() - 0.5) * 60,
      driftY: (Math.random() - 0.5) * 60,
      glow: Math.random() > 0.7,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.glow
              ? "hsl(190 100% 50%)"
              : "hsl(210 30% 40%)",
            boxShadow: p.glow ? "0 0 6px hsl(190 100% 50% / 0.6)" : "none",
          }}
          animate={active ? {
            x: [0, p.driftX, -p.driftX * 0.5, 0],
            y: [0, p.driftY, -p.driftY * 0.3, 0],
            opacity: [0, 0.6, 0.8, 0.4, 0],
            scale: [0.5, 1, 1.2, 0.8, 0.5],
          } : { opacity: 0.15 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
