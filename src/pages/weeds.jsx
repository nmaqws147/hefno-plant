// components/knowledge/WeedsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import weedsData from '../knowledge_base/Weeds/data.json';
import './weeds.css';
import { Helmet } from 'react-helmet-async';

const WeedsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedWeed, setSelectedWeed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setData(weedsData);
    if (weedsData?.weed_categories?.length > 0) {
      setActiveCategory(weedsData.weed_categories[0].id);
    }
  }, []);

  const handleWeedClick = (weed) => {
    setSelectedWeed(weed);
    setShowModal(true);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWeed(null);
  };

  const getActiveCategoryData = () => {
    if (!data?.weed_categories) return null;
    return data.weed_categories.find(cat => cat.id === activeCategory);
  };

  const getDangerClass = (level) => {
    switch (level) {
      case 'عالية جدا': return 'danger-critical';
      case 'عالية': return 'danger-high';
      case 'متوسطة': return 'danger-medium';
      case 'منخفضة': return 'danger-low';
      default: return 'danger-medium';
    }
  };

  const getDangerIcon = (level) => {
    switch (level) {
      case 'عالية جدا': return '🔴';
      case 'عالية': return '🟠';
      case 'متوسطة': return '🟡';
      case 'منخفضة': return '🟢';
      default: return '🟡';
    }
  };

  const activeCategoryData = getActiveCategoryData();

  if (!data) {
    return (
      <div className="weeds-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل بيانات الحشائش...</p>
        </div>
      </div>
    );
  }

  const cardConfig = data.card_display_config;

  return (
    <div className="weeds-page  " dir="rtl" style={{ '--primary-color': cardConfig.card_color_primary, '--secondary-color': cardConfig.card_color_secondary }}>
      <Helmet>
        <title>الحشائش الضارة | Hefno-Plant</title>
        <meta name="description" content="دليل الحشائش الضارة في المحاصيل — تعريفها، أنواعها، وطرق المكافحة المتكاملة." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="weeds-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>{cardConfig.card_icon}</span>
          </div>
          <div className="header-text">
            <h1>{data.metadata.name_ar}</h1>
            <p className="header-en">{data.metadata.name_en}</p>
            <div className="warning-banner">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">{data.metadata.warning_ar}</span>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats-cards">
        {cardConfig.highlight_stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <span className="stat-value">{stat.value_ar}</span>
            <span className="stat-label">{stat.label_ar}</span>
          </div>
        ))}
      </div>

      {/* تبويبات التصنيفات */}
      <div className="categories-tabs">
        {data.weed_categories.map((category) => (
          <button
            key={category.id}
            className={`cat-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="cat-icon">
              {category.id === 'weed-cat-01' ? '🌾' : category.id === 'weed-cat-02' ? '🍃' : '🌿'}
            </span>
            <span className="cat-name">{category.name_ar}</span>
            <span className="cat-count">{category.weeds?.length || 0}</span>
          </button>
        ))}
      </div>

      {/* محتوى التصنيف النشط */}
      {activeCategoryData && (
        <div className="category-content">
          <div className="category-header">
            <h2 className="category-title">{activeCategoryData.name_ar}</h2>
            <p className="category-en">{activeCategoryData.name_en}</p>
            <p className="category-description">{activeCategoryData.description_ar}</p>
            <p className="category-char">{activeCategoryData.characteristics_ar}</p>
          </div>

          <div className="weeds-grid">
            {activeCategoryData.weeds.map((weed) => (
              <div
                key={weed.id}
                className="weed-card"
                onClick={() => handleWeedClick(weed)}
              >
                <div className="card-glass"></div>
                
                <div className="card-content">
                  <div className="card-header">
                    <span className={`danger-badge ${getDangerClass(weed.danger_level)}`}>
                      {getDangerIcon(weed.danger_level)} {weed.danger_level}
                    </span>
                  </div>

                  <h3 className="weed-name">{weed.name_ar}</h3>
                  <p className="scientific-name">{weed.name_scientific}</p>

                  <p className="weed-description">
                    {weed.description_ar.substring(0, 100)}...
                  </p>

                  <div className="weed-stats">
                    <div className="stat-row">
                      <span className="stat-label">النوع:</span>
                      <span className="stat-value">{weed.type_ar}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">العائلة:</span>
                      <span className="stat-value">{weed.family_ar}</span>
                    </div>
                  </div>

                  <div className="affected-crops-preview">
                    <span className="crops-label">أكثر المحاصيل تضرراً:</span>
                    <div className="crops-tags">
                      {weed.affected_crops_ar?.slice(0, 3).map((crop, idx) => (
                        <span key={idx} className="crop-tag">{crop.crop_ar}</span>
                      ))}
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
        </div>
      )}

      {/* نصائح سريعة */}
      <div className="quick-tips-section">
        <h2 className="section-title">💡 نصائح سريعة</h2>
        <div className="tips-grid">
          {cardConfig.quick_tips_ar.map((tip, idx) => (
            <div key={idx} className="tip-card">
              <span className="tip-icon">📌</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* التقويم الشهري */}
      <div className="calendar-section">
        <h2 className="section-title">📅 التقويم الشهري لمكافحة الحشائش</h2>
        <div className="calendar-grid">
          {data.weed_management_calendar?.months?.map((month, idx) => (
            <div key={idx} className="calendar-card">
              <div className="calendar-header">
                <span className="calendar-month">{month.months_ar}</span>
                <span className="calendar-season">{month.season_ar}</span>
              </div>
              <div className="calendar-body">
                <div className="calendar-weeds">
                  <span className="calendar-label">الحشائش النشطة:</span>
                  <div className="weeds-tags">
                    {month.active_weeds_ar?.map((weed, idx) => (
                      <span key={idx} className="weed-tag">{weed}</span>
                    ))}
                  </div>
                </div>
                <div className="calendar-actions">
                  <span className="calendar-label">الإجراءات الموصى بها:</span>
                  <ul className="actions-list">
                    {month.recommended_actions_ar?.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* المكافحة العضوية */}
      <div className="organic-section">
        <h2 className="section-title">🌱 المكافحة العضوية المتكاملة</h2>
        <div className="organic-grid">
          {data.organic_weed_management?.methods_ar?.map((method, idx) => (
            <div key={idx} className="organic-card">
              <h3>{method.method_ar}</h3>
              <p className="method-details">{method.details_ar}</p>
              <div className="method-stats">
                <span className="effectiveness">الفعالية: {method.effectiveness_ar}</span>
                <div className="crops-tags">
                  {method.crops_ar?.map((crop, idx) => (
                    <span key={idx} className="crop-tag-small">{crop}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal لعرض تفاصيل الحشيشة */}
      {showModal && selectedWeed && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="weed-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🌿</span>
              </div>
              <div className="modal-title">
                <h2>{selectedWeed.name_ar}</h2>
                <p className="modal-scientific">{selectedWeed.name_scientific}</p>
                <span className={`modal-danger ${getDangerClass(selectedWeed.danger_level)}`}>
                  {getDangerIcon(selectedWeed.danger_level)} {selectedWeed.danger_level}
                </span>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* تبويبات */}
              <div className="modal-tabs">
                <button className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📋 نظرة عامة</button>
                <button className={`modal-tab ${activeTab === 'identification' ? 'active' : ''}`} onClick={() => setActiveTab('identification')}>🔍 التعريف</button>
                <button className={`modal-tab ${activeTab === 'management' ? 'active' : ''}`} onClick={() => setActiveTab('management')}>💊 المكافحة</button>
                <button className={`modal-tab ${activeTab === 'reproduction' ? 'active' : ''}`} onClick={() => setActiveTab('reproduction')}>🔄 التكاثر</button>
              </div>

              {/* محتوى نظرة عامة */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="info-section">
                    <h3>📝 الوصف</h3>
                    <p>{selectedWeed.description_ar}</p>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">العائلة:</span>
                      <span className="info-value">{selectedWeed.family_ar}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">النوع:</span>
                      <span className="info-value">{selectedWeed.type_ar}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الموطن:</span>
                      <span className="info-value">{selectedWeed.habitat_ar?.join('، ')}</span>
                    </div>
                  </div>
                  <div className="affected-crops">
                    <h3>🌾 المحاصيل المتضررة</h3>
                    <div className="crops-grid-modal">
                      {selectedWeed.affected_crops_ar?.map((crop, idx) => (
                        <div key={idx} className="crop-item">
                          <span className="crop-name">{crop.crop_ar}</span>
                          <span className={`crop-severity ${getDangerClass(crop.severity)}`}>{crop.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedWeed.useful_notes_ar && (
                    <div className="notes-section">
                      <h3>💡 ملاحظات</h3>
                      <p>{selectedWeed.useful_notes_ar}</p>
                    </div>
                  )}
                </div>
              )}

              {/* محتوى التعريف */}
              {activeTab === 'identification' && selectedWeed.identification && (
                <div className="tab-content">
                  <div className="identification-grid">
                    <div className="ident-item">
                      <span className="ident-label">الارتفاع:</span>
                      <span className="ident-value">{selectedWeed.identification.height_cm}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">الأوراق:</span>
                      <span className="ident-value">{selectedWeed.identification.leaf_ar}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">الساق:</span>
                      <span className="ident-value">{selectedWeed.identification.stem_ar}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">الأزهار:</span>
                      <span className="ident-value">{selectedWeed.identification.flower_ar}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">البذور:</span>
                      <span className="ident-value">{selectedWeed.identification.seed_ar}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">الجذور:</span>
                      <span className="ident-value">{selectedWeed.identification.root_ar}</span>
                    </div>
                    <div className="ident-item">
                      <span className="ident-label">الموسم:</span>
                      <span className="ident-value">{selectedWeed.identification.season_ar}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى المكافحة */}
              {activeTab === 'management' && selectedWeed.management && (
                <div className="tab-content">
                  <div className="management-section-modal">
                    {selectedWeed.management.prevention_ar && selectedWeed.management.prevention_ar.length > 0 && (
                      <div className="mgmt-group">
                        <h3>🛡️ الوقاية</h3>
                        <ul>
                          {selectedWeed.management.prevention_ar.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedWeed.management.cultural_ar && selectedWeed.management.cultural_ar.length > 0 && (
                      <div className="mgmt-group">
                        <h3>🌾 المكافحة الزراعية</h3>
                        <ul>
                          {selectedWeed.management.cultural_ar.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedWeed.management.mechanical_ar && selectedWeed.management.mechanical_ar.length > 0 && (
                      <div className="mgmt-group">
                        <h3>⚙️ المكافحة الميكانيكية</h3>
                        <ul>
                          {selectedWeed.management.mechanical_ar.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedWeed.management.herbicides && selectedWeed.management.herbicides.length > 0 && (
                      <div className="mgmt-group">
                        <h3>🧪 المبيدات الموصى بها</h3>
                        {selectedWeed.management.herbicides.map((herb, idx) => (
                          <div key={idx} className="herbicide-card">
                            <div className="herb-name">{herb.active_ingredient_ar}</div>
                            <div className="herb-details">
                              <span>الجرعة: {herb.dose_ar}</span>
                              <span>الطريقة: {herb.method_ar}</span>
                              <span>التوقيت: {herb.timing_ar}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedWeed.management.organic_control_ar && selectedWeed.management.organic_control_ar.length > 0 && (
                      <div className="mgmt-group">
                        <h3>🌱 المكافحة العضوية</h3>
                        <ul>
                          {selectedWeed.management.organic_control_ar.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* محتوى التكاثر */}
              {activeTab === 'reproduction' && selectedWeed.reproduction_ar && (
                <div className="tab-content">
                  <div className="reproduction-section">
                    <div className="reprod-item">
                      <span className="reprod-label">طرق التكاثر:</span>
                      <div className="reprod-methods">
                        {selectedWeed.reproduction_ar.methods_ar?.map((method, idx) => (
                          <span key={idx} className="method-badge">{method}</span>
                        ))}
                      </div>
                    </div>
                    <div className="reprod-item">
                      <span className="reprod-label">عدد البذور:</span>
                      <span className="reprod-value">{selectedWeed.reproduction_ar.seeds_per_plant}</span>
                    </div>
                    <div className="reprod-item">
                      <span className="reprod-label">عمر البذور:</span>
                      <span className="reprod-value">{selectedWeed.reproduction_ar.viability_years}</span>
                    </div>
                    <div className="reprod-item">
                      <span className="reprod-label">طرق الانتشار:</span>
                      <span className="reprod-value">{selectedWeed.reproduction_ar.spread_ar}</span>
                    </div>
                    {selectedWeed.reproduction_ar.tubers_per_plant && (
                      <div className="reprod-item">
                        <span className="reprod-label">الدرنات:</span>
                        <span className="reprod-value">{selectedWeed.reproduction_ar.tubers_per_plant}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModal}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeedsPage;