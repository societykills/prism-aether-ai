import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Monitor, Smartphone, Tablet, Code, Copy, Download, 
  ExternalLink, RefreshCw, X, Maximize2, Minimize2, Eye
} from "lucide-react";
import { toast } from "sonner";

interface WebPreviewPanelProps {
  code: string | null;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: "100%", label: "Desktop" },
  tablet: { width: "768px", label: "Tablet" },
  mobile: { width: "375px", label: "Mobile" },
};

const WebPreviewPanel = ({ code, onClose, isFullscreen, onToggleFullscreen }: WebPreviewPanelProps) => {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  const refresh = useCallback(() => setKey((k) => k + 1), []);

  const htmlContent = code || `<!DOCTYPE html>
<html><head><style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#0a0a0a; color:#5ce1e6; font-family:'Courier New',monospace; }
  .waiting { text-align:center; opacity:0.6; }
  .waiting h2 { font-size:1.2rem; letter-spacing:0.3em; text-transform:uppercase; }
  .waiting p { font-size:0.75rem; margin-top:0.5rem; color:#888; }
</style></head><body>
  <div class="waiting">
    <h2>⟐ Preview Ready</h2>
    <p>Ask NOVA to "build me a website" to see it here</p>
  </div>
</body></html>`;

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    }
  };

  const downloadCode = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-website-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Website downloaded");
  };

  const openInNewTab = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex flex-col h-full border-l border-primary/10 bg-background/50 backdrop-blur-md ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/60">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-display tracking-widest text-primary/60 uppercase">
            Live Preview
          </span>
          {code && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Viewport switcher */}
          {[
            { size: "desktop" as ViewportSize, icon: Monitor },
            { size: "tablet" as ViewportSize, icon: Tablet },
            { size: "mobile" as ViewportSize, icon: Smartphone },
          ].map(({ size, icon: Icon }) => (
            <motion.button
              key={size}
              onClick={() => setViewport(size)}
              className={`p-1.5 rounded transition-all ${
                viewport === size
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileTap={{ scale: 0.9 }}
              title={viewportSizes[size].label}
            >
              <Icon className="w-3.5 h-3.5" />
            </motion.button>
          ))}

          <div className="w-px h-4 bg-border/30 mx-1" />

          <motion.button onClick={refresh} className="p-1.5 rounded text-muted-foreground hover:text-foreground" whileTap={{ scale: 0.9 }} title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button onClick={() => setShowCode(!showCode)} className={`p-1.5 rounded transition-all ${showCode ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} whileTap={{ scale: 0.9 }} title="View code">
            <Code className="w-3.5 h-3.5" />
          </motion.button>
          {code && (
            <>
              <motion.button onClick={copyCode} className="p-1.5 rounded text-muted-foreground hover:text-foreground" whileTap={{ scale: 0.9 }} title="Copy code">
                <Copy className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button onClick={downloadCode} className="p-1.5 rounded text-muted-foreground hover:text-foreground" whileTap={{ scale: 0.9 }} title="Download">
                <Download className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button onClick={openInNewTab} className="p-1.5 rounded text-muted-foreground hover:text-foreground" whileTap={{ scale: 0.9 }} title="Open in new tab">
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.button>
            </>
          )}
          {onToggleFullscreen && (
            <motion.button onClick={onToggleFullscreen} className="p-1.5 rounded text-muted-foreground hover:text-foreground" whileTap={{ scale: 0.9 }}>
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </motion.button>
          )}
          <motion.button onClick={onClose} className="p-1.5 rounded text-muted-foreground hover:text-destructive" whileTap={{ scale: 0.9 }}>
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {showCode ? (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-auto p-4"
            >
              <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-words">
                {code || "No code generated yet. Ask NOVA to build a website!"}
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex justify-center bg-muted/10 p-2"
            >
              <div
                className="h-full rounded-lg overflow-hidden border border-border/20 bg-white transition-all duration-300"
                style={{ width: viewportSizes[viewport].width, maxWidth: "100%" }}
              >
                <iframe
                  key={key}
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Viewport label */}
      <div className="px-3 py-1.5 border-t border-border/20 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground">
          {viewportSizes[viewport].label} · {viewportSizes[viewport].width}
        </span>
        {code && (
          <span className="text-[9px] font-mono text-primary/50">
            {(code.length / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default WebPreviewPanel;
