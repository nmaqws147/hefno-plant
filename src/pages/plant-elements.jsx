// components/knowledge/PlantNutrientsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nutrientsData from '../knowledge_base/planet-elements/plants-elements.json';
import './plant-elements.css';
import { Helmet } from 'react-helmet-async';

const PlantNutrientsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('macro_primary');
  const [activeTab, setActiveTab] = useState('functions');

  // تحميل البيانات من ملف JSON
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setData(nutrientsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('حدث خطأ في تحميل بيانات العناصر الغذائية');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNutrientClick = (nutrient) => {
    setSelectedNutrient(nutrient);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNutrient(null);
  };

  const getCategoryElements = () => {
    if (!data?.elements) return [];
    return data.elements.filter(el => el.category === activeCategory);
  };

  const getCategoryName = () => {
    const categories = {
      macro_primary: { ar: 'العناصر الكبرى الأساسية', en: 'Macro Primary', icon: '🌱', color: '#2D6A4F' },
      macro_secondary: { ar: 'العناصر الكبرى الثانوية', en: 'Macro Secondary', icon: '🍃', color: '#10b981' },
      micronutrients: { ar: 'العناصر الصغرى', en: 'Micronutrients', icon: '🔬', color: '#8b5cf6' },
      beneficial: { ar: 'العناصر المفيدة', en: 'Beneficial', icon: '✨', color: '#f59e0b' }
    };
    return categories[activeCategory] || categories.macro_primary;
  };

  const categoryInfo = getCategoryName();

  if (loading) {
    return (
      <div className="nutrients-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل العناصر الغذائية...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="nutrients-page error" dir="rtl">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>حدث خطأ</h3>
          <p>{error || 'لا توجد بيانات'}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrients-page   " dir="rtl"> 
      <Helmet>
        <title>تغذية النبات والعناصر | Hefno-Plant</title>
        <meta name="description" content="دليل العناصر الغذائية للنباتات — النيتروجين، الفوسفور، البوتاسيوم، والعناصر الصغرى وأعراض نقصها." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="nutrients-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🧪</span>
          </div>
          <div className="header-text">
            <h1>{data.ar_name}</h1>
            <p className="header-en">{data.name_en}</p>
            <p className="header-description">
              دليل شامل للعناصر الغذائية الأساسية للنبات — الوظائف، أعراض النقص، المكافحة
            </p>
            <div className="stats-badge">
              <span className="stat-badge">🌱 {data.total_elements - 2} عنصر أساسي</span>
              <span className="stat-badge">📊 {data.classification.macro_primary.length + data.classification.macro_secondary.length} عناصر كبرى</span>
              <span className="stat-badge">🔬 {data.classification.micronutrients.length} عناصر صغرى</span>
            </div>
          </div>
        </div>
      </div>

      {/* تبويبات التصنيفات */}
      <div className="categories-tabs">
        <button
          className={`cat-tab ${activeCategory === 'macro_primary' ? 'active' : ''}`}
          onClick={() => setActiveCategory('macro_primary')}
        >
          <span>🌱</span> العناصر الكبرى الأساسية
        </button>
        <button
          className={`cat-tab ${activeCategory === 'macro_secondary' ? 'active' : ''}`}
          onClick={() => setActiveCategory('macro_secondary')}
        >
          <span>🍃</span> العناصر الكبرى الثانوية
        </button>
        <button
          className={`cat-tab ${activeCategory === 'micronutrient' ? 'active' : ''}`}
          onClick={() => setActiveCategory('micronutrient')}
        >
          <span>🔬</span> العناصر الصغرى
        </button>
        {/* <button
          className={`cat-tab ${activeCategory === 'beneficial' ? 'active' : ''}`}
          onClick={() => setActiveCategory('beneficial')}
        >
          <span>✨</span> العناصر المفيدة
        </button> */}
      </div>

      {/* معلومات التصنيف */}
      <div className="category-info">
        <div className="category-header">
          <span className="category-icon" style={{ background: `${categoryInfo.color}15` }}>
            {categoryInfo.icon}
          </span>
          <div>
            <h2 className="category-title">{categoryInfo.ar}</h2>
            <p className="category-en">{categoryInfo.en}</p>
          </div>
        </div>
      </div>

      {/* شبكة العناصر */}
      <div className="nutrients-grid">
        {getCategoryElements().map((nutrient) => (
          <div
            key={nutrient.id}
            className="nutrient-card"
            onClick={() => handleNutrientClick(nutrient)}
            style={{ '--nutrient-color': categoryInfo.color }}
          >
            <div className="card-glass"></div>
            
            <div className="card-content">
              <div className="card-header">
                <div className="symbol-badge" style={{ background: `${categoryInfo.color}15`, color: categoryInfo.color }}>
                  {nutrient.symbol}
                </div>
              </div>

              <h3 className="nutrient-name">{nutrient.ar_name}</h3>
              <p className="scientific-name">{nutrient.name_en}</p>

              <div className="role-preview">
                <span className="role-icon">📌</span>
                <p>{nutrient.ar_role.substring(0, 100)}...</p>
              </div>

              <div className="deficiency-preview">
                <span className="deficiency-icon">⚠️</span>
                <p>{nutrient.deficiency?.ar_symptoms?.substring(0, 80)}...</p>
              </div>

              <div className="card-stats">
                <div className="stat-chip">
                  <span>🌱</span> <strong>{nutrient.crop_needs_high?.slice(0, 2).join(', ') || 'محاصيل متنوعة'}</strong>
                </div>
                <div className="stat-chip">
                  <span>⚖️</span> <strong>pH: {nutrient.optimal_range?.ph_optimal || '6.0-7.0'}</strong>
                </div>
              </div>

              <div className="card-footer">
                <div className="card-link">
                  عرض التفاصيل
                  <span className="link-arrow">←</span>
                </div>
              </div>
            </div>

            <div className="card-hover-effect"></div>
            <div className="card-shine"></div>
          </div>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="nutrients-stats">
        <div className="stat-card">
          <span className="stat-number">{data.elements.length}</span>
          <span className="stat-label">عنصر غذائي</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">{data.classification.macro_primary.length + data.classification.macro_secondary.length}</span>
          <span className="stat-label">عناصر كبرى</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">{data.classification.micronutrients.length}</span>
          <span className="stat-label">عناصر صغرى</span>
        </div>
      </div>

      {/* Modal لعرض تفاصيل العنصر */}
      {showModal && selectedNutrient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="nutrient-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-symbol" style={{ background: `${categoryInfo.color}15`, color: categoryInfo.color }}>
                {selectedNutrient.symbol}
              </div>
              <div className="modal-title">
                <h2>{selectedNutrient.ar_name}</h2>
                <p className="modal-scientific">{selectedNutrient.name_en}</p>
                <p className="modal-category">تصنيف: {selectedNutrient.category === 'macro_primary' ? 'عنصر كبرى أساسي' : 
                  selectedNutrient.category === 'macro_secondary' ? 'عنصر كبرى ثانوي' :
                  selectedNutrient.category === 'micronutrients' ? 'عنصر صغرى' : 'عنصر مفيد'}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* تبويبات المحتوى */}
              <div className="nutrient-tabs">
                <button
                  className={`nutrient-tab ${activeTab === 'functions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('functions')}
                >
                  <span>📋</span> الوظائف
                </button>
                <button
                  className={`nutrient-tab ${activeTab === 'deficiency' ? 'active' : ''}`}
                  onClick={() => setActiveTab('deficiency')}
                >
                  <span>⚠️</span> أعراض النقص
                </button>
                <button
                  className={`nutrient-tab ${activeTab === 'correction' ? 'active' : ''}`}
                  onClick={() => setActiveTab('correction')}
                >
                  <span>💊</span> المكافحة
                </button>
                <button
                  className={`nutrient-tab ${activeTab === 'interactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interactions')}
                >
                  <span>🔄</span> التفاعلات
                </button>
                <button
                  className={`nutrient-tab ${activeTab === 'range' ? 'active' : ''}`}
                  onClick={() => setActiveTab('range')}
                >
                  <span>📊</span> المدى الأمثل
                </button>
              </div>

              {/* محتوى الوظائف */}
              {activeTab === 'functions' && (
                <div className="tab-content">
                  <div className="role-section">
                    <h3>📌 الدور في النبات</h3>
                    <p>{selectedNutrient.ar_role}</p>
                  </div>
                  <div className="functions-section">
                    <h3>✅ الوظائف الرئيسية</h3>
                    <ul className="functions-list">
                      {selectedNutrient.functions?.map((func, idx) => (
                        <li key={idx}>{func}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="forms-section">
                    <h3>🌱 الصيغة الممتصة</h3>
                    <div className="forms-tags">
                      {selectedNutrient.plant_form_absorbed?.map((form, idx) => (
                        <span key={idx} className="form-tag">{form}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى أعراض النقص */}
              {activeTab === 'deficiency' && selectedNutrient.deficiency && (
                <div className="tab-content">
                  <div className="deficiency-section">
                    <h3>⚠️ أعراض النقص</h3>
                    <p className="symptoms-text">{selectedNutrient.deficiency.ar_symptoms}</p>
                  </div>
                  
                  <div className="deficiency-details">
                    <div className="detail-row">
                      <span className="detail-label">📍 أول الأجزاء تأثراً:</span>
                      <span>{selectedNutrient.deficiency.first_affected}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🔄 حركة العنصر في النبات:</span>
                      <span>{selectedNutrient.deficiency.mobility}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">👁️ المفتاح البصري:</span>
                      <span>{selectedNutrient.deficiency.visual_key}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🔄 يتشابه مع:</span>
                      <span>{selectedNutrient.deficiency.confused_with}</span>
                    </div>
                  </div>

                  <div className="soil-causes">
                    <h3>🌍 أسباب نقص العنصر في التربة</h3>
                    <ul className="causes-list">
                      {selectedNutrient.deficiency.soil_causes?.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="severity-levels">
                    <h3>📊 مستويات شدة النقص</h3>
                    {selectedNutrient.deficiency.severity_levels?.map((level, idx) => (
                      <div key={idx} className="severity-item">
                        <span className="severity-level">المستوى {level.level}</span>
                        <span className="severity-desc">{level.ar_desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* محتوى المكافحة */}
              {activeTab === 'correction' && selectedNutrient.deficiency?.correction && (
                <div className="tab-content">
                  <div className="correction-section">
                    <div className="correction-item">
                      <span className="correction-icon">💧</span>
                      <div>
                        <h4>الرش الورقي</h4>
                        <p>{selectedNutrient.deficiency.correction.foliar_ar}</p>
                      </div>
                    </div>
                    <div className="correction-item">
                      <span className="correction-icon">🌱</span>
                      <div>
                        <h4>إضافة للتربة</h4>
                        <p>{selectedNutrient.deficiency.correction.soil_ar}</p>
                      </div>
                    </div>
                    <div className="correction-item">
                      <span className="correction-icon">🍂</span>
                      <div>
                        <h4>المواد العضوية</h4>
                        <p>{selectedNutrient.deficiency.correction.organic_ar}</p>
                      </div>
                    </div>
                    <div className="correction-item">
                      <span className="correction-icon">⏰</span>
                      <div>
                        <h4>التوقيت المناسب</h4>
                        <p>{selectedNutrient.deficiency.correction.timing_ar}</p>
                      </div>
                    </div>
                  </div>

                  {selectedNutrient.toxicity && (
                    <div className="toxicity-section">
                      <h3>⚠️ السمية (زيادة العنصر)</h3>
                      <p>{selectedNutrient.toxicity.ar_symptoms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* محتوى التفاعلات */}
              {activeTab === 'interactions' && (
                <div className="tab-content">
                  <div className="interactions-grid">
                    <div className="interaction-card synergies">
                      <h3>🤝 تفاعلات تكاملية (Synergistic)</h3>
                      <ul>
                        {selectedNutrient.interactions?.synergistic?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="interaction-card antagonistic">
                      <h3>⚔️ تفاعلات تنافسية (Antagonistic)</h3>
                      <ul>
                        {selectedNutrient.interactions?.antagonistic?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى المدى الأمثل */}
              {activeTab === 'range' && selectedNutrient.optimal_range && (
                <div className="tab-content">
                  <div className="optimal-range">
                    <div className="range-item">
                      <span className="range-icon">🍃</span>
                      <div>
                        <h4>المدى في الأوراق</h4>
                        <p>{selectedNutrient.optimal_range.leaf_tissue_ppm}</p>
                      </div>
                    </div>
                    <div className="range-item">
                      <span className="range-icon">🌱</span>
                      <div>
                        <h4>المدى في التربة</h4>
                        <p>{selectedNutrient.optimal_range.soil_ppm}</p>
                      </div>
                    </div>
                    <div className="range-item">
                      <span className="range-icon">⚗️</span>
                      <div>
                        <h4>درجة الحموضة المثلى (pH)</h4>
                        <p>{selectedNutrient.optimal_range.ph_optimal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="crops-section">
                    <h3>🌾 المحاصيل ذات الاحتياج العالي</h3>
                    <div className="crops-tags">
                      {selectedNutrient.crop_needs_high?.map((crop, idx) => (
                        <span key={idx} className="crop-tag">{crop}</span>
                      ))}
                    </div>
                  </div>

                  <div className="crops-section">
                    <h3>🌿 المحاصيل ذات الاحتياج المنخفض</h3>
                    <div className="crops-tags">
                      {selectedNutrient.crop_needs_low?.map((crop, idx) => (
                        <span key={idx} className="crop-tag low">{crop}</span>
                      ))}
                    </div>
                  </div>

                  {selectedNutrient.egypt_note && (
                    <div className="egypt-note">
                      <span className="note-icon">🇪🇬</span>
                      <p>{selectedNutrient.egypt_note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" style={{ background: categoryInfo.color }} onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantNutrientsPage;