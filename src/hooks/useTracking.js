// hooks/useTracking.js
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useTracking = () => {
  const location = useLocation();
  const pageLoadTimeRef = useRef(Date.now());
  
  const sessionIdRef = useRef(localStorage.getItem('hefno_session_id'));
  
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = localStorage.getItem('hefno_session_id');
      if (!sessionIdRef.current) {
        sessionIdRef.current = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('hefno_session_id', sessionIdRef.current);
      }
      console.log('🆔 Session ID:', sessionIdRef.current);
    }
  }, []);
  
  // دالة آمنة للتتبع
  const track = useCallback(async (endpoint, data) => {
    try {
      const payload = {
        ...data,
        userId: sessionIdRef.current
      };
      
      console.log(`📤 Tracking ${endpoint}:`, payload);
      
      const response = await fetch(`/api/stats?action=${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Tracking success`);
      }
    } catch (error) {
      console.error('❌ Tracking error:', error.message);
    }
  }, []);
  
  // تتبع وقت البقاء على الصفحة
  const trackTimeOnPage = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - pageLoadTimeRef.current) / 1000);
    if (timeSpent > 5) {
      const timeBucket = Math.floor(timeSpent / 10) * 10;
      track('action', {
        actionType: `time_on_page_${timeBucket}s`,
        userId: sessionIdRef.current
      });
    }
  }, [track]);
  
  useEffect(() => {
    trackTimeOnPage();
    
    pageLoadTimeRef.current = Date.now();
    
    const path = location.pathname;
    let pageName = path === '/' ? 'home' : path.slice(1).replace(/\//g, '_');
    pageName = pageName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    const referrer = document.referrer || 'direct';
    
    console.log(`📄 Page view: ${pageName}, Referrer: ${referrer}`);
    
    // تسجيل زيارة الصفحة
    track('track', {
      page: pageName,
      referrer: referrer,
      userId: sessionIdRef.current
    });
    
    return () => {
      trackTimeOnPage();
    };
  }, [location.pathname, track, trackTimeOnPage]);
  
  // تتبع الإجراءات
  const trackAction = useCallback((actionName, metadata = {}) => {
    console.log(`🎬 Action: ${actionName}`, metadata);
    track('action', {
      actionType: actionName,
      userId: sessionIdRef.current,
      metadata
    });
  }, [track]);
  
  return { trackAction };
};

export default useTracking;