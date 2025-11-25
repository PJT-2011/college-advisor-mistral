"use client";

import { useState, KeyboardEvent } from "react";
import { Send, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, disabled, isGenerating = false, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex gap-2 items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "AI is thinking..." : (placeholder || "Type your message... (Shift+Enter for new line)")}
          disabled={disabled}
          className={cn(
            "min-h-[60px] max-h-[200px] resize-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        {isGenerating ? (
          <Button
            onClick={handleStop}
            size="icon"
            variant="destructive"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {isGenerating ? "Click stop button to cancel generation" : "Press Enter to send, Shift+Enter for new line"}
      </p>
    </div>
  );
}
