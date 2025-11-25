"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { AgentThinking } from "@/components/chat/AgentThinking";
import { EmergencyPopup } from "@/components/chat/EmergencyPopup";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  toolsUsed?: string[];
  timestamp: Date;
  isNew?: boolean; // Track if this is a newly added message for typewriter effect
  metadata?: any; // Add metadata field
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>("");
  const [newestMessageId, setNewestMessageId] = useState<string | null>(null); // Track the newest AI message
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load conversation history
  useEffect(() => {
    if (session) {
      loadHistory();
    }
  }, [session]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/chat/history?limit=50", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        // API returns messages array in chronological order
        const messages = data.messages || [];
        
        // Check if we should apply typewriter effect
        const shouldApplyTypewriter = newestMessageId === 'newest';
        
        const formattedMessages = messages.map((msg: any, index: number) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          agent: msg.agentType,
          toolsUsed: msg.metadata?.toolsUsed,
          timestamp: new Date(msg.createdAt),
          metadata: msg.metadata,
          // Only apply typewriter to the last assistant message if we just sent a message
          isNew: shouldApplyTypewriter && msg.role === 'assistant' && index === messages.length - 1,
        }));
        
        setMessages(formattedMessages);
        
        // Clear the flag only after successfully loading with typewriter
        if (shouldApplyTypewriter) {
          // Use timeout to ensure state update happens after render
          setTimeout(() => setNewestMessageId(null), 100);
        }
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately for better UX
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Set flag before making request
    setNewestMessageId('newest');

    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }

      const data = await res.json();
      
      setCurrentAgent(data.metadata?.agent || "");
      
      // Check if we should show emergency popup
      if (data.metadata?.showEmergencyPopup) {
        setShowEmergencyPopup(true);
      }
      
      // Reload history from server to get saved messages with real IDs
      await loadHistory();
      
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
      // Clear the flag on error
      setNewestMessageId(null);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your conversation history?")) {
      return;
    }

    try {
      const res = await fetch("/api/chat/history", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        toast({
          title: "Success",
          description: "Conversation history cleared",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />

      {/* Emergency Popup */}
      <EmergencyPopup 
        show={showEmergencyPopup} 
        onClose={() => setShowEmergencyPopup(false)} 
      />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="glass-card mb-6 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Chat Assistant</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ask about academics, wellness, or campus life
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm text-destructive hover:underline"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 glass-card p-6 mb-4 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                I'm here to help you with academics, wellness, and campus life. Ask me anything!
              </p>
              <div className="grid gap-3 max-w-lg mx-auto">
                <button
                  onClick={() => handleSendMessage("Help me create a study schedule for finals week")}
                  className="glass-card p-3 text-left hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium">📚 Academic Help</p>
                  <p className="text-xs text-muted-foreground">Create study schedules and get exam tips</p>
                </button>
                <button
                  onClick={() => handleSendMessage("I'm feeling stressed about my workload")}
                  className="glass-card p-3 text-left hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium">💚 Wellness Support</p>
                  <p className="text-xs text-muted-foreground">Get help managing stress and self-care</p>
                </button>
                <button
                  onClick={() => handleSendMessage("What clubs should I join?")}
                  className="glass-card p-3 text-left hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium">🎉 Campus Life</p>
                  <p className="text-xs text-muted-foreground">Discover clubs, events, and resources</p>
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatBubble key={message.id} {...message} />
              ))}
              <AnimatePresence>
                {isLoading && <AgentThinking agent={currentAgent} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
