"use client";

import { motion } from "framer-motion";
import { Bot, Loader2 } from "lucide-react";

interface AgentThinkingProps {
  agent?: string;
  message?: string;
}

export function AgentThinking({ agent, message }: AgentThinkingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3 mb-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Thinking Animation */}
      <div className="glass-card rounded-2xl px-4 py-3 max-w-[70%]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          <span className="text-sm text-muted-foreground">
            {message || `${agent || "AI"} is thinking...`}
          </span>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
