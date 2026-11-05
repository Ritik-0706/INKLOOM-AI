import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Maximize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatInterface } from './ChatInterface';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If already on the dedicated /chat page, don't show the floating widget
  if (location.pathname === '/chat') {
    return null;
  }

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-r from-inkloom-primary to-indigo-600 text-white shadow-glow-primary hover:shadow-glow-secondary transition-all flex items-center gap-2.5 font-bold text-sm"
          title="Open Inkloom Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-inkloom-highlight rounded-full border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-inkloom-highlight rounded-full border-2 border-white" />
          </div>
          <span className="hidden sm:inline-block pr-1 font-semibold tracking-tight">
            Ask Copilot
          </span>
        </motion.button>
      </div>

      {/* Floating Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 flex flex-col justify-end pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full sm:w-[480px] h-[85vh] sm:h-[620px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl border border-inkloom-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Top Navigation bar */}
              <div className="bg-inkloom-text text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-inkloom-primary to-indigo-500 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs tracking-tight">Inkloom Copilot</span>
                    <span className="text-[10px] text-gray-300 ml-2">Groq AI</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/chat');
                    }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Open Full Screen Workspace"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Interface body in compact mode */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface compact={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
