import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Heart, 
  Users, 
  Calendar, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 animate-gradient" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Powered by Local AI - 100% Private</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Your Personal{" "}
            <span className="gradient-text">AI College Advisor</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Get instant guidance on academics, wellness, and campus life—all powered by 
            advanced AI running locally on your device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/chat">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Chatting
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-card">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Three Specialized AI Agents
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            Our multi-agent system understands your needs and routes you to the right expert
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Academic Agent */}
            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Academic Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Study schedules, exam prep strategies, time management tips, and course planning assistance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Personalized study schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Exam preparation plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Assignment task breakdown</span>
                </li>
              </ul>
            </Card>

            {/* Wellness Agent */}
            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Wellness & Mental Health</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Stress management, mindfulness guidance, and crisis support with instant access to resources.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Stress reduction techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">24/7 crisis hotline access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Mindfulness exercises</span>
                </li>
              </ul>
            </Card>

            {/* Campus Life Agent */}
            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Campus Life</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Club recommendations, event discovery, housing advice, and social connection guidance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Personalized club matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Campus event calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Resource directory</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Powerful AI Tools at Your Fingertips
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            Our AI doesn't just chat—it takes action with specialized tools
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card p-6">
              <Calendar className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically generates study schedules and exam prep plans based on your courses and preferences.
              </p>
            </Card>
            
            <Card className="glass-card p-6">
              <BookOpen className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Task Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Creates prioritized to-do lists with daily and weekly tasks tailored to your academic load.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card mb-8">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-medium">100% Private & Secure</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            Your Data Stays on Your Device
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Unlike cloud-based AI assistants, our Mistral-powered system runs entirely locally. 
            Your conversations, academic records, and personal information never leave your computer.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold mb-2">No Cloud Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All data stored in your local database
              </p>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold mb-2">No API Calls</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI runs on your GPU or CPU locally
              </p>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold mb-2">Full Control</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You own and control all your data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-card p-12 border-2 border-purple-200 dark:border-purple-800">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your College Experience?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join students who are already using AI to excel academically, 
              maintain wellness, and thrive socially.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-card">
                  Try Demo Chat
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 College Advisor AI. Powered by Mistral-7B running locally.</p>
          <p className="mt-2 text-sm">
            Built with Next.js, TypeScript, and advanced multi-agent orchestration
          </p>
        </div>
      </footer>
    </div>
  );
}
