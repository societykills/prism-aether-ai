import { motion } from "framer-motion";

interface NovaOrbProps {
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick?: () => void;
}

const NovaOrb = ({ isProcessing, isSpeaking, onClick }: NovaOrbProps) => {
  return (
    <button onClick={onClick} className="relative group cursor-pointer">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(190 100% 50% / 0.15), transparent 70%)",
        }}
        animate={isProcessing || isSpeaking ? { scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(260 80% 60% / 0.1), transparent 70%)",
        }}
        animate={isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />

      {/* Core orb */}
      <motion.div
        className="relative w-20 h-20 rounded-full glow-box-strong"
        style={{
          background: "radial-gradient(circle at 30% 30%, hsl(190 100% 60%), hsl(220 80% 20%), hsl(260 60% 15%))",
        }}
        animate={
          isProcessing
            ? { rotate: 360 }
            : isSpeaking
            ? { scale: [1, 1.05, 1] }
            : {}
        }
        transition={
          isProcessing
            ? { duration: 3, repeat: Infinity, ease: "linear" }
            : { duration: 1, repeat: Infinity }
        }
        whileHover={{ scale: 1.1 }}
      >
        {/* Inner core */}
        <div className="absolute inset-3 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-primary"
            animate={isProcessing ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.8 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Status label */}
      <motion.p
        className="text-[10px] font-display text-primary/70 text-center mt-2 tracking-widest uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isProcessing ? "Processing" : isSpeaking ? "Speaking" : "Ready"}
      </motion.p>
    </button>
  );
};

export default NovaOrb;
