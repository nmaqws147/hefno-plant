
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './program-planer.css';
import { Helmet } from 'react-helmet-async';

const FertilizerPlanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crop: '',
    soilType: '',
    irrigationType: '',
    areaFeddan: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedStages, setExpandedStages] = useState({});

  //  الخيارات
  const crops = [
    'قمح', 'أرز', 'ذرة شامية', 'قطن', 'طماطم', 'فلفل', 'خيار', 'بطاطس',
    'بصل', 'ثوم', 'فول بلدي', 'برسيم', 'عنب', 'موز', 'حمضيات', 'فراولة'
  ];

  const soilTypes = [
    'تربة طميية (نيلية)', 'تربة رملية', 'تربة طينية ثقيلة', 
    'تربة رملية طميية', 'تربة ملحية', 'تربة كلسية (جيرية)'
  ];

  const irrigationTypes = [
    'ري بالغمر (سيحي)', 'ري بالرش', 'ري بالتنقيط'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/fertilizer-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في الاتصال');
      }

      setResult(data);
      
      if (data.plan?.schedule) {
        const initialExpanded = {};
        data.plan.schedule.slice(0, 3).forEach((_, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedStages(initialExpanded);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      crop: '',
      soilType: '',
      irrigationType: '',
      areaFeddan: '',
      plantingDate: '',
    });
    setResult(null);
    setError(null);
    setExpandedStages({});
  };

  const handleBack = () => {
    navigate('/knowledge-base');
  };

  const toggleStage = (index) => {
    setExpandedStages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDose = (dose) => {
    if (!dose) return 'غير محدد';
    if (dose.includes('كجم')) return `📦 ${dose}`;
    if (dose.includes('لتر')) return `🧴 ${dose}`;
    if (dose.includes('جم')) return `⚖️ ${dose}`;
    return dose;
  };

  const getStageColor = (stageName) => {
    if (stageName.includes('زراعة') || stageName.includes('شتل')) return '#4caf50';
    if (stageName.includes('نمو')) return '#2196f3';
    if (stageName.includes('تزهير')) return '#ff9800';
    if (stageName.includes('ثمار') || stageName.includes('نضج')) return '#9c27b0';
    return '#607d8b';
  };

  return (
    <div className="fertilizer-planner  " dir="rtl">
      <Helmet>
        <title>مخطط البرامج الزراعية | Hefno-Plant</title>
        <meta name="description" content="خطط برامج التسميد والري والعمليات الزراعية حسب المحصول والمرحلة — خطط مخصصة لنباتاتك." />
      </Helmet>
      <div className="planner-container">
        {/* رأس الصفحة */}
        <div className="planner-header special-page-header">
          <button className="back-button" onClick={handleBack}>
            <span>←</span> العودة
          </button>
          <div className="header-content">
            <div className="header-icon">
              <span>🧪</span>
            </div>
            <div className="header-text">
              <h1>برنامج التسميد الذكي</h1>
              <p className="header-subtitle">
                احصل على برنامج تسميد مخصص لمحصولك بناءً على بياناتك المدخلة
              </p>
              <div className="features-list">
                <span>✓ توصيات دقيقة</span>
                <span>✓ مدعوم بالذكاء الاصطناعي</span>
                <span>✓ مناسب للظروف المصرية</span>
              </div>
            </div>
          </div>
        </div>

        <div className="planner-main">
          {/* نموذج الإدخال */}
          <div className="form-section">
            <h2 className="section-title">📋 بيانات المزرعة</h2>
            <form onSubmit={handleSubmit} className="fertilizer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>المحصول *</label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر المحصول</option>
                    {crops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>نوع التربة *</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر نوع التربة</option>
                    {soilTypes.map(soil => (
                      <option key={soil} value={soil}>{soil}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>نظام الري *</label>
                  <select
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر نظام الري</option>
                    {irrigationTypes.map(irr => (
                      <option key={irr} value={irr}>{irr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>المساحة (فدان) *</label>
                  <input
                    type="number"
                    name="areaFeddan"
                    value={formData.areaFeddan}
                    onChange={handleChange}
                    placeholder="مثال: 2"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>

              </div>

              <div className="form-actions">
                <button type="button" className="reset-btn" onClick={handleReset}>
                  إعادة تعيين
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      احصل على برنامج التسميد
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* عرض النتائج */}
          {error && (
            <div className="error-section">
              <div className="error-card">
                <span className="error-icon">⚠️</span>
                <h3>حدث خطأ</h3>
                <p>{error}</p>
                <button onClick={() => setError(null)}>حاول مرة أخرى</button>
              </div>
            </div>
          )}

          {result && result.success && result.plan && (
            <div className="results-section">
              <h2 className="section-title">🌾 برنامج التسميد الموصى به</h2>
              
              {/* ملخص سريع */}
              <div className="quick-summary">
                <div className="summary-card">
                  <span className="summary-icon">🌱</span>
                  <div className="summary-info">
                    <label>المحصول</label>
                    <value>{result.plan.crop}</value>
                  </div>
                </div>
                <div className="summary-card">
                  <span className="summary-icon">📅</span>
                  <div className="summary-info">
                    <label>مدة الموسم</label>
                    <value>{result.plan.duration || 'غير محدد'}</value>
                  </div>
                </div>
                {result.plan.summary && (
                  <>
                    <div className="summary-card">
                      <span className="summary-icon">🧪</span>
                      <div className="summary-info">
                        <label>إجمالي N-P-K</label>
                        <value>{result.plan.summary.total_n}/{result.plan.summary.total_p}/{result.plan.summary.total_k} كجم</value>
                      </div>
                    </div>
                    <div className="summary-card">
                      <span className="summary-icon">📊</span>
                      <div className="summary-info">
                        <label>الإنتاج المتوقع</label>
                        <value>{result.plan.summary.expectedYield} طن/فدان</value>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="results-content">
                <div className="plan-display">
                  
                  {/* الأسمدة الموصى بها - بطريقة منظمة */}
                  {result.plan.fertilizers && result.plan.fertilizers.length > 0 && (
                    <div className="fertilizer-recommendations">
                      <h3>🧪 الأسمدة الموصى بها</h3>
                      <div className="fertilizer-grid">
                        {result.plan.fertilizers.map((fert, idx) => (
                          <div key={idx} className="fertilizer-card">
                            <div className="fert-header">
                              <span className="fert-icon">🧴</span>
                              <span className="fert-name">{fert.name}</span>
                            </div>
                            <div className="fert-details">
                              <div className="fert-dose">
                                <span>الجرعة:</span>
                                <strong>{formatDose(fert.dose)}</strong>
                              </div>
                              <div className="fert-method">
                                <span>الطريقة:</span>
                                <span>{fert.method}</span>
                              </div>
                              <div className="fert-timing">
                                <span>التوقيت:</span>
                                <span>{fert.timing}</span>
                              </div>
                              {fert.notes && (
                                <div className="fert-notes">
                                  <span>📝 {fert.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* جدول المراحل (الأهم) */}
                  {result.plan.schedule && result.plan.schedule.length > 0 && (
                    <div className="schedule-section">
                      <h3>📅 مراحل النمو والتسميد</h3>
                      <div className="stages-timeline">
                        {result.plan.schedule.map((stage, idx) => (
                          <div 
                            key={idx} 
                            className={`stage-card ${expandedStages[idx] ? 'expanded' : ''}`}
                            style={{ borderRightColor: getStageColor(stage.stage) }}
                          >
                            <div className="stage-header" onClick={() => toggleStage(idx)}>
                              <div className="stage-info">
                                <span className="stage-number">{idx + 1}</span>
                                <div className="stage-title">
                                  <h4>{stage.stage}</h4>
                                  <span className="stage-weeks">{stage.weeks}</span>
                                </div>
                              </div>
                              <div className="stage-toggle">
                                <span>{expandedStages[idx] ? '▲' : '▼'}</span>
                              </div>
                            </div>
                            
                            {expandedStages[idx] && (
                              <div className="stage-body">
                                <p className="stage-description">{stage.description}</p>
                                
                                {stage.irrigation && (
                                  <div className="stage-irrigation">
                                    <span className="irrigation-icon">💧</span>
                                    <span>{stage.irrigation}</span>
                                  </div>
                                )}
                                
                                {stage.watch && (
                                  <div className="stage-watch">
                                    <span className="watch-icon">👁️</span>
                                    <span>{stage.watch}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* نصائح وتحذيرات */}
                  <div className="tips-warnings-grid">
                    {result.plan.tips && result.plan.tips.length > 0 && (
                      <div className="tips-section">
                        <h3>💡 نصائح مهمة</h3>
                        <ul>
                          {result.plan.tips.map((tip, idx) => (
                            <li key={idx}>
                              <span className="tip-icon">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.plan.warnings && result.plan.warnings.length > 0 && (
                      <div className="warning-section">
                        <h3>⚠️ تحذيرات</h3>
                        <ul>
                          {result.plan.warnings.map((warning, idx) => (
                            <li key={idx}>
                              <span className="warning-icon">!</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* حالة عدم وجود نتائج */}
          {result && !result.success && (
            <div className="error-section">
              <div className="error-card">
                <span className="error-icon">❌</span>
                <h3>لم يتم العثور على برنامج</h3>
                <p>{result.error || 'عذراً، لم نتمكن من إيجاد برنامج تسميد للمحصول المطلوب'}</p>
                {result.availableCrops && (
                  <div className="available-crops">
                    <strong>المحاصيل المتوفرة:</strong>
                    <div className="crops-list">
                      {result.availableCrops.map(crop => (
                        <span key={crop} className="crop-tag">{crop}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleReset}>محاولة مرة أخرى</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FertilizerPlanner;