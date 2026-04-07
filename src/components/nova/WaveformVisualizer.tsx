import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  isActive: boolean;
  barCount?: number;
}

const WaveformVisualizer = ({ isActive, barCount = 32 }: WaveformVisualizerProps) => {
  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-primary"
          animate={
            isActive
              ? {
                  height: [4, Math.random() * 32 + 8, 4],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: 4, opacity: 0.2 }
          }
          transition={
            isActive
              ? {
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.02,
                }
              : { duration: 0.3 }
          }
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
