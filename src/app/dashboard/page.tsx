"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Brain,
  Heart,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    messageCount: 0,
    adviceCount: 0,
    stressLevel: 0,
  });
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [recentAdvice, setRecentAdvice] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session) {
      loadDashboardData();
      
      // Refresh data when window gains focus
      const handleFocus = () => {
        loadDashboardData();
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [status, session, router]);

  const loadDashboardData = async () => {
    try {
      // Load profile for stress level (no cache)
      const profileRes = await fetch("/api/profile/me", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const stressValue = profileData.user?.profile?.stressLevel;
        setStats((prev) => ({
          ...prev,
          stressLevel: stressValue ? parseInt(stressValue) : 0,
        }));
      }

      // Load message history (no cache)
      const historyRes = await fetch("/api/chat/history?limit=5", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentConversations(historyData.messages || []);
        setStats((prev) => ({
          ...prev,
          messageCount: historyData.total || 0,
        }));
      }

      // Load advice history (no cache)
      const adviceRes = await fetch("/api/advice/history?limit=5", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (adviceRes.ok) {
        const adviceData = await adviceRes.json();
        setRecentAdvice(adviceData.advice || []);
        setStats((prev) => ({
          ...prev,
          adviceCount: adviceData.total || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's your college life overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.messageCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total messages sent
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI Recommendations
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adviceCount}</div>
                <p className="text-xs text-muted-foreground">
                  Personalized advice received
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stress Level
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.stressLevel}/10</div>
                <p className="text-xs text-muted-foreground">
                  {stats.stressLevel < 4
                    ? "Low - Keep it up!"
                    : stats.stressLevel < 7
                    ? "Moderate - Take care"
                    : "High - Seek support"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/chat">
                  <Button className="w-full" variant="default">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button className="w-full" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Browse Resources
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button className="w-full" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Your latest chat messages</CardDescription>
              </CardHeader>
              <CardContent>
                {recentConversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet. Start chatting!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentConversations.slice(0, 5).map((msg: any) => (
                      <div
                        key={msg.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm line-clamp-2">{msg.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {msg.role === "assistant" && msg.metadata?.agent && (
                          <Badge variant="secondary" className="text-xs">
                            {msg.metadata.agent}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Advice */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Recent Advice</CardTitle>
                <CardDescription>AI-generated recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAdvice.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No advice yet. Chat with the AI to get started!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAdvice.slice(0, 5).map((advice: any) => (
                      <div
                        key={advice.id}
                        className="p-3 rounded-lg bg-accent/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {advice.category}
                          </Badge>
                          <Badge
                            variant={
                              advice.priority === "urgent"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {advice.priority}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{advice.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(advice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
