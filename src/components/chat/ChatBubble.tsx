"use client";

import { motion } from "framer-motion";
import { User, Bot, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  agent?: string;
  toolsUsed?: string[];
  timestamp?: Date;
  isNew?: boolean; // Flag to indicate if this is a newly added message
}

export function ChatBubble({ role, content, agent, toolsUsed, timestamp, isNew = false }: ChatBubbleProps) {
  const isUser = role === "user";
  const [displayedContent, setDisplayedContent] = useState(isUser || !isNew ? content : "");
  const [isTyping, setIsTyping] = useState(!isUser && isNew);

  useEffect(() => {
    // Only apply typewriter effect for new assistant messages
    if (!isUser && isNew && content) {
      let currentIndex = 0;
      setDisplayedContent("");
      setIsTyping(true);

      const typeInterval = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 20); // Adjust speed here (lower = faster)

      return () => clearInterval(typeInterval);
    } else {
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, isUser, isNew]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-600"
            : "bg-gradient-to-br from-purple-500 to-pink-600"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-2 max-w-[70%]", isUser && "items-end")}>
        {/* Agent Badge (for assistant only) */}
        {!isUser && agent && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {agent} Agent
            </Badge>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 break-words",
            isUser
              ? "chat-bubble-user text-white"
              : "chat-bubble-assistant text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayedContent}
            {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse">|</span>}
          </p>
        </div>

        {/* Tools Used (for assistant only) */}
        {!isUser && toolsUsed && toolsUsed.length > 0 && !isTyping && (
          <div className="flex flex-wrap gap-1">
            {toolsUsed.map((tool) => (
              <Badge key={tool} variant="outline" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && !isTyping && (
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
