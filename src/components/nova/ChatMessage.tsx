import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isAssistant ? "glass glow-border" : "bg-muted"
        }`}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isAssistant
            ? "glass glow-border text-foreground"
            : "bg-primary/10 text-foreground border border-primary/20"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
