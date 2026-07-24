import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Mic, Square, Search, X, Menu,
  Pill, Sun, Lightbulb, Sparkles, ArrowUp, MessageSquare, Plus,
  ChevronLeft, Sprout
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import useTracking from '../hooks/useTracking';
import SEO from './SEO';
import { makeBreadcrumbs, makeWebApp } from './structuredData';

const CATEGORIES = [
  { id: 'diseases', name: 'تشخيص الأمراض', icon: Search },
  { id: 'treatment', name: 'العلاج والرعاية', icon: Pill },
  { id: 'weather', name: 'نصائح الطقس', icon: Sun },
  { id: 'general', name: 'استشارات عامة', icon: Lightbulb }
];

const SUGGESTIONS = [
  { text: 'كيف أعتني بنبات الطماطم؟', icon: Sprout },
  { text: 'ما هي أعراض مرض البياض الدقيقي؟', icon: Search },
  { text: 'كم مرة أسقي فيها النباتات المنزلية؟', icon: Sun },
];

const AIMsgAvatar = () => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="size-8 rounded-full overflow-hidden border-2 border-emerald-400/60 ring-2 ring-emerald-100 dark:ring-emerald-900/30 shrink-0 shadow-sm bg-emerald-100 dark:bg-emerald-900/30">
      {imgError ? (
        <div className="size-full grid place-items-center">
          <Bot size={14} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      ) : (
        <img
          src="/ai-assistant.avif"
          alt="Hefno AI"
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
};

const HeaderAvatar = () => {
  const [imgError, setImgError] = useState(false);
  return imgError ? (
    <div className="size-full rounded-xl grid place-items-center">
      <Bot size={18} className="text-white/80" />
    </div>
  ) : (
    <img
      src="/ai-assistant.avif"
      alt="Hefno AI"
      className="size-full object-cover"
      onError={() => setImgError(true)}
    />
  );
};

const EmptyAvatar = () => {
  const [imgError, setImgError] = useState(false);
  return imgError ? (
    <div className="size-full rounded-2xl grid place-items-center">
      <Bot size={32} className="text-emerald-500 dark:text-emerald-400" />
    </div>
  ) : (
    <img
      src="/ai-assistant.avif"
      alt="Hefno AI"
      className="size-full object-cover"
      onError={() => setImgError(true)}
    />
  );
};

const UserMsgAvatar = () => (
  <div className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-primary border-2 border-emerald-500 grid place-items-center text-white shadow-sm">
    <Sprout size={14} />
  </div>
);

const AIAssistant = () => {
  const { trackAction } = useTracking();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('aiChatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState(() => {
    const saved = localStorage.getItem('aiConversationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState('diseases');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });
  const [savedChats, setSavedChats] = useState(() => {
    const saved = localStorage.getItem('aiSavedChats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('aiCurrentChatId');
    return saved ? Number(saved) : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('aiOnboardingSeen');
  });

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSendingRef = useRef(false);
  const lastTranscriptRef = useRef('');
  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  const formatMessageText = useCallback((text) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
  }, []);

  const formatDate = useCallback((dateString) => {
    const now = new Date();
    const d = new Date(dateString);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'الأمس';
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  }, []);

  const formatRelativeTime = useCallback((ts) => {
    const now = new Date();
    const d = new Date(ts);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  }, []);

  const formatRelativeDate = useCallback((dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'الأمس';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    return new Date(dateString).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  }, []);

  const historyChats = useMemo(() => {
    let all = [...savedChats];
    if (messages.length > 0) {
      const current = {
        id: currentChatId || 'current',
        messages,
        conversationHistory,
        title: messages[0]?.text?.substring(0, 45) || 'محادثة جديدة',
        createdAt: messages[0]?.timestamp || new Date().toISOString(),
        messageCount: messages.length,
        isActive: true
      };
      if (currentChatId) all = all.filter(c => c.id !== currentChatId);
      all.unshift(current);
    }
    const groups = {};
    all.forEach(chat => {
      const key = formatRelativeDate(chat.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(chat);
    });
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const filtered = {};
      Object.entries(groups).forEach(([key, chats]) => {
        const matched = chats.filter(c => c.title.toLowerCase().includes(q));
        if (matched.length) filtered[key] = matched;
      });
      return filtered;
    }
    return groups;
  }, [savedChats, messages, currentChatId, conversationHistory, formatRelativeDate, searchQuery]);

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = message.date || new Date(message.timestamp).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  }, [messages]);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsScrolledUp(distFromBottom > 100);
  }, []);

  const scrollToBottomSmooth = useCallback(() => {
    setNewMsgCount(0);
    scrollToBottom(true);
  }, [scrollToBottom]);

  const startSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    }, 2500);
  }, [isListening]);

  const sendMessage = useCallback(async (textOverride, skipInputClear = false) => {
    const textToSend = textOverride || inputMessage.trim();
    if (!textToSend || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;
    const messageId = Date.now();
    const userMessage = {
      id: messageId, text: textToSend, sender: 'user',
      timestamp: new Date().toISOString(), category: selectedCategory,
      date: new Date().toISOString().split('T')[0], status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    if (!skipInputClear) setInputMessage('');
    setTranscript('');
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
          userMessage: textToSend, category: selectedCategory,
          conversationHistory: conversationHistory.slice(-10)
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`فشل الاتصال بالخادم (${response.status})`);
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      const aiMessage = {
        id: Date.now() + 1, text: data.reply, sender: 'ai',
        timestamp: new Date().toISOString(), category: selectedCategory,
        date: new Date().toISOString().split('T')[0]
      };
      trackAction(`ai_${selectedCategory}_success`);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sent' } : m).concat(aiMessage));
      setConversationHistory(prev => [...prev, userMessage, aiMessage].slice(-50));
    } catch (error) {
      console.error('AI Error:', error);
      trackAction(`ai_${selectedCategory}_failed`);
      let errorLabel = ' ضغط مؤقت على الخدمة';
      if (error.name === 'AbortError') {
        errorLabel = ' انتهت المهلة';
      } else if (error.message.includes('Failed to fetch')) {
        errorLabel = ' مشكلة في الاتصال';
      } else if (error.message.includes('quota') || error.message.includes('429')) {
        errorLabel = ' تجاوز الحد المسموح';
      }
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'failed' } : m).concat({
        id: Date.now() + 1, text: null, sender: 'ai', isError: true,
        errorLabel, lastUserMsg: textToSend,
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsLoading(false);
      setShowTyping(false);
      clearTimeout(typingDelay);
      isSendingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [inputMessage, isLoading, selectedCategory, conversationHistory, trackAction]);

  const handleVoiceInput = useCallback((finalText) => {
    if (!finalText || finalText.trim().length === 0) return;
    if (lastTranscriptRef.current === finalText.trim()) return;
    lastTranscriptRef.current = finalText.trim();
    sendMessage(finalText.trim(), true);
  }, [sendMessage]);

  const touchStartX = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;
    if (diff > threshold && !sidebarOpen) setSidebarOpen(true);
    if (diff < -threshold && sidebarOpen) setSidebarOpen(false);
    touchStartX.current = null;
  }, [sidebarOpen]);

  const toggleListening = useCallback(() => {
    if (!isSpeechSupported) {
      toast.success('المتصفح لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.');
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); } else {
      setTranscript('');
      lastTranscriptRef.current = '';
      try { recognitionRef.current?.start(); } catch (error) { console.error('Failed to start recognition:', error); }
    }
  }, [isListening, isSpeechSupported]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) sendMessage();
    }
  }, [inputMessage, isLoading, sendMessage]);

  const handleCategoryChange = useCallback((categoryId) => { setSelectedCategory(categoryId); }, []);

  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0) return null;
    const chat = {
      id: currentChatId || Date.now(),
      messages,
      conversationHistory,
      title: messages[0]?.text?.substring(0, 45) || 'محادثة جديدة',
      createdAt: messages[0]?.timestamp || new Date().toISOString(),
      messageCount: messages.length
    };
    setSavedChats(prev => {
      const filtered = prev.filter(c => c.id !== chat.id);
      return [chat, ...filtered];
    });
    return chat.id;
  }, [messages, conversationHistory, currentChatId]);

  const [showDiscard, setShowDiscard] = useState(false);

  const startNewChat = useCallback(() => {
    saveCurrentChat();
    setMessages([]);
    setConversationHistory([]);
    setCurrentChatId(null);
    setInputMessage('');
    setTranscript('');
    setShowDiscard(false);
  }, [saveCurrentChat]);

  const discardAndNew = useCallback(() => {
  }, []);

  const loadChat = useCallback((chat) => {
    if (chat.id === currentChatId || chat.id === 'current') return;
    saveCurrentChat();
    setMessages(chat.messages);
    setConversationHistory(chat.conversationHistory);
    setCurrentChatId(chat.id);
    setInputMessage('');
    setTranscript('');
  }, [saveCurrentChat, currentChatId]);

  const deleteSavedChat = useCallback((chatId) => {
    setSavedChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setConversationHistory([]);
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) { setIsSpeechSupported(false); return; }
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); startSilenceTimer(); };
    recognition.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      startSilenceTimer();
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) setTranscript(prev => prev ? prev + ' ' + final : final);
    };
    recognition.onerror = (event) => {
      if (event.error === 'audio-capture') toast.success('لا يمكن الوصول إلى الميكروفون.');
      else if (event.error === 'not-allowed') toast.success('يرجى السماح بالوصول إلى الميكروفون.');
    };
    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      setTimeout(() => {
        const finalTranscript = transcript.trim();
        if (finalTranscript && finalTranscript.length > 0) handleVoiceInput(finalTranscript);
        setTranscript('');
      }, 100);
    };
    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); recognitionRef.current.onend = null; recognitionRef.current.onresult = null; recognitionRef.current.onerror = null; } catch (e) { }
      }
      clearTimeout(silenceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('aiSavedChats', JSON.stringify(savedChats));
    if (currentChatId) localStorage.setItem('aiCurrentChatId', String(currentChatId));
    else localStorage.removeItem('aiCurrentChatId');
    if (messages.length > 0) localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    else localStorage.removeItem('aiChatHistory');
    if (conversationHistory.length > 0) localStorage.setItem('aiConversationHistory', JSON.stringify(conversationHistory));
    else localStorage.removeItem('aiConversationHistory');
  }, [messages, conversationHistory, savedChats, currentChatId]);

  const prevLoadingRef = useRef(isLoading);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;
    if (wasLoading && !isLoading) {
      if (!isScrolledUp) scrollToBottom(); else setNewMsgCount(prev => prev + 1);
    }
  }, [isLoading, scrollToBottom, isScrolledUp]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
    }
  }, [inputMessage]);

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" dir="rtl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <SEO title="Hefno AI — المساعد الزراعي الذكي" description="المساعد الزراعي الذكي Hefno AI — إجابات فورية عن أمراض النباتات والمبيدات والتسميد." url="/ai-chat" keywords="مساعد زراعي ذكي, AI زراعي, اسأل عن النباتات, استشارات زراعية, ذكاء اصطناعي للمزارعين" breadcrumbs={makeBreadcrumbs('/ai-chat')} jsonLd={makeWebApp('المساعد الزراعي الذكي', '/ai-chat', 'المساعد الزراعي بالذكاء الاصطناعي — إجابات فورية عن النباتات والمبيدات والتسميد')} />

      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes typing-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes mic-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        @keyframes ping-ring { 0% { transform: scale(0.95); opacity: 1; } 70% { transform: scale(1.2); opacity: 0; } 100% { transform: scale(1.2); opacity: 0; } }
        .chat-msgs { max-width: 680px; margin: 0 auto; width: 100%; }
        .chat-input-area { max-width: 680px; margin: 0 auto; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 2px; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; animation: typing-bounce 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* ─── Premium Header ─── */}
      <div className={`sticky top-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 ${sidebarOpen ? 'z-[45]' : ''}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="size-10 sm:size-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-md grid place-items-center text-white hover:bg-white/30 transition-all shrink-0 cursor-pointer active:scale-95"
                aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
                    <div className="size-10 rounded-xl overflow-hidden border-2 border-white/30 ring-2 ring-white/10 shrink-0 shadow-sm bg-emerald-600">
                      <HeaderAvatar />
                    </div>
                    <div>
                <h1 className="text-base sm:text-lg font-black text-white">Hefno AI</h1>
                <div className="flex items-center gap-1 text-[11px] text-emerald-100/70">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_2s_ease-in-out_infinite] inline-block shrink-0" />
                  <span className="hidden sm:inline">نشط</span>
                  <span className="mx-1 text-emerald-100/30 hidden sm:inline">|</span>
                  <MessageSquare size={10} className="shrink-0" />
                  <span className="hidden sm:inline">{messages.length} رسالة</span>
                  <span className="sm:hidden">{messages.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-emerald-100/70 text-[10px] font-medium">
                <Sparkles size={10} />
                <span>AI • ذكاء اصطناعي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowOnboarding(false); localStorage.setItem('aiOnboardingSeen', 'true'); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="size-16 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-emerald-200 dark:border-emerald-700/50">
              <img src="/ai-assistant.avif" alt="" className="size-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">مرحباً بك في Hefno AI</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              المساعد الزراعي الذكي. يمكنك التحدث معي بالصوت، تصفح المحادثات السابقة، واختيار التصنيف المناسب لسؤالك.
            </p>
            <div className="space-y-2 text-right mb-5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><span className="text-lg">🎤</span> اضغط على الميكروفون للتحدث صوتياً</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><span className="text-lg">📋</span> اختر تصنيفاً لتحصل على إجابة أدق</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><span className="text-lg">💾</span> تُحفظ المحادثات تلقائياً للرجوع إليها</div>
            </div>
            <button
              onClick={() => { setShowOnboarding(false); localStorage.setItem('aiOnboardingSeen', 'true'); }}
              className="w-full px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-sm"
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="relative flex gap-4 h-[calc(100dvh-200px)] sm:h-[calc(100vh-180px)] landscape:h-[calc(100dvh-130px)]">

          {/* ─── Swipe Hint (mobile, sidebar closed) ─── */}
          {!sidebarOpen && (
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 lg:hidden pointer-events-none">
              <div className="h-16 w-1 rounded-r-full bg-emerald-400/60 animate-pulse shadow-lg shadow-emerald-500/20" />
            </div>
          )}

          {/* ─── Sidebar Overlay (mobile) ─── */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden cursor-pointer" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ─── Sidebar ─── */}
          <aside
            ref={sidebarRef}
            className={`z-50 transition-all duration-300 ease-in-out overflow-hidden ${
              sidebarOpen
                ? 'fixed lg:static top-20 lg:top-0 bottom-0 right-0 lg:right-auto shrink-0 opacity-100 translate-x-0 lg:translate-x-0 w-[260px] shadow-2xl lg:shadow-none'
                : 'fixed lg:static top-20 lg:top-0 bottom-0 right-0 lg:right-auto opacity-100 lg:opacity-0 translate-x-full lg:translate-x-0 w-[260px] lg:w-0'
            }`}
          >
            <div className="bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm h-full lg:max-h-[calc(100dvh-200px)] max-h-[calc(100dvh-120px)] lg:overflow-y-auto overflow-y-auto scrollbar-thin p-4 space-y-4 pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between lg:hidden mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">القائمة</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="size-7 rounded-lg bg-gray-100 dark:bg-gray-700 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={messages.length > 0 ? () => setShowDiscard(!showDiscard) : startNewChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-600 bg-gray-50 dark:bg-gray-800/50 transition-all"
                >
                  <Plus size={14} /> محادثة جديدة
                </button>
                {showDiscard && messages.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg z-10 overflow-hidden">
                    <button onClick={startNewChat} className="w-full text-right px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                      <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      حفظ وإنهاء
                    </button>
                    <button onClick={discardAndNew} className="w-full text-right px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      تجاهل وبدء جديد
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-1">التصنيفات</div>
                <div className="space-y-0.5">
                  {CATEGORIES.map(cat => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-right ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                        }`}
                      >
                        <span className={`size-7 rounded-lg grid place-items-center ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          <IconComp size={14} />
                        </span>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">المحادثات</span>
                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `hefno-chat-${Date.now()}.json`;
                        a.click(); URL.revokeObjectURL(url);
                        toast.success('تم تصدير المحادثة');
                      }}
                      className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="تصدير المحادثة"
                    >
                      📥
                    </button>
                  )}
                </div>
                <div className="relative mb-2 px-2">
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="w-full text-[11px] px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 placeholder-gray-400 outline-none focus:border-emerald-400 dark:focus:border-emerald-600 transition-colors"
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                {Object.keys(historyChats).length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">لا توجد محادثات سابقة</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(historyChats).map(([label, chats]) => (
                      <div key={label}>
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 mb-1">{label}</div>
                        <div className="space-y-0.5">
                          {chats.map(chat => (
                            <div
                              key={chat.id}
                              className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${
                                chat.isActive ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <button
                                onClick={() => chat.isActive ? null : loadChat(chat)}
                                className="flex-1 flex items-center gap-2 min-w-0 text-right"
                              >
                                <MessageSquare size={12} className="text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{chat.title}...</span>
                                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full shrink-0">{chat.messageCount}</span>
                              </button>
                              {!chat.isActive && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteSavedChat(chat.id); }}
                                  className="size-5 rounded grid place-items-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── Main Chat Area ─── */}
          <section className="flex-1 min-w-0 flex flex-col bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm overflow-hidden">

            {/* ─── Category Pills (mobile) ─── */}
            <div className="flex gap-1.5 p-3 pb-0 overflow-x-auto scrollbar-none lg:hidden">
              {CATEGORIES.map(cat => {
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComp size={12} />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* ─── Messages ─── */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin relative" ref={chatContainerRef} onScroll={handleScroll}>
              <div className="min-h-full flex flex-col">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12"
                  >
                    <div className="size-20 rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-700/50 ring-4 ring-emerald-50 dark:ring-emerald-900/20 mx-auto mb-5 shadow-sm bg-emerald-50 dark:bg-emerald-900/30">
                      <EmptyAvatar />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">مرحباً بك في Hefno AI</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">المساعد الزراعي الذكي — اسأل عن أي شيء</p>
                    <div className="flex flex-wrap gap-2.5 justify-center max-w-md">
                      {SUGGESTIONS.map((s, i) => {
                        const IconComp = s.icon;
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => sendMessage(s.text)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                          >
                            <IconComp size={13} className="text-emerald-500" />
                            {s.text}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="chat-msgs">
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="flex items-center justify-center py-4">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                            {formatDate(date)}
                          </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                          {dateMessages.map((msg, idx) => {
                            const prev = dateMessages[idx - 1];
                            const sameSender = prev && prev.sender === msg.sender;
                            return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 12, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              className={sameSender ? 'py-0.5' : 'py-1.5'}
                            >
                              <div className={`flex gap-3 items-start ${msg.sender === 'ai' ? '' : 'flex-row-reverse'}`}>
                                {sameSender ? (
                                  <div className="size-8 shrink-0" />
                                ) : msg.sender === 'ai' ? <AIMsgAvatar /> : <UserMsgAvatar />}
                                <div className={`flex-1 min-w-0 ${msg.sender === 'ai' ? '' : 'flex flex-col items-end'}`}>
                                  <div className={`inline-block max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                    msg.sender === 'ai'
                                      ? 'bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 shadow-sm text-gray-800 dark:text-gray-200'
                                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm'
                                  } ${msg.isError ? '!bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800 !text-red-600 dark:!text-red-400' : ''}`}>
                                    {msg.sender === 'ai' && msg.isError ? (
                                      <div>
                                        <p className="text-sm mb-2">⚠️ حدث خطأ{msg.errorLabel}</p>
                                        <button
                                          onClick={() => sendMessage(msg.lastUserMsg)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800/50 transition-all"
                                        >
                                          إعادة المحاولة
                                        </button>
                                      </div>
                                    ) : msg.sender === 'ai' ? (
                                      <div className="group/bubble relative">
                                        <div className="[&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mr-4 [&_ol]:mr-4 [&_ul]:mt-1 [&_ol]:mt-1 [&_li]:mb-1 [&_code]:bg-gray-100 dark:[&_code]:bg-gray-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_strong]:font-bold">
                                          <ReactMarkdown>{formatMessageText(msg.text)}</ReactMarkdown>
                                        </div>
                                        <div className="absolute -left-8 top-0 flex flex-col gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => { navigator.clipboard.writeText(msg.text); toast.success('تم النسخ'); }}
                                            className="size-6 rounded bg-gray-100 dark:bg-gray-700 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                            title="نسخ"
                                          >
                                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                          </button>
                                          <button
                                            onClick={() => toast.success('تم التقييم!')}
                                            className="size-6 rounded bg-gray-100 dark:bg-gray-700 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                                            title="مفيد"
                                          >
                                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                          </button>
                                          <button
                                            onClick={() => toast.success('تم التقييم!')}
                                            className="size-6 rounded bg-gray-100 dark:bg-gray-700 grid place-items-center text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all"
                                            title="غير مفيد"
                                          >
                                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      formatMessageText(msg.text)
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatRelativeTime(msg.timestamp)}</span>
                                    {msg.sender === 'user' && msg.status === 'sending' && (
                                      <span className="size-2.5 rounded-full border border-gray-400 border-t-transparent animate-spin" />
                                    )}
                                    {msg.sender === 'user' && msg.status === 'sent' && (
                                      <svg className="size-2.5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    )}
                                    {msg.sender === 'user' && msg.status === 'failed' && (
                                      <svg className="size-2.5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ))}
                    {showTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-1.5"
                      >
                        <div className="flex gap-3 items-start">
                          <AIMsgAvatar />
                          <div className="flex-1">
                            <div className="inline-block px-4 py-3 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 shadow-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {isLoading && !showTyping && (
                      <div className="py-1.5 text-center text-xs text-gray-400 dark:text-gray-500">Hefno AI تفكر...</div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              {isScrolledUp && (
                <div className="sticky bottom-2 flex justify-center z-10">
                  <div className="flex items-center gap-2">
                    {newMsgCount > 0 && (
                      <button
                        onClick={scrollToBottomSmooth}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg hover:bg-emerald-700 transition-all"
                      >
                        ↓ {newMsgCount} رسائل جديدة
                      </button>
                    )}
                    <button
                      onClick={scrollToBottomSmooth}
                      className="size-9 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                      title="الذهاب للأحدث"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Quick Suggestions ─── */}
            {messages.length > 0 && (
              <details className="group border-t border-gray-100 dark:border-gray-700/50">
                <summary className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none list-none flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-xs group-open:rotate-90 transition-transform shrink-0">▶</span>
                  اقتراحات
                </summary>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 pb-2 sm:px-4 sm:pb-2">
                  {SUGGESTIONS.map((s, i) => {
                    const IconComp = s.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => sendMessage(s.text)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                      >
                        <IconComp size={10} className="sm:size-3 text-emerald-500" />
                        {s.text}
                      </button>
                    );
                  })}
                </div>
              </details>
            )}

            {/* ─── Input Area ─── */}
            <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700/50">
              {isListening && (
                <div className="flex items-center gap-2 text-[12px] text-red-500 mb-2 chat-input-area">
                  <div className="flex items-center gap-[2px] h-4">
                    {[1,2,3,4].map(i => (
                      <span
                        key={i}
                        className="w-[3px] bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${40 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.6s',
                        }}
                      />
                    ))}
                  </div>
                  <span>جارٍ الاستماع... تحدث الآن</span>
                </div>
              )}
              <div className="chat-input-area">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-2 px-4 backdrop-blur transition-all focus-within:border-emerald-400 dark:focus-within:border-emerald-600 focus-within:shadow-sm">
                  <Sparkles size={16} className="text-emerald-400 mb-2 shrink-0 max-[360px]:hidden" />
                  <button
                    onClick={toggleListening}
                    disabled={isLoading || !isSpeechSupported}
                    className={`size-8 rounded-full grid place-items-center shrink-0 transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-[mic-pulse_1.5s_infinite]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } ${(!isSpeechSupported || isLoading) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={isListening ? 'إيقاف' : 'تسجيل'}
                  >
                    {isListening ? <Square size={12} className="fill-current" /> : <Mic size={13} />}
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'تحدث الآن...' : 'اسأل Hefno AI عن أي شيء زراعي...'}
                    className="flex-1 border-none bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none outline-none py-2 max-h-[140px] leading-relaxed"
                    rows={1}
                    maxLength={2000}
                    disabled={isLoading}
                  />
                  {inputMessage.length > 100 && (
                    <span className={`text-[10px] shrink-0 mb-1.5 ${inputMessage.length > 1900 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      {inputMessage.length}/2000
                    </span>
                  )}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="size-9 rounded-xl bg-gradient-to-b from-emerald-400 to-primary text-white grid place-items-center shrink-0 hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? (
                      <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp size={15} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 opacity-50">
                    {isListening ? 'توقف للإرسال التلقائي' : 'Enter للإرسال · Shift+Enter سطر جديد'}
                  </p>
                  {conversationHistory.length >= 8 && (
                    <span className="text-[9px] text-amber-500 dark:text-amber-400 opacity-70">آخر {Math.min(conversationHistory.length, 10)} رسائل كسياق</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
