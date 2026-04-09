import { motion } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy?: () => void;
}

const ChatMessage = ({ message, onCopy }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${isAssistant ? "glass glow-border" : "bg-muted"}`}>
        {isAssistant ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
      </div>
      
      <div className="flex-1 max-w-[85%] group relative">
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${isAssistant ? "glass glow-border text-foreground" : "bg-primary/10 text-foreground border border-primary/20"}`}>
          {isAssistant ? (
            <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-muted/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_code]:font-mono [&_code]:text-xs [&_h1]:text-base [&_h2]:text-sm [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-sm [&_a]:text-primary [&_strong]:text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          ) : <p className="whitespace-pre-wrap">{message.content}</p>}
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground font-mono opacity-60">{message.timestamp.toLocaleTimeString()}</p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

   
      
