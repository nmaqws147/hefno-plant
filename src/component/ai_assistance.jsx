// components/AIAssistant.jsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useTracking from '../hooks/useTracking';
import './ai_assistance.css';
import { Helmet } from 'react-helmet-async';

const CATEGORIES = [
  { id: 'diseases', name: 'تشخيص الأمراض', icon: '🔍' },
  { id: 'treatment', name: 'العلاج والرعاية', icon: '💊' },
  { id: 'weather', name: 'نصائح الطقس', icon: '🌤️' },
  { id: 'general', name: 'استشارات عامة', icon: '💡' }
];

const AIAssistant = React.memo(({ id }) => {

  const { trackAction } = useTracking();

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('aiChatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState(() => {
    const saved = localStorage.getItem('aiConversationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedCategory, setSelectedCategory] = useState('diseases');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSendingRef = useRef(false);
  const lastTranscriptRef = useRef('');
  const abortControllerRef = useRef(null);

  
  const formatMessageText = useCallback((text) => {
    if (!text) return '';
    return text
      .replace(/\\n/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = message.date || new Date(message.timestamp).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const startSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    }, 2500);
  }, [isListening]);

  
  const sendMessage = useCallback(async (textOverride, skipInputClear = false) => {
    const textToSend = textOverride || inputMessage.trim();
    
    if (!textToSend || isLoading || isSendingRef.current) return;
    
    isSendingRef.current = true;
    const messageId = Date.now();

    const userMessage = {
      id: messageId,
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0]
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (!skipInputClear) {
      setInputMessage('');
    }
    
    setTranscript('');
    setInterimTranscript('');
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: textToSend,
          category: selectedCategory,
          conversationHistory: conversationHistory.slice(-10)
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`فشل الاتصال بالخادم (${response.status})`);
        trackAction(`ai_${selectedCategory}_failed`);
      }

      const data = await response.json();
      
      if (data.error) throw new Error(data.message);

      const aiMessage = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        date: new Date().toISOString().split('T')[0]
      };

      trackAction(`ai_${selectedCategory}_success`);

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, userMessage, aiMessage].slice(-50));
      
    } catch (error) {
        console.error('AI Error:', error);
        trackAction(`ai_${selectedCategory}_failed`);

        let errorMessage = 'موقع Hefno-Plant يعمل بشكل جيد، ولكن يبدو أن هناك ضغطاً مؤقتاً على خدمة التحليل. يرجى المحاولة مرة أخرى.';

        if (error.name === 'AbortError') {
          errorMessage = 'نعتذر، استغرق التحليل وقتاً أطول من المعتاد. يرجى التأكد من استقرار الإنترنت والمحاولة مرة أخرى.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Hefno-Plant جاهز، لكنه لا يستطيع الوصول للخادم الآن. يرجى التحقق من اتصالك بالإنترنت.';
        } else if (error.message.includes('quota') || error.message.includes('429')) {
          errorMessage = 'لقد استهلك الخبير الرقمي طاقته القصوى حالياً. التطبيق سليم، فقط انتظر قليلاً ثم عاود المحاولة.';
        }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
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

  const toggleListening = useCallback(() => {
    if (!isSpeechSupported) {
      toast.success('المتصفح لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setInterimTranscript('');
      lastTranscriptRef.current = '';
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [isListening, isSpeechSupported]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        sendMessage();
      }
    }
  }, [inputMessage, isLoading, sendMessage]);

  const exportConversation = useCallback(() => {
    const data = {
      messages,
      conversationHistory,
      exportDate: new Date().toISOString(),
      totalMessages: messages.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, conversationHistory]);

  const clearConversation = useCallback(() => {
    if (window.confirm('هل أنت متأكد من مسح جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setMessages([]);
      setConversationHistory([]);
      localStorage.removeItem('aiChatHistory');
      localStorage.removeItem('aiConversationHistory');
    }
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setIsSpeechSupported(false);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      startSilenceTimer();
    };

    recognition.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      startSilenceTimer();
      
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptText;
        } else {
          interim += transcriptText;
        }
      }
      
      setInterimTranscript(interim);
      
      if (final) {
        setTranscript(prev => prev ? prev + ' ' + final : final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
      } else if (event.error === 'audio-capture') {
        toast.success('لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الإعدادات.');
      } else if (event.error === 'not-allowed') {
        toast.success('يرجى السماح بالوصول إلى الميكروفون لاستخدام خاصية الصوت.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      
      setTimeout(() => {
        const finalTranscript = transcript.trim();
        if (finalTranscript && finalTranscript.length > 0) {
          handleVoiceInput(finalTranscript);
        }
        setTranscript('');
        setInterimTranscript('');
      }, 100);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onend = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
        } catch (e) {
        }
      }
      clearTimeout(silenceTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); 
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    }
    if (conversationHistory.length > 0) {
      localStorage.setItem('aiConversationHistory', JSON.stringify(conversationHistory));
    }
  }, [messages, conversationHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="hnp-ai-assistant" id={id} dir="rtl">
      <Helmet>
        <title>المساعد الزراعي الذكي | Hefno-Plant</title>
        <meta name="description" content="اسأل المساعد الزراعي الذكي — احصل على إجابات فورية عن أمراض النباتات، المبيدات، التسميد، وطرق الزراعة." />
      </Helmet>
      {/* خلفية */}
      <div className="hnp-ai-bg">
        <div className="hnp-ai-gradient"></div>
        <div className="hnp-ai-particles"></div>
      </div>

      {/* رأس الصفحة */}
      <header className="hnp-ai-header glass">
        <div className="hnp-ai-header-content">
          <div className="hnp-ai-avatar">
            <span className="hnp-ai-avatar-icon">🤖</span>
            <div className="hnp-ai-avatar-glow"></div>
          </div>
          <div className="hnp-ai-header-text">
            <h1>المساعد الزراعي الذكي</h1>
            <p>أساعدك في جميع استفساراتك الزراعية والتشخيص والعلاج</p>
            <div className="hnp-ai-stats">
              <span className="hnp-ai-stat">📊 {messages.length} رسالة</span>
              <span className="hnp-ai-stat">🗓️ {Object.keys(groupedMessages).length} يوم</span>
              <span className="hnp-ai-stat">🎙️ {isSpeechSupported ? 'ميكروفون مفعل' : 'ميكروفون غير مدعوم'}</span>
            </div>
          </div>
        </div>
        <div className="hnp-ai-header-actions">
          <button className="hnp-ai-export-btn" onClick={exportConversation}>
            📥 تصدير
          </button>
          <button className="hnp-ai-clear-btn" onClick={clearConversation}>
            🗑️ مسح الكل
          </button>
        </div>
      </header>

      <div className="hnp-ai-container">
        {/* الشريط الجانبي */}
        <aside className="hnp-ai-sidebar glass">
          <div className="hnp-ai-sidebar-section">
            <h3>📁 التصنيفات</h3>
            <div className="hnp-ai-categories">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  className={`hnp-ai-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <span className="hnp-ai-category-icon">{category.icon}</span>
                  <span className="hnp-ai-category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/*  المحادثة */}
        <main className="hnp-ai-chat glass">
          <div className="hnp-ai-chat-container">
            {messages.length === 0 ? (
              <div className="hnp-ai-welcome">
                <div className="hnp-ai-welcome-icon">🌱</div>
                <h2>مرحباً بك في المساعد الزراعي!</h2>
                <p>اختر تصنيفاً من القائمة أو ابدأ بمحادثة مباشرة</p>
                <div className="hnp-ai-examples">
                  <button className="hnp-ai-example-btn" onClick={() => sendMessage("كيف أعتني بنبات الطماطم؟")}>
                    🍅 كيف أعتني بنبات الطماطم؟
                  </button>
                  <button className="hnp-ai-example-btn" onClick={() => sendMessage("ما هي أعراض مرض البياض الدقيقي؟")}>
                    🍃 ما هي أعراض مرض البياض الدقيقي؟
                  </button>
                  <button className="hnp-ai-example-btn" onClick={() => sendMessage("كم مرة أسقي فيها النباتات المنزلية؟")}>
                    💧 كم مرة أسقي فيها النباتات المنزلية؟
                  </button>
                </div>
              </div>
            ) : (
              <div className="hnp-ai-messages">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="hnp-ai-date-separator">
                      <span className="hnp-ai-separator-line"></span>
                      <span className="hnp-ai-separator-date">{formatDate(date)}</span>
                      <span className="hnp-ai-separator-line"></span>
                    </div>
                    {dateMessages.map(message => (
                      <div
                        key={message.id}
                        className={`hnp-ai-message ${message.sender} ${message.isError ? 'error' : ''}`}
                      >
                        <div className="hnp-ai-message-avatar">
                          {message.sender === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="hnp-ai-message-content">
                          <div className="hnp-ai-message-text">
                            {formatMessageText(message.text)}
                          </div>
                          <div className="hnp-ai-message-meta">
                            <span className="hnp-ai-message-time">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.category && (
                              <span className="hnp-ai-message-category">
                                {CATEGORIES.find(c => c.id === message.category)?.icon}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {isLoading && (
                  <div className="hnp-ai-message ai loading">
                    <div className="hnp-ai-message-avatar">🤖</div>
                    <div className="hnp-ai-message-content">
                      <div className="hnp-ai-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* منطقة الإدخال */}
          <div className="hnp-ai-input-section">
            {isListening && (
              <div className="hnp-ai-listening-indicator">
                <div className="hnp-ai-pulse-dot"></div>
                <span>🎙️ جاري الاستماع... تحدث الآن</span>
              </div>
            )}

            <div className="hnp-ai-input-container">
              <button
                className={`hnp-ai-voice-btn ${isListening ? 'listening' : ''} ${!isSpeechSupported ? 'disabled' : ''}`}
                onClick={toggleListening}
                disabled={isLoading || !isSpeechSupported}
                title={isListening ? 'إيقاف الاستماع' : 'بدء الاستماع'}
              >
                {isListening ? '🔴' : '🎤'}
                {isListening && <div className="hnp-ai-pulse-ring"></div>}
              </button>

              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isListening 
                    ? "جاري الاستماع... تحدث الآن" 
                    : "اكتب رسالتك هنا..."
                }
                className="hnp-ai-message-input"
                rows="1"
                disabled={isLoading}
              />

              <button
                onClick={() => sendMessage()}
                disabled={(!inputMessage.trim()) || isLoading}
                className="hnp-ai-send-btn"
              >
                {isLoading ? (
                  <div className="hnp-ai-send-spinner"></div>
                ) : (
                  <span>🚀</span>
                )}
              </button>
            </div>

            {(transcript || interimTranscript) && (
              <div className="hnp-ai-transcript-preview">
                <span className="hnp-ai-transcript-label">
                  {isListening ? '🎤 جاري الاستماع:' : '📝 النص المعترف به:'}
                </span>
                <span className="hnp-ai-transcript-text">
                  {transcript}
                  {interimTranscript && (
                    <span className="hnp-ai-interim-text">{interimTranscript}</span>
                  )}
                </span>
              </div>
            )}

            <div className="hnp-ai-input-hint">
              {isListening ? '💡 توقف عن الكلام للإرسال التلقائي' : '💡 اضغط على الميكروفون للتحدث'}
            </div>
          </div>
        </main>
      </div>

      {/* عناصر عائمة في الخلفية */}
      <div className="hnp-ai-floating">
        <div className="hnp-ai-floating-shape shape-1">🌿</div>
        <div className="hnp-ai-floating-shape shape-2">💧</div>
        <div className="hnp-ai-floating-shape shape-3">☀️</div>
        <div className="hnp-ai-floating-shape shape-4">🌱</div>
      </div>
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;