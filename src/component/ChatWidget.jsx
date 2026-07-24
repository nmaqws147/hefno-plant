import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, X, Plus, MessageSquare, Search, ArrowUp, Sprout, Bot } from 'lucide-react';

const SUGGESTIONS = [
  { text: 'كيف أعتني بنبات الطماطم؟', icon: Sprout },
  { text: 'ما هي أعراض مرض البياض الدقيقي؟', icon: Search },
  { text: 'كم مرة أسقي فيها النباتات المنزلية؟', icon: Sparkles },
];

const AiIcon = ({ className }) => {
  const [errored, setErrored] = useState(false);
  if (errored) return <Bot size={12} className="text-emerald-600 dark:text-emerald-400" />;
  return (
    <img
      src="/ai-assistant.avif"
      alt="AI"
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

const AIMsgAvatar = () => (
  <div className="size-7 rounded-full overflow-hidden border-2 border-emerald-400/60 shrink-0 bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center">
    <AiIcon className="size-full object-cover" />
  </div>
);

const UserMsgAvatar = () => (
  <div className="size-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center text-white shrink-0">
    <Sprout size={12} />
  </div>
);

const formatRelativeTime = (ts) => {
  const now = new Date();
  const d = new Date(ts);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
};

const formatRelativeDate = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'الأمس';
  if (diffDays <= 7) return `منذ ${diffDays} أيام`;
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
};

const ChatWidget = () => {
  const location = useLocation();
  if (["/login", "/signup"].includes(location.pathname)) return null;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('history');
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiChatHistory')) || []; } catch { return []; }
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiConversationHistory')) || []; } catch { return []; }
  });
  const [savedChats, setSavedChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiSavedChats')) || []; } catch { return []; }
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    try { const v = localStorage.getItem('aiCurrentChatId'); return v ? Number(v) : null; } catch { return null; }
  });
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const panelRef = useRef(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0) scrollToBottom();
  }, [isOpen, messages.length, scrollToBottom]);

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    localStorage.setItem('aiConversationHistory', JSON.stringify(conversationHistory));
    localStorage.setItem('aiSavedChats', JSON.stringify(savedChats));
    if (currentChatId) localStorage.setItem('aiCurrentChatId', String(currentChatId));
  }, [messages, conversationHistory, savedChats, currentChatId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.chat-widget-btn')) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.__chatWidgetOpen = () => {
      if (!user) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      setIsOpen(true);
    };
    return () => { delete window.__chatWidgetOpen; };
  }, [user, navigate]);

  const sendMessage = useCallback(async (textOverride) => {
    const textToSend = textOverride || inputMessage.trim();
    if (!textToSend || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;
    setView('chat');
    const messageId = Date.now();
    const userMessage = {
      id: messageId, text: textToSend, sender: 'user',
      timestamp: new Date().toISOString(), category: 'general',
      date: new Date().toISOString().split('T')[0], status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    const typingDelay = setTimeout(() => setShowTyping(true), 800);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: textToSend, category: 'general',
          conversationHistory: conversationHistory.slice(-10)
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`خطأ في الخادم (${response.status})`);
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      const aiMessage = {
        id: Date.now() + 1, text: data.reply, sender: 'ai',
        timestamp: new Date().toISOString(), category: 'general',
        date: new Date().toISOString().split('T')[0]
      };
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sent' } : m).concat(aiMessage));
      setConversationHistory(prev => [...prev, userMessage, aiMessage].slice(-50));
    } catch (error) {
      let errorLabel = 'ضغط مؤقت على الخدمة';
      if (error.name === 'AbortError') errorLabel = 'انتهت المهلة';
      else if (error.message.includes('Failed to fetch')) errorLabel = 'مشكلة في الاتصال';
      else if (error.message.includes('quota') || error.message.includes('429')) errorLabel = 'تجاوز الحد المسموح';
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'failed' } : m).concat({
        id: Date.now() + 1, text: null, sender: 'ai', isError: true,
        errorLabel, lastUserMsg: textToSend, timestamp: new Date().toISOString()
      }));
    } finally {
      setIsLoading(false);
      setShowTyping(false);
      clearTimeout(typingDelay);
      isSendingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [inputMessage, isLoading, conversationHistory]);

  const startNewChat = useCallback(() => {
    if (messages.length > 0) {
      const chat = {
        id: currentChatId || Date.now(), messages, conversationHistory,
        title: messages[0]?.text?.substring(0, 45) || 'محادثة جديدة',
        createdAt: messages[0]?.timestamp || new Date().toISOString(),
        messageCount: messages.length
      };
      setSavedChats(prev => {
        const filtered = currentChatId ? prev.filter(c => c.id !== currentChatId) : prev;
        return [chat, ...filtered].slice(0, 50);
      });
    }
    setMessages([]);
    setConversationHistory([]);
    setCurrentChatId(null);
    setInputMessage('');
    setView('chat');
  }, [messages, conversationHistory, currentChatId]);

  const loadChat = useCallback((chat) => {
    setMessages(chat.messages || []);
    setConversationHistory(chat.conversationHistory || []);
    setCurrentChatId(chat.id);
    setView('chat');
  }, []);

  const deleteChat = useCallback((chatId, e) => {
    e.stopPropagation();
    setSavedChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setConversationHistory([]);
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const groupedChats = useMemo(() => {
    const groups = {};
    const all = savedChats.filter(c => !currentChatId || c.id !== currentChatId);
    if (messages.length > 0) {
      const current = {
        id: currentChatId || 'current', messages, conversationHistory,
        title: messages[0]?.text?.substring(0, 45) || 'محادثة جديدة',
        createdAt: messages[0]?.timestamp || new Date().toISOString(),
        messageCount: messages.length, isActive: true
      };
      all.unshift(current);
    }
    all.forEach(chat => {
      const key = formatRelativeDate(chat.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(chat);
    });
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return Object.fromEntries(
        Object.entries(groups).map(([key, chats]) => [
          key, chats.filter(c => c.title.toLowerCase().includes(q))
        ]).filter(([, chats]) => chats.length > 0)
      );
    }
    return groups;
  }, [savedChats, messages, currentChatId, conversationHistory, searchQuery]);

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = message.date || new Date(message.timestamp).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) sendMessage();
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
  };

  const groupedDates = Object.keys(groupedChats);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-widget-btn fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden grid place-items-center"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <div className="size-full">
            <AiIcon className="size-full object-cover" />
          </div>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-5 sm:w-[380px] z-50 max-h-[calc(100vh-8rem)] h-[400px] sm:h-[450px] bg-white dark:bg-gray-900 rounded-2xl border border-forest/10 dark:border-gray-700 shadow-2xl shadow-forest/10 dark:shadow-black/40 overflow-hidden flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full overflow-hidden border-2 border-emerald-400/60 ring-1 ring-emerald-200 dark:ring-emerald-800/40 shrink-0 bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center">
                  <AiIcon className="size-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-forest dark:text-[#f5f5f4]">Hefno AI</h3>
                  <p className="text-[10px] text-[#8a8580] dark:text-gray-500">المساعد الزراعي الذكي</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={startNewChat}
                  title="محادثة جديدة"
                  className="p-2 rounded-lg text-[#8a8580] dark:text-gray-400 hover:bg-forest/[0.06] dark:hover:bg-gray-800 transition-colors"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-[#8a8580] dark:text-gray-400 hover:bg-forest/[0.06] dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* View: History */}
              {view === 'history' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {groupedDates.length === 0 && messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                      <div className="size-12 rounded-2xl overflow-hidden border-2 border-emerald-400/60 bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                        <AiIcon className="size-full object-cover" />
                      </div>
                      <p className="text-sm font-bold text-forest dark:text-[#f5f5f4]">مرحباً بك في Hefno AI</p>
                      <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 mb-5">اسألني عن الزراعة، النباتات، والمبيدات</p>
                      <button
                        onClick={() => { setView('chat'); }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-l from-forest to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        بدء محادثة
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Search */}
                      <div className="px-3 pt-3 pb-1">
                        <div className="relative">
                          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8580] dark:text-gray-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في المحادثات..."
                            className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/10 dark:border-gray-700 rounded-xl px-3 py-2 pr-9 text-xs text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Chat list */}
                      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                        {groupedDates.map(date => (
                          <div key={date}>
                            <p className="text-[10px] font-semibold text-[#8a8580] dark:text-gray-500 px-1 py-1.5">{date}</p>
                            {groupedChats[date].map(chat => (
                              <button
                                key={chat.id}
                                onClick={() => {
                                  if (chat.isActive) { setView('chat'); return; }
                                  loadChat(chat);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-right transition-colors ${
                                  chat.isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40'
                                    : 'hover:bg-forest/[0.04] dark:hover:bg-gray-800 border border-transparent'
                                }`}
                              >
                                <MessageSquare size={14} className="shrink-0 text-[#8a8580] dark:text-gray-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-forest dark:text-[#f5f5f4] truncate">{chat.title}</p>
                                  <p className="text-[10px] text-[#8a8580] dark:text-gray-500">{chat.messageCount} رسائل</p>
                                </div>
                                {!chat.isActive && (
                                  <button
                                    onClick={(e) => deleteChat(chat.id, e)}
                                    className="p-1 rounded-lg text-[#8a8580]/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* View: Chat */}
              {view === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
                  >
                    {!messages.length ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="size-10 rounded-2xl overflow-hidden border-2 border-emerald-400/60 bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                          <AiIcon className="size-full object-cover" />
                        </div>
                        <p className="text-sm font-bold text-forest dark:text-[#f5f5f4]">كيف يمكنني مساعدتك؟</p>
                        <div className="flex flex-col gap-2 mt-4 w-full max-w-[260px]">
                          {SUGGESTIONS.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(s.text)}
                              disabled={isLoading}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/[0.04] dark:bg-gray-800 border border-forest/10 dark:border-gray-700 text-xs text-forest dark:text-[#f5f5f4] hover:bg-forest/[0.08] dark:hover:bg-gray-700 transition-colors text-right disabled:opacity-50"
                            >
                              <s.icon size={14} className="shrink-0 text-emerald-500" />
                              {s.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                          <div key={date}>
                            <div className="flex justify-center mb-2">
                              <span className="text-[10px] text-[#8a8580] dark:text-gray-500 bg-champagne dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                                {formatRelativeDate(date)}
                              </span>
                            </div>
                            {msgs.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-start' : 'justify-end flex-row-reverse'}`}
                              >
                                {msg.sender === 'user' ? <UserMsgAvatar /> : <AIMsgAvatar />}
                                <div className="max-w-[80%] sm:max-w-[75%]">
                                  <div
                                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                      msg.sender === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-md'
                                        : msg.isError
                                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                                          : 'bg-forest/[0.04] dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tr-md'
                                    }`}
                                  >
                                    {msg.sender === 'ai' && !msg.isError ? (
                                      <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{formatText(msg.text) || ''}</ReactMarkdown>
                                      </div>
                                    ) : msg.isError ? (
                                      <div>
                                        <p>{msg.errorLabel}</p>
                                        <button
                                          onClick={() => sendMessage(msg.lastUserMsg)}
                                          className="mt-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                        >
                                          إعادة الإرسال
                                        </button>
                                      </div>
                                    ) : (
                                      <p>{msg.text}</p>
                                    )}
                                  </div>
                                  <div className={`flex items-center gap-1 mt-0.5 ${msg.sender === 'user' ? 'justify-start' : 'justify-end'} px-1`}>
                                    <span className="text-[9px] text-[#8a8580] dark:text-gray-500">
                                      {formatRelativeTime(msg.timestamp)}
                                    </span>
                                    {msg.sender === 'user' && msg.status === 'sending' && (
                                      <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                                    )}
                                    {msg.sender === 'user' && msg.status === 'failed' && (
                                      <span className="size-2 rounded-full bg-red-400" />
                                    )}
                                    {msg.sender === 'user' && msg.status === 'sent' && (
                                      <span className="size-2 rounded-full bg-emerald-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        {showTyping && (
                          <div className="flex gap-2 items-end">
                            <AIMsgAvatar />
                            <div className="bg-forest/[0.04] dark:bg-gray-800 rounded-2xl rounded-tr-md px-4 py-3">
                              <div className="flex gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-3">
                    <div className="flex items-center gap-2 bg-forest/[0.03] dark:bg-gray-800 border border-forest/10 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
                      <button
                        onClick={() => { if (!isLoading && inputMessage.trim()) sendMessage(); }}
                        disabled={!inputMessage.trim() || isLoading}
                        className="shrink-0 size-7 rounded-lg bg-emerald-500 text-white grid place-items-center hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowUp size={14} />
                        )}
                      </button>
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="اسأل Hefno AI..."
                        rows={1}
                        className="flex-1 bg-transparent text-xs text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 outline-none resize-none max-h-[100px]"
                        style={{ direction: 'rtl' }}
                      />
                    </div>
                    <p className="text-[9px] text-[#8a8580]/60 dark:text-gray-600 mt-1.5 text-center">Enter للإرسال • Shift+Enter لسطر جديد</p>
                  </div>
                </div>
              )}
            </div>

            {/* History/Back bar */}
            <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-3 py-1.5 flex items-center gap-2">
              {view === 'chat' && messages.length > 0 && (
                <button
                  onClick={() => setView('history')}
                  className="text-[10px] text-[#8a8580] dark:text-gray-500 hover:text-emerald-500 transition-colors"
                >
                  &larr; المحادثات السابقة
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
