// components/DiagnoseScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useTracking from '../hooks/useTracking';
import './dialog.css';
import { Helmet } from 'react-helmet-async';

const DiagnoseScreen = ({ id }) => {

  const { trackAction } = useTracking();
  const [uiState, setUiState] = useState({
    image: null,
    isDragging: false,
    isAnalyzing: false,
    analysisResult: null,
    selectedDiagnosis: null,
    showDetailsModal: false,
    rateLimit: null
  });

  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const safeArray = useCallback((arr) => {
    if (!arr) return [];
    return Array.isArray(arr) ? arr : (typeof arr === 'string' ? [arr] : []);
  }, []);

  const getHealthStatusClass = useCallback((status) => {
    if (!status) return 'health-unknown';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('جيدة') || statusLower.includes('جيد') || statusLower.includes('سليم')) return 'health-good';
    if (statusLower.includes('متوسطة') || statusLower.includes('متوسط')) return 'health-warning';
    if (statusLower.includes('سيئة') || statusLower.includes('سيء') || statusLower.includes('حرجة')) return 'health-critical';
    return 'health-unknown';
  }, []);

  const getSeverityClass = useCallback((severity) => {
    if (!severity) return 'severity-unknown';
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('خفيفة') || severityLower.includes('mild')) return 'severity-mild';
    if (severityLower.includes('متوسطة') || severityLower.includes('moderate')) return 'severity-moderate';
    if (severityLower.includes('شديدة') || severityLower.includes('severe')) return 'severity-severe';
    return 'severity-unknown';
  }, []);

  const compressImage = useCallback((file, maxWidth = 1200, maxHeight = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }, []);


  const loadRecentDiagnoses = useCallback(() => {
    try {
      const storedDiagnoses = localStorage.getItem('plantDiagnoses');
      if (storedDiagnoses) {
        const diagnoses = JSON.parse(storedDiagnoses);
        const sortedDiagnoses = diagnoses.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRecentDiagnoses(sortedDiagnoses.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading diagnoses:', error);
    }
  }, []);

  const saveDiagnosisToLocalStorage = useCallback((diagnosisData) => {
    const now = new Date();
    const newDiagnosis = {
      id: Date.now(),
      timestamp: now.toISOString(),
      date: formatDate(now),
      time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      image: uiState.image,
      plant: diagnosisData.plantName || 'نبات غير معروف',
      confidence: diagnosisData.confidence || 0,
      healthStatus: diagnosisData.healthStatus || 'غير معروف',
      fullAnalysis: diagnosisData,
      analysisTime: 'فوري'
    };

    setRecentDiagnoses(prev => {
      const updated = [newDiagnosis, ...prev].slice(0, 10);
      return updated;
    });

    setTimeout(() => {
      try {
        const storedDiagnoses = localStorage.getItem('plantDiagnoses');
        let diagnoses = storedDiagnoses ? JSON.parse(storedDiagnoses) : [];
        diagnoses = [newDiagnosis, ...diagnoses].slice(0, 20);
        localStorage.setItem('plantDiagnoses', JSON.stringify(diagnoses));
        toast.success('✅ تم حفظ التشخيص بنجاح');
      } catch (error) {
        console.error('Error saving diagnosis:', error);
        toast.error('❌ فشل حفظ التشخيص');
      }
    }, 0);
  }, [uiState.image, formatDate]);

  const deleteDiagnosis = useCallback((diagnosisId) => {
    try {
      const storedDiagnoses = localStorage.getItem('plantDiagnoses');
      if (!storedDiagnoses) return;

      let diagnoses = JSON.parse(storedDiagnoses);
      diagnoses = diagnoses.filter(d => d.id !== diagnosisId);

      localStorage.setItem('plantDiagnoses', JSON.stringify(diagnoses));
      setRecentDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));

      toast.success('✅ تم حذف التشخيص بنجاح');
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      toast.error('❌ حدث خطأ أثناء حذف التشخيص');
    }
  }, []);

  const clearAllDiagnoses = useCallback(() => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف جميع سجلات التشخيص؟')) {
      localStorage.removeItem('plantDiagnoses');
      setRecentDiagnoses([]);
      toast.success('✅ تم حذف جميع السجلات بنجاح');
    }
  }, []);
  
  const handleError = useCallback((message, status = null) => {
    setUiState(prev => ({
      ...prev,
      analysisResult: {
        error: true,
        message: message,
        isRateLimit: status === 429,
        resetInHours: status === 429 ? 24 : null
      }
    }));
    toast.error(`❌ ${message}`);
  }, []);

  
  const analyzePlant = useCallback(async () => {
    if (!uiState.image) {
      toast.warning('⚠️ يرجى رفع صورة أولاً');
      return;
    }

    setUiState(prev => ({ ...prev, isAnalyzing: true, analysisResult: null, rateLimit: null }));

    try {
      const base64Image = uiState.image.split(',')[1];

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Image }),
      });

      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');

      if (remaining !== null) {
        setUiState(prev => ({
          ...prev,
          rateLimit: {
            remaining: parseInt(remaining),
            limit: parseInt(limit),
            reset: reset ? parseInt(reset) : null
          }
        }));
      }

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error || "حدث خطأ غير متوقع";
        trackAction('image_analysis_failed');
        handleError(errorMessage, response.status);
        return;
      }
      
      setUiState(prev => ({ ...prev, analysisResult: result }));
      saveDiagnosisToLocalStorage(result);
      
      const successMsg = remaining !== null 
        ? `✅ تم التحليل! متبقي لك ${remaining} محاولات اليوم` 
        : '✅ تم تحليل النبات بنجاح!';
      toast.success(successMsg);
      trackAction('image_analysis_success');

    } catch (error) {
      console.error("Critical Error:", error);
       trackAction('image_analysis_failed');
      handleError("يبدو أن هناك ضغطاً مؤقتاً على الشبكة. يرجى المحاولة مرة أخرى");
    } finally {
      setUiState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [uiState.image, handleError, saveDiagnosisToLocalStorage, trackAction]);

  const processImage = useCallback(async (file) => {
    try {
      const compressionToast = file.size > 1.5 * 1024 * 1024 ? toast.loading('⚡ جاري تهيئة وتحسين جودة الصورة...') : null;
      
      const compressedBase64 = await compressImage(file);
      
      if (compressionToast) toast.dismiss(compressionToast);

      requestAnimationFrame(() => {
        setUiState(prev => ({ 
          ...prev, 
          image: compressedBase64, 
          analysisResult: null, 
          rateLimit: null 
        }));
      });
    } catch (error) {
      console.error("Image compression error:", error);
      toast.error("❌ فشل معالجة الصورة، يرجى تجربة التقاط صورة أخرى");
    }
  }, [compressImage]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('❌ حجم الصورة كبير جداً، الحد الأقصى المسموح به 15 ميجابايت');
        return;
      }
      processImage(file);
    }
  }, [processImage]);

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('❌ حجم الصورة كبير جداً، الحد الأقصى 15 ميجابايت');
        return;
      }
      processImage(file);
    }
  }, [processImage]);

  const resetImage = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      image: null, 
      analysisResult: null, 
      rateLimit: null 
    }));
  }, []);

const handleViewDetails = useCallback((diagnosis) => {
    if (diagnosis && diagnosis.fullAnalysis) {
      setUiState(prev => ({ 
        ...prev, 
        image: diagnosis.image, 
        analysisResult: diagnosis.fullAnalysis,
        selectedDiagnosis: diagnosis, 
        showDetailsModal: true 
      }));

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    } else {
      toast.error("❌ بيانات التشخيص تالفة أو غير مكتملة");
    }
  }, []);

  const closeDetailsModal = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      showDetailsModal: false, 
      selectedDiagnosis: null 
    }));
  }, []);

  useEffect(() => {
    loadRecentDiagnoses();
  }, [loadRecentDiagnoses]);

  
  const HistoryItem = useMemo(() => {
    return React.memo(({ diagnosis, onView, onDelete }) => {
      const isHealthy = diagnosis?.fullAnalysis?.healthStatus === 'سليم';
      
      return (
        <div className={`history-item glass ${isHealthy ? 'healthy' : 'diseased'}`}>
          <div className="item-icon">
            {isHealthy ? '🌿' : '🩺'}
          </div>
          <div className="item-content">
            <h4 className="item-plant">{diagnosis?.plant || 'نبات غير معروف'}</h4>
            <div className="item-meta">
              <span className="item-date">📅 {diagnosis?.date}</span>
              <span className={`item-status ${getHealthStatusClass(diagnosis?.healthStatus)}`}>
                {diagnosis?.healthStatus || 'غير محدد'}
              </span>
              <span className="item-confidence">{diagnosis?.confidence || 0}%</span>
            </div>
          </div>
          <div className="item-actions">
            <button className="view-btn" onClick={() => onView(diagnosis)}>👁️</button>
            <button className="delete-item-btn" onClick={() => onDelete(diagnosis.id)}>🗑️</button>
          </div>
        </div>
      );
    });
  }, [getHealthStatusClass]);
  
  return (
    <div className="diagnose-screen" id={id}>
      <Helmet>
        <title>تشخيص أمراض النبات | Hefno-Plant</title>
        <meta name="description" content="شخص نباتك بالذكاء الاصطناعي — حمّل صورة ورقة نباتك للحصول على تشخيص فوري للحالة والعلاج المقترح." />
      </Helmet>

      <header className="diagnose-header glass">
        <div className="header-content">
          <div className="header-icon">
            <span className="icon-leaf">🌿</span>
          </div>
          <div className="header-text">
            <h1>تشخيص النباتات</h1>
            <p>تحليل صحي للنباتات باستخدام الذكاء الاصطناعي</p>
            {uiState.rateLimit && uiState.rateLimit.remaining !== undefined && !uiState.analysisResult?.isRateLimit && (
              <div className={`rate-badge ${uiState.rateLimit.remaining <= 2 ? 'warning' : ''}`}>
                📸 متبقي: {uiState.rateLimit.remaining} من {uiState.rateLimit.limit} تحليلات اليوم
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="upload-section">
        {uiState.image ? (
          <div className="preview-container glass">
            <div className="preview-header">
              <h3>📷 معاينة الصورة</h3>
              <button className="close-btn" onClick={resetImage}>✕</button>
            </div>

            <div className="preview-image-container">
              <img src={uiState.image} alt="صورة النبات" className="preview-image" />
              {uiState.isAnalyzing && (
                <div className="analyzing-overlay">
                  <div className="scan-line"></div>
                  <div className="analyzing-text">
                    <div className="dots">
                      <span></span><span></span><span></span>
                    </div>
                    جاري تحليل حالة النبات...
                  </div>
                </div>
              )}
            </div>

            {uiState.analysisResult?.isRateLimit && (
              <div className="rate-limit-error glass">
                <div className="error-icon">🚫</div>
                <h4>تم تجاوز الحد اليومي</h4>
                <p>{uiState.analysisResult.message}</p>
                {uiState.analysisResult.resetInHours && (
                  <p className="reset-info">🕐 يمكنك المحاولة مرة أخرى بعد {uiState.analysisResult.resetInHours} ساعة</p>
                )}
                <button className="retry-later-btn" onClick={resetImage}>رفع صورة جديدة غداً</button>
              </div>
            )}

            {uiState.analysisResult && !uiState.analysisResult.error && !uiState.analysisResult.isRateLimit && (
              <div className="results-container">
                <h4 className="results-title">🌿 نتائج التحليل</h4>
                
                <div className="results-grid">
                  
                  {/* 1. معلومات النبات الأساسية */}
                  <div className="result-card">
                    <h5>🌱 معلومات النبات</h5>
                    <div className="info-row">
                      <span className="info-label">اسم النبات</span>
                      <span className="info-value">{uiState.analysisResult.plantName || 'غير معروف'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">الحالة الصحية</span>
                      <span className={`health-badge ${getHealthStatusClass(uiState.analysisResult.healthStatus)}`}>
                        {uiState.analysisResult.healthStatus || 'غير معروف'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">دقة التشخيص</span>
                      <span className={`confidence-badge ${uiState.analysisResult.confidence > 90 ? 'high' : 'medium'}`}>
                        {uiState.analysisResult.confidence || 0}%
                      </span>
                    </div>
                    {uiState.analysisResult?.problemType && (
                      <div className="info-row">
                        <span className="info-label">نوع المشكلة</span>
                        <span className="problem-type-badge">
                          {uiState.analysisResult.problemType === 'حشري' ? '🐛 حشري' : 
                           uiState.analysisResult.problemType === 'فطري' ? '🍄 فطري' :
                           uiState.analysisResult.problemType === 'بكتيري' ? '🦠 بكتيري' :
                           uiState.analysisResult.problemType === 'فيروسي' ? '🧬 فيروسي' :
                           uiState.analysisResult.problemType === 'فسيولوجي' ? '🌡️ فسيولوجي' :
                           uiState.analysisResult.problemType === 'نيماتودا' ? '🪱 نيماتودا' :
                           uiState.analysisResult.problemType}
                        </span>
                      </div>
                    )}
                    {uiState.analysisResult?.severity && (
                      <div className="info-row">
                        <span className="info-label">شدة الإصابة</span>
                        <span className={`severity-badge ${getSeverityClass(uiState.analysisResult.severity)}`}>
                          {uiState.analysisResult.severity === 'بسيطة' ? '🟢 بسيطة' :
                           uiState.analysisResult.severity === 'متوسطة' ? '🟡 متوسطة' :
                           uiState.analysisResult.severity === 'شديدة' ? '🟠 شديدة' :
                           uiState.analysisResult.severity === 'خطيرة' ? '🔴 خطيرة' :
                           uiState.analysisResult.severity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. الاسم العلمي للمسبب */}
                  {uiState.analysisResult.diseaseName && (
                    <div className="result-card">
                      <h5>{uiState.analysisResult.problemType === 'حشري' ? '🐛 الاسم العلمي للحشرة' : '🔬 الاسم العلمي للمرض'}</h5>
                      <div className="info-row">
                        <span className="info-label">الاسم العلمي</span>
                        <span className="info-value">{uiState.analysisResult.diseaseName.scientific || 'غير معروف'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">الاسم الشائع</span>
                        <span className="info-value">{uiState.analysisResult.diseaseName.common || 'غير معروف'}</span>
                      </div>
                    </div>
                  )}

                  {/* 3. الأجزاء المصابة */}
                  {safeArray(uiState.analysisResult.affectedParts).length > 0 && (
                    <div className="result-card">
                      <h5>📍 الأجزاء المصابة</h5>
                      <ul>
                        {safeArray(uiState.analysisResult.affectedParts).map((part, i) => (
                          <li key={i}>
                            <span className="affected-part-icon">
                              {part.includes('ورق') && '🍃'}
                              {part.includes('ساق') && '🌿'}
                              {part.includes('ثمر') && '🍎'}
                              {part.includes('جذر') && '🌱'}
                              {part.includes('زهرة') && '🌸'}
                              {part.includes('برعم') && '🌱'}
                              {!part.includes('ورق') && !part.includes('ساق') && !part.includes('ثمر') && !part.includes('جذر') && '📍'}
                            </span>
                            {part}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4. المشاكل الأساسية */}
                  <div className="result-card">
                    <h5>{uiState.analysisResult.problemType === 'حشري' ? '🐛 الآفات والحشرات المكتشفة' : '⚠️ المشاكل الأساسية'}</h5>
                    <ul>
                      {safeArray(uiState.analysisResult.mainProblems).map((problem, i) => (
                        <li key={i}>
                          <span className="problem-icon">
                            {problem.includes('فطر') && '🍄'}
                            {problem.includes('حشرة') && '🐛'}
                            {problem.includes('من') && '🦟'}
                            {problem.includes('تربس') && '🦟'}
                            {problem.includes('بق') && '🐞'}
                            {problem.includes('دودة') && '🐛'}
                            {problem.includes('سوسة') && '🐜'}
                            {problem.includes('بكتيريا') && '🦠'}
                            {problem.includes('فيروس') && '🧬'}
                            {problem.includes('نقص') && '⚡'}
                            {problem.includes('نيماتودا') && '🪱'}
                            {!problem.includes('فطر') && !problem.includes('حشرة') && !problem.includes('بكتيريا') && !problem.includes('فيروس') && !problem.includes('نقص') && '🔍'}
                          </span>
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. الأعراض */}
                  <div className="result-card">
                    <h5>{uiState.analysisResult.problemType === 'حشري' ? '🔍 أعراض الإصابة الحشرية' : '🔍 الأعراض'}</h5>
                    <ul>
                      {safeArray(uiState.analysisResult.symptoms).map((symptom, i) => (
                        <li key={i}>
                          <span className="symptom-icon">
                            {symptom.includes('ثقوب') && '🕳️'}
                            {symptom.includes('اصفرار') && '🟡'}
                            {symptom.includes('ذبول') && '🥀'}
                            {symptom.includes('تجعيد') && '🌀'}
                            {symptom.includes('ندوة') && '⚪'}
                            {symptom.includes('بقع') && '🔴'}
                            {!symptom.includes('ثقوب') && !symptom.includes('اصفرار') && !symptom.includes('ذبول') && '🔬'}
                          </span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 6. المبيدات المقترحة */}
                  <div className="result-card">
                    <h5>{uiState.analysisResult.problemType === 'حشري' ? '💊 المبيدات الحشرية المقترحة' : '💊 المبيدات المقترحة'}</h5>
                    {safeArray(uiState.analysisResult.pesticides).length > 0 ? (
                      <ul className="pesticides-list">
                        {safeArray(uiState.analysisResult.pesticides).map((pest, i) => (
                          <li key={i} className="pesticide-item">
                            <div className="pesticide-name">
                              <strong>{uiState.analysisResult.problemType === 'حشري' ? '🐛 ' : '🧪 '}{pest.activeIngredient || pest.name || 'مادة فعالة'}</strong>
                            </div>
                            <div className="pesticide-details">
                              {pest.type && (
                                <span className="pest-type">
                                  {pest.type === 'حشري' ? '🐛 نوع: حشري' : `📌 النوع: ${pest.type}`}
                                </span>
                              )}
                              {pest.group && (
                                <span className="pest-group">
                                  🧬 المجموعة: {pest.group}
                                </span>
                              )}
                              {pest.modeOfAction && (
                                <span className="pest-mode">
                                  ⚙️ طريقة العمل: {pest.modeOfAction === 'ملامس' ? '🎯 ملامس' : 
                                                   pest.modeOfAction === 'جهازي' ? '🩸 جهازي' : 
                                                   pest.modeOfAction === 'مشترك' ? '🔄 مشترك' : pest.modeOfAction}
                                </span>
                              )}
                              {pest.usage && (
                                <span className="pest-usage">
                                  💧 طريقة الاستخدام: {pest.usage}
                                </span>
                              )}
                              {pest.dosage && (
                                <span className="pest-dosage">
                                  📊 الجرعة: {pest.dosage}
                                </span>
                              )}
                              {pest.preHarvestInterval && (
                                <span className="pest-preharvest">
                                  ⏰ فترة الأمان: {pest.preHarvestInterval}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data-message">
                        {uiState.analysisResult.problemType === 'حشري' ? '✨ لا توجد إصابة حشرية - لا يحتاج مبيدات' : '✨ النبات سليم - لا يحتاج مبيدات'}
                      </p>
                    )}
                  </div>

                  {/* 7. المكافحة العضوية */}
                  {safeArray(uiState.analysisResult.organicControl).length > 0 && (
                    <div className="result-card">
                      <h5>{uiState.analysisResult.problemType === 'حشري' ? '🌿 المكافحة العضوية للحشرات' : '🌿 المكافحة العضوية'}</h5>
                      <ul>
                        {safeArray(uiState.analysisResult.organicControl).map((organic, i) => (
                          <li key={i} className="organic-item">
                            <div className="organic-method">
                              <strong>🌱 {organic.method}</strong>
                            </div>
                            {organic.preparation && (
                              <div className="organic-prep">
                                📝 التحضير: {organic.preparation}
                              </div>
                            )}
                            {organic.application && (
                              <div className="organic-app">
                                🗓️ التطبيق: {organic.application}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 8. المكافحة المتكاملة IPM */}
                  {uiState.analysisResult.integratedPestManagement && (
                    <div className="result-card">
                      <h5>{uiState.analysisResult.problemType === 'حشري' ? '🔄 المكافحة المتكاملة IPM (للحشرات)' : '🔄 المكافحة المتكاملة IPM'}</h5>
                      <div className="ipm-section">
                        <div className="ipm-preventive">
                          <span className="ipm-icon">🛡️</span>
                          <strong>إجراءات وقائية:</strong>
                          <ul>
                            {safeArray(uiState.analysisResult.integratedPestManagement.preventive).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="ipm-curative">
                          <span className="ipm-icon">💊</span>
                          <strong>إجراءات علاجية:</strong>
                          <ul>
                            {safeArray(uiState.analysisResult.integratedPestManagement.curative).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        {uiState.analysisResult.integratedPestManagement.biological && (
                          <div className="ipm-biological">
                            <span className="ipm-icon">🐞</span>
                            <strong>أعداء طبيعيون:</strong>
                            <ul>
                              {safeArray(uiState.analysisResult.integratedPestManagement.biological).map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 9. العلاج المقترح */}
                  <div className="result-card">
                    <h5>{uiState.analysisResult.problemType === 'حشري' ? '💊 خطة المكافحة المتكاملة' : '💊 العلاج المقترح'}</h5>
                    <ul>
                      {safeArray(uiState.analysisResult.treatment).map((treatment, i) => (
                        <li key={i}>
                          <span className="treatment-icon">
                            {treatment.includes('رش') && '💨'}
                            {treatment.includes('إزالة') && '✂️'}
                            {treatment.includes('تعقيم') && '🧼'}
                            {treatment.includes('مصيدة') && '🎯'}
                            {!treatment.includes('رش') && !treatment.includes('إزالة') && '💊'}
                          </span>
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 10. الظروف البيئية */}
                  {uiState.analysisResult.environmentalConditions && (
                    <div className="result-card">
                      <h5>🌡️ الظروف البيئية</h5>
                      <div className="info-row">
                        <span className="info-label">الظروف المساعدة</span>
                        <span className="info-value favorable">{uiState.analysisResult.environmentalConditions.favorable || 'غير محددة'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">الظروف غير المساعدة</span>
                        <span className="info-value unfavorable">{uiState.analysisResult.environmentalConditions.unfavorable || 'غير محددة'}</span>
                      </div>
                    </div>
                  )}

                  {/* 11. نصائح العناية */}
                  <div className="result-card">
                    <h5>💡 نصائح العناية</h5>
                    <ul>
                      {safeArray(uiState.analysisResult.careTips).map((tip, i) => (
                        <li key={i}>
                          <span className="tip-icon">✨</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 12. دورة حياة الحشرة */}
                  {uiState.analysisResult.problemType === 'حشري' && uiState.analysisResult.lifeCycleNotes && (
                    <div className="result-card">
                      <h5>🔄 دورة حياة الحشرة</h5>
                      <div className="info-row">
                        <span className="info-label">دورة الحياة</span>
                        <span className="info-value">{uiState.analysisResult.lifeCycleNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* 13. الأصناف المقاومة */}
                  {safeArray(uiState.analysisResult.resistantVarieties).length > 0 && (
                    <div className="result-card">
                      <h5>{uiState.analysisResult.problemType === 'حشري' ? '🌾 أصناف مقاومة للحشرات' : '🌾 الأصناف المقاومة'}</h5>
                      <ul>
                        {safeArray(uiState.analysisResult.resistantVarieties).map((variety, i) => (
                          <li key={i}>
                            <span className="variety-icon">🌟</span>
                            {variety}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 14. المصادر العلمية */}
                  {safeArray(uiState.analysisResult.references).length > 0 && (
                    <div className="result-card">
                      <h5>📚 المصادر العلمية</h5>
                      <ul>
                        {safeArray(uiState.analysisResult.references).map((ref, i) => (
                          <li key={i}>
                            <span className="ref-icon">📖</span>
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}

            {uiState.analysisResult?.error && !uiState.analysisResult.isRateLimit && (
              <div className="error-container">
                <div className="error-icon">❌</div>
                <h4>فشل التحليل</h4>
                <p>{uiState.analysisResult.message}</p>
                {uiState.analysisResult.details && <p className="error-details">{uiState.analysisResult.details}</p>}
              </div>
            )}

            <div className="preview-actions">
              <button className="retake-btn" onClick={resetImage}>↻ إعادة الرفع</button>
              <button className={`analyze-btn ${uiState.isAnalyzing ? 'loading' : ''}`} onClick={analyzePlant} disabled={uiState.isAnalyzing}>
                {uiState.isAnalyzing ? (
                  <>
                    <div className="spinner"></div>
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    تحليل النبات
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`upload-area glass ${uiState.isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-options">
              <label className="upload-option">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" className="option-btn" onClick={() => fileInputRef.current?.click()}>
                  <span className="option-icon">📁</span>
                  <span className="option-text">رفع صورة</span>
                  <span className="option-desc">اختر من جهازك</span>
                </button>
              </label>

              <label className="upload-option">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" className="option-btn" onClick={handleCameraCapture}>
                  <span className="option-icon">📷</span>
                  <span className="option-text">تصوير مباشر</span>
                  <span className="option-desc">استخدم الكاميرا</span>
                </button>
              </label>

              <div className="upload-option drag-option">
                <div className="option-btn drag-btn">
                  <span className="option-icon">🖱️</span>
                  <span className="option-text">سحب وإفلات</span>
                  <span className="option-desc">اسحب الصورة هنا</span>
                </div>
              </div>
            </div>

            <div className="upload-features">
              <div className="feature">
                <span>⚡</span>
                <span>تحليل فوري</span>
              </div>
              <div className="feature">
                <span>🎯</span>
                <span>دقة عالية</span>
              </div>
              <div className="feature">
                <span>💡</span>
                <span>نصائح وعلاجات</span>
              </div>
            </div>

            <p className="upload-hint">📱 يدعم الصور الكبيرة | ضغط تلقائي ذكي</p>
          </div>
        )}
      </section>

      <section className="history-section">
        <div className="history-header">
          <h3>📋 سجل التشخيصات ({recentDiagnoses.length})</h3>
          {recentDiagnoses.length > 0 && (
            <button className="clear-history-btn" onClick={clearAllDiagnoses}>
              🗑️ حذف الكل
            </button>
          )}
        </div>

        {recentDiagnoses.length > 0 ? (
          <div className="history-list">
            {recentDiagnoses.map((diagnosis) => (
              <HistoryItem
                key={diagnosis.id}
                diagnosis={diagnosis}
                onView={handleViewDetails}
                onDelete={deleteDiagnosis}
              />
            ))}
          </div>
        ) : (
          <div className="no-data-message">لا توجد سجلات تشخيصية سابقة</div>
        )}
      </section>

    </div>
  );
};

export default DiagnoseScreen;