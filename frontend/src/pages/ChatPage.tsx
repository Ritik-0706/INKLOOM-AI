import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { Sparkles, Zap, Shield, BookOpen } from 'lucide-react';

export const ChatPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Feature Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-inkloom-primary via-indigo-600 to-inkloom-secondary text-white shadow-glow-primary relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Groq Accelerated Inference • LangChain Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            AI Brand Governance Copilot
          </h1>
          <p className="text-purple-100 text-sm leading-relaxed">
            Your interactive compliance strategist and copy polisher. Select any registered brand to strictly enforce its tone of voice, preferred vocabulary, prohibited clichés, and corroborated brand facts.
          </p>
        </div>

        {/* Feature quick stats */}
        <div className="hidden md:flex gap-6 mt-4 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>Zero Policy Leakage</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Multi-Tone Rewrites</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span>Active Knowledge Base Grounding</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="h-[750px] w-full">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
