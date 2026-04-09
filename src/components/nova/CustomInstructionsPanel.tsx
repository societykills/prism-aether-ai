import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, X, RotateCcw } from "lucide-react";

const STORAGE_KEY = "nova-custom-instructions";

export const getCustomInstructions = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const CustomInstructionsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInstructions(getCustomInstructions());
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, instructions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setInstructions("");
    localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        whileTap={{ scale: 0.9 }}
        title="Custom Instructions"
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center"
            style={{ background: "hsl(222 47% 4% / 0.85)" }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg mx-4 glass rounded-2xl border border-primary/20 overflow-hidden"
              style={{ boxShadow: "0 0 60px hsl(190 100% 50% / 0.1)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-display text-sm tracking-widest text-primary/80">CUSTOM INSTRUCTIONS</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  Tell NOVA how to behave. These instructions persist across sessions and are included in every conversation automatically.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-display tracking-widest text-primary/50 uppercase">
                    What would you like NOVA to know about you?
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. I'm a software developer working on AI products. I prefer concise, technical answers with code examples. Always respond in a professional tone..."
                    className="w-full h-40 bg-muted/10 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 font-mono resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground/50 font-mono text-right">
                    {instructions.length} / 2000 characters
                  </p>
                </div>

                {/* Example prompts */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-display tracking-widest text-primary/40 uppercase">Quick presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Be concise and direct",
                      "Always include code examples",
                      "Respond like a mentor",
                      "Use bullet points",
                    ].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setInstructions((prev) => prev ? `${prev}\n${preset}` : preset)}
                        className="text-[10px] px-2.5 py-1 rounded-full glass text-primary/60 hover:text-primary transition-colors font-mono"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/30">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-mono text-green-400"
                      >
                        ✓ Saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono glow-box"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-3 h-3" />
                    Save Instructions
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomInstructionsPanel;
