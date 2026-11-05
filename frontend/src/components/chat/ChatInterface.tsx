import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Key, Check, Copy, RefreshCw, AlertCircle,
  Trash2, ShieldCheck, Cpu, ChevronDown, CheckCircle2, BookOpen
} from 'lucide-react';
import api from '../../api/client';
import { BrandProfile, ChatMessage, ChatStatus, PromptSuggestion } from '../../types';

interface ChatInterfaceProps {
  compact?: boolean;
  initialBrandId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  compact = false,
  initialBrandId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('inkloom_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId || '');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem('inkloom_groq_model');
    if (saved && saved !== 'llama-3.3-70b-versatile') {
      return saved;
    }
    return 'qwen/qwen3.8-27b';
  });

  // API Key modal / drawer state
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('inkloom_groq_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('inkloom_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Load backend status, brands, and suggested prompts
  useEffect(() => {
    fetchChatStatus();
    fetchBrands();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatStatus = async () => {
    try {
      const res = await api.get('/chat/status');
      setStatus(res.data);
      if (res.data.model) {
        setSelectedModel((prev) => {
          if (!prev || prev === 'llama-3.3-70b-versatile') {
            localStorage.setItem('inkloom_groq_model', res.data.model);
            return res.data.model;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch chat status', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
      if (!selectedBrandId && res.data.length > 0) {
        setSelectedBrandId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch brands', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/chat/suggested-prompts');
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to fetch suggested prompts', err);
    }
  };

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('inkloom_groq_key', customApiKey.trim());
    } else {
      localStorage.removeItem('inkloom_groq_key');
    }
    setShowKeyModal(false);
    setTestResult(null);
    fetchChatStatus();
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const keyToTest = customApiKey.trim() || undefined;
      const res = await api.post('/chat/test-connection', {
        api_key: keyToTest,
        model: selectedModel,
      });
      setTestResult({
        success: res.data.success,
        message: res.data.message,
      });
      if (res.data.success && keyToTest) {
        localStorage.setItem('inkloom_groq_key', keyToTest);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.detail || err.message || 'Connection test failed',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    const activeBrand = brands.find((b) => b.id === selectedBrandId);

    try {
      const storedKey = localStorage.getItem('inkloom_groq_key') || undefined;

      // Format history payload for backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/chat/message', {
        message: promptText,
        history: historyPayload,
        brand_id: selectedBrandId || undefined,
        api_key: storedKey,
        model: selectedModel,
        temperature: 0.7,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        brand_id: res.data.brand_id,
        brand_name: res.data.brand_name || activeBrand?.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to generate response.';
      setErrorMessage(detail);

      // If missing key, prompt user
      if (detail.includes('Groq API key') || err.response?.status === 400 || err.response?.status === 401) {
        setShowKeyModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation messages?')) {
      setMessages([]);
      localStorage.removeItem('inkloom_chat_history');
      setErrorMessage(null);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeBrand = brands.find((b) => b.id === selectedBrandId);
  const isKeyActive = Boolean(status?.has_env_key || localStorage.getItem('inkloom_groq_key'));

  const getModelLabel = (modelId: string) => {
    switch (modelId) {
      case 'qwen/qwen3.8-27b':
        return 'Qwen 3.8 27B';
      case 'openai/gpt-oss-120b':
        return 'GPT-OSS 120B';
      case 'openai/gpt-oss-20b':
        return 'GPT-OSS 20B';
      case 'allam-2-7b':
        return 'ALLaM 2 7B';
      default:
        return modelId;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl border border-inkloom-border shadow-card-soft overflow-hidden ${compact ? 'text-sm' : ''}`}>
      {/* Header bar */}
      <div className="p-4 border-b border-inkloom-border bg-gradient-to-r from-inkloom-bg via-white to-purple-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-inkloom-primary to-indigo-600 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-inkloom-text text-base sm:text-lg tracking-tight">
                Inkloom Copilot
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-inkloom-primary border border-purple-200">
                Groq Free AI
              </span>
            </div>
            <p className="text-xs text-inkloom-muted">
              Enterprise brand governance & compliance assistant via LangChain
            </p>
          </div>
        </div>

        {/* Brand & Model Selectors */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Brand select */}
          <div className="flex items-center gap-1.5 bg-white border border-inkloom-border rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
            <BookOpen className="w-3.5 h-3.5 text-inkloom-primary" />
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent font-medium text-inkloom-text outline-none cursor-pointer pr-1"
            >
              <option value="">General Brand Governance</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model select */}
          <div className="flex items-center gap-1.5 bg-white border border-inkloom-border rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
            <Cpu className="w-3.5 h-3.5 text-inkloom-secondary" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                localStorage.setItem('inkloom_groq_model', e.target.value);
              }}
              className="bg-transparent font-medium text-inkloom-text outline-none cursor-pointer pr-1"
            >
              {(status?.available_models && status.available_models.length > 0
                ? status.available_models
                : ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'allam-2-7b']
              ).map((m) => (
                <option key={m} value={m}>
                  {getModelLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Configure Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isKeyActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title={isKeyActive ? 'Groq Key Active' : 'Configure Groq API Key'}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isKeyActive ? 'Key Active' : 'Set Groq Key'}</span>
            <span className={`w-2 h-2 rounded-full ${isKeyActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>

          {/* Clear messages */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 text-inkloom-muted hover:text-inkloom-error rounded-lg hover:bg-red-50 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Brand Context Banner */}
      {activeBrand && (
        <div className="bg-purple-50/70 border-b border-purple-100 px-4 py-2 flex items-center justify-between text-xs text-inkloom-text">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-inkloom-primary flex-shrink-0" />
            <span>
              <strong>Grounded in:</strong> {activeBrand.name} ({activeBrand.industry || 'Enterprise'}) — Enforcing tone, preferred terms, and prohibited keywords.
            </span>
          </div>
          <span className="text-[10px] font-semibold text-inkloom-primary uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-purple-200">
            Active Guidelines
          </span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-inkloom-primary to-inkloom-secondary flex items-center justify-center text-white shadow-glow-primary mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-inkloom-text mb-1">
              Welcome to Inkloom Brand Copilot
            </h3>
            <p className="text-sm text-inkloom-muted mb-6 leading-relaxed">
              Powered by Groq's high-speed inference & LangChain. Ask questions about your brand rules, test copy for compliance, or rewrite content to stay 100% on-brand.
            </p>

            {/* Starter Prompts */}
            <div className="w-full text-left space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-inkloom-muted px-1">
                Suggested Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSendMessage(s.prompt)}
                    className="p-3 text-left rounded-xl bg-inkloom-bg/80 hover:bg-purple-50/80 border border-inkloom-border hover:border-inkloom-primary/40 transition-all text-xs group"
                  >
                    <div className="font-semibold text-inkloom-text group-hover:text-inkloom-primary mb-1">
                      {s.title}
                    </div>
                    <div className="text-inkloom-muted line-clamp-2">
                      {s.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-inkloom-primary to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-inkloom-primary to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-inkloom-border text-inkloom-text rounded-tl-none'
                  }`}
                >
                  {/* Message header */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-75">
                    <span className="font-semibold">
                      {isUser ? 'You' : 'Inkloom Copilot'}
                      {msg.brand_name && !isUser && ` • ${msg.brand_name}`}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.timestamp && <span>{msg.timestamp}</span>}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="hover:opacity-100 text-inkloom-muted hover:text-inkloom-primary transition-opacity"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="whitespace-pre-wrap leading-relaxed text-sm break-words font-sans">
                    {msg.content}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-inkloom-text flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5 text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center text-inkloom-muted text-xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-inkloom-primary to-indigo-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-inkloom-border rounded-2xl p-3.5 shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-inkloom-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-inkloom-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-inkloom-primary animate-bounce" />
              </div>
              <span className="font-medium">Thinking with Groq ({selectedModel})...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <div className="font-bold">Error Processing Prompt</div>
              <div>{errorMessage}</div>
              {errorMessage.includes('Groq API key') && (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="mt-1.5 font-bold underline hover:no-underline text-red-800"
                >
                  Click here to set your Groq API Key
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 border-t border-inkloom-border bg-inkloom-bg/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2 bg-white rounded-2xl border border-inkloom-border p-2 focus-within:border-inkloom-primary focus-within:ring-2 focus-within:ring-inkloom-primary/20 transition-all shadow-sm"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeBrand
                ? `Ask Inkloom Copilot about ${activeBrand.name} guidelines, or paste copy to review...`
                : "Ask anything about brand compliance, tone, or paste copy to rewrite..."
            }
            rows={compact ? 2 : 3}
            className="flex-1 bg-transparent resize-none outline-none text-inkloom-text placeholder:text-inkloom-muted text-sm px-2 py-1 max-h-32"
          />

          <div className="flex items-center gap-1.5 self-end">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-inkloom-primary to-indigo-600 text-white shadow-glow-primary hover:opacity-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-inkloom-muted">
          <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line</span>
          <span>Powered by Groq • LangChain</span>
        </div>
      </div>

      {/* Groq API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-inkloom-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-inkloom-primary flex items-center justify-center border border-purple-100">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-inkloom-text text-base">
                    Configure Groq API Key
                  </h3>
                  <p className="text-xs text-inkloom-muted">
                    Fast & Free AI inference for brand governance
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setTestResult(null);
                }}
                className="text-inkloom-muted hover:text-inkloom-text text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-inkloom-muted leading-relaxed">
                Inkloom Copilot uses <strong>Groq's Free Model Tier</strong> via LangChain. You can obtain a free key at{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-inkloom-primary font-bold underline hover:no-underline"
                >
                  console.groq.com
                </a>
                .
              </p>

              <div>
                <label className="block font-bold text-inkloom-text mb-1.5">
                  Groq API Key (starts with <code className="bg-gray-100 px-1 py-0.5 rounded">gsk_</code>)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl border border-inkloom-border focus:border-inkloom-primary focus:ring-2 focus:ring-inkloom-primary/20 outline-none text-xs text-inkloom-text"
                />
                <span className="text-[11px] text-inkloom-muted block mt-1">
                  Saved securely in your browser's local storage and used for Copilot queries.
                </span>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 break-words">{testResult.message}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={isTestingKey}
                  className="px-3 py-2 rounded-xl border border-inkloom-border font-semibold text-inkloom-text hover:bg-inkloom-bg transition-colors flex items-center gap-1.5"
                >
                  {isTestingKey && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowKeyModal(false);
                      setTestResult(null);
                    }}
                    className="px-3 py-2 rounded-xl text-inkloom-muted hover:text-inkloom-text font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-inkloom-primary to-indigo-600 text-white font-bold shadow-glow-primary hover:opacity-95"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
