// components/knowledge/NematodaPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nematodaData from '../../insects-folder/nematoda.json';
import './nematoda.css';

const NematodaPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeSpeciesTab, setActiveSpeciesTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('all'); // all, dangerous, beneficial

  useEffect(() => {
    setData(nematodaData);
  }, []);

  const handleSpeciesClick = (species, isBeneficial = false) => {
    setSelectedSpecies({ ...species, isBeneficial });
    setShowModal(true);
    setActiveSpeciesTab('overview');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSpecies(null);
  };

  const getDangerClass = (level) => {
    switch (level) {
      case 'عالية جداً': return 'danger-critical';
      case 'عالية': return 'danger-high';
      case 'عالية - متوسطة': return 'danger-medium';
      case 'متوسطة': return 'danger-mid';
      default: return 'danger-mid';
    }
  };

  const getFilteredSpecies = () => {
    if (!data) return [];
    
    if (activeCategory === 'dangerous') {
      // الضارة: اللي عندها danger_level
      return data.species?.filter(s => s.danger_level) || [];
    }
    
    if (activeCategory === 'beneficial') {
      // النافعة من القسم الخاص بها
      return data.beneficial_nematodes?.species || [];
    }
    
    // الكل (ضارة + نافعة)
    const allDangerous = data.species || [];
    const allBeneficial = data.beneficial_nematodes?.species || [];
    return [...allDangerous, ...allBeneficial];
  };

  if (!data) {
    return (
      <div className="nematoda-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل بيانات النيماتودا...</p>
        </div>
      </div>
    );
  }

  const filteredSpecies = getFilteredSpecies();
  
  // إحصائيات سريعة من البيانات المتاحة
  const highlightStats = [
    { value_ar: data.general_overview?.size_ar || "0.1 - 5 مم", label_ar: "حجم الدودة" },
    { value_ar: data.general_overview?.economic_losses_egypt_ar?.yield_loss_percent || "10-80%", label_ar: "نسبة الخسارة" },
    { value_ar: data.metadata?.warning_ar?.split('—')[0] || "10-25%", label_ar: "خسائر عالمية" }
  ];

  // نصائح سريعة من بيانات الخطر
  const quickTips = data.general_overview?.why_dangerous_ar?.slice(0, 4) || [
    "تمتص عصارة الجذور وتضعف النبات",
    "تحدث جروحاً في الجذور لدخول الفطريات",
    "تخل بامتصاص الماء والعناصر الغذائية",
    "لا ترى بالعين المجردة — التشخيص صعب"
  ];

  return (
    <div className="nematoda-page" dir="rtl" style={{ '--danger-color': '#8B0000' }}>

      {/* رأس الصفحة */}
      <div className="nematoda-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon" style={{ background: '#8B000015' }}>
            <span>🐛</span>
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
      <div className="stats-container-glass">
        {highlightStats.map((stat, idx) => (
          <div key={idx} className="stat-item-premium">
            <div className="stat-icon-wrapper">
              {/* يمكنك إضافة أيقونة ديناميكية بناءً على نوع الإحصائية */}
              {idx === 0 ? '📉' : idx === 1 ? '⚠️' : '🎯'}
            </div>
            <div className="stat-info">
              <h4 className="stat-value-highlight">{stat.value_ar}</h4>
              <p className="stat-label-sub">{stat.label_ar}</p>
            </div>
            {/* تأثير ضوئي خلفي */}
            <div className="stat-card-glow"></div>
          </div>
        ))}
      </div>

      {/* نظرة عامة */}
      <div className="overview-section">
        <h2 className="section-title">📌 نظرة عامة</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <h3>تعريف النيماتودا</h3>
            <p>{data.general_overview.definition_ar}</p>
            {data.general_overview.size_ar && <p><strong>الحجم:</strong> {data.general_overview.size_ar}</p>}
            {data.general_overview.shape_ar && <p><strong>الشكل:</strong> {data.general_overview.shape_ar}</p>}
          </div>
          <div className="overview-card">
            <h3>لماذا خطيرة؟</h3>
            <ul>
              {data.general_overview.why_dangerous_ar?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="overview-card">
            <h3>الخسائر الاقتصادية في مصر</h3>
            <div className="loss-stat">
              <span className="loss-value">{data.general_overview.economic_losses_egypt_ar.annual_losses_egp}</span>
              <span className="loss-label">خسائر سنوية</span>
            </div>
            <p className="loss-detail">نسبة الخسارة: {data.general_overview.economic_losses_egypt_ar.yield_loss_percent}</p>
            <div className="affected-crops">
              <strong>أكثر المحاصيل تضرراً:</strong>
              <div className="crops-tags">
                {data.general_overview.economic_losses_egypt_ar.most_affected_crops_ar?.map((crop, idx) => (
                  <span key={idx} className="crop-tag">{crop}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تبويبات الأنواع */}
      <div className="categories-tabs">
        <button
          className={`species-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <span>🐛</span> جميع الأنواع
        </button>
        <button
          className={`species-tab ${activeCategory === 'dangerous' ? 'active' : ''}`}
          onClick={() => setActiveCategory('dangerous')}
        >
          <span>🔴</span> الأنواع الخطيرة
        </button>
        <button
          className={`species-tab ${activeCategory === 'beneficial' ? 'active' : ''}`}
          onClick={() => setActiveCategory('beneficial')}
        >
          <span>✅</span> النيماتودا المفيدة
        </button>
      </div>

      {/* شبكة الأنواع */}
      <div className="species-grid">
        {filteredSpecies.map((species, idx) => {
          // التحقق إذا كانت النيماتودا نافعة
          const isBeneficial = species.how_it_works_ar !== undefined;
          
          return (
            <div
              key={species.id || idx}
              className={`species-card ${isBeneficial ? 'beneficial' : 'dangerous'}`}
              onClick={() => handleSpeciesClick(species, isBeneficial)}
            >
              <div className="card-glass"></div>
              
              <div className="card-content">
                <div className="card-header">
                  {!isBeneficial && species.danger_level && (
                    <span className={`danger-badge ${getDangerClass(species.danger_level)}`}>
                      {species.danger_icon || '🔴'} {species.danger_level}
                    </span>
                  )}
                  {isBeneficial && (
                    <span className="beneficial-badge">
                      ✅ مفيد
                    </span>
                  )}
                </div>

                <h3 className="species-name">{species.name_ar}</h3>
                <p className="scientific-name">{species.name_en || species.name_scientific}</p>

                {/* وصف مختلف حسب النوع */}
                <p className="species-description">
                  {isBeneficial 
                    ? (species.how_it_works_ar?.substring(0, 100) || species.description_ar?.substring(0, 100))
                    : (species.description_ar?.substring(0, 100))}...
                </p>

                {/* الأهداف (للنيماتودا النافعة) أو العوائل (للضارة) */}
                {isBeneficial && species.target_insects_ar && (
                  <div className="host-preview">
                    <span className="host-icon">🐛</span>
                    <span className="host-text">
                      يستهدف: {species.target_insects_ar.slice(0, 3).join(', ')}
                    </span>
                  </div>
                )}
                
                {!isBeneficial && species.host_plants_ar && (
                  <div className="host-preview">
                    <span className="host-icon">🌱</span>
                    <span className="host-text">
                      {species.host_plants_ar?.highly_susceptible_ar?.slice(0, 3).join(', ') || 'محاصيل متنوعة'}
                    </span>
                  </div>
                )}

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
          );
        })}
      </div>

      {/* نصائح سريعة */}
      <div className="quick-tips-section">
        <h2 className="section-title">💡 نصائح سريعة</h2>
        <div className="tips-grid">
          {quickTips.map((tip, idx) => (
            <div key={idx} className="tip-card">
              <span className="tip-icon">📌</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal لعرض تفاصيل النوع */}
      {showModal && selectedSpecies && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="species-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>{selectedSpecies.isBeneficial ? '✅' : '🐛'}</span>
              </div>
              <div className="modal-title">
                <h2>{selectedSpecies.name_ar}</h2>
                <p className="modal-scientific">{selectedSpecies.name_en || selectedSpecies.name_scientific}</p>
                {!selectedSpecies.isBeneficial && selectedSpecies.danger_level && (
                  <span className={`modal-danger ${getDangerClass(selectedSpecies.danger_level)}`}>
                    {selectedSpecies.danger_icon || '🔴'} {selectedSpecies.danger_level}
                  </span>
                )}
                {selectedSpecies.isBeneficial && (
                  <span className="modal-beneficial">
                    ✅ نيماتودا مفيدة - مكافحة بيولوجية
                  </span>
                )}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* تبويبات داخلية */}
              <div className="modal-tabs">
                <button
                  className={`modal-tab ${activeSpeciesTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveSpeciesTab('overview')}
                >
                  📋 نظرة عامة
                </button>
                
                {!selectedSpecies.isBeneficial && (
                  <>
                    <button
                      className={`modal-tab ${activeSpeciesTab === 'lifecycle' ? 'active' : ''}`}
                      onClick={() => setActiveSpeciesTab('lifecycle')}
                    >
                      🔄 دورة الحياة
                    </button>
                    <button
                      className={`modal-tab ${activeSpeciesTab === 'symptoms' ? 'active' : ''}`}
                      onClick={() => setActiveSpeciesTab('symptoms')}
                    >
                      🔍 الأعراض
                    </button>
                    <button
                      className={`modal-tab ${activeSpeciesTab === 'management' ? 'active' : ''}`}
                      onClick={() => setActiveSpeciesTab('management')}
                    >
                      💊 المكافحة
                    </button>
                  </>
                )}
                
                {selectedSpecies.isBeneficial && (
                  <>
                    <button
                      className={`modal-tab ${activeSpeciesTab === 'howitworks' ? 'active' : ''}`}
                      onClick={() => setActiveSpeciesTab('howitworks')}
                    >
                      ⚙️ آلية العمل
                    </button>
                    <button
                      className={`modal-tab ${activeSpeciesTab === 'application' ? 'active' : ''}`}
                      onClick={() => setActiveSpeciesTab('application')}
                    >
                      💧 طريقة الاستخدام
                    </button>
                  </>
                )}
              </div>

              {/* محتوى نظرة عامة */}
              {activeSpeciesTab === 'overview' && (
                <div className="tab-content">
                  <div className="modal-section">
                    <h3>📝 الوصف</h3>
                    <p>{selectedSpecies.description_ar || selectedSpecies.how_it_works_ar || 'لا يوجد وصف متاح'}</p>
                  </div>
                  
                  {!selectedSpecies.isBeneficial && selectedSpecies.prevalence_egypt && (
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">الانتشار في مصر:</span>
                        <span className="info-value">{selectedSpecies.prevalence_egypt}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">طريقة التغذية:</span>
                        <span className="info-value">{selectedSpecies.feeding_type_ar}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">درجة الحرارة المثلى:</span>
                        <span className="info-value">{selectedSpecies.lifecycle?.optimal_temp_c}°C</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">عدد الأجيال سنوياً:</span>
                        <span className="info-value">{selectedSpecies.lifecycle?.generations_per_year}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedSpecies.isBeneficial && selectedSpecies.common_species && (
                    <div className="info-grid">
                      <div className="info-item full-width">
                        <span className="info-label">الأنواع الشائعة:</span>
                        <span className="info-value">{selectedSpecies.common_species.join('، ')}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* العوائل النباتية (للضارة) */}
                  {!selectedSpecies.isBeneficial && selectedSpecies.host_plants_ar && (
                    <div className="host-section">
                      <h3>🌱 العوائل النباتية</h3>
                      <div className="host-group">
                        <strong>شديدة الحساسية:</strong>
                        <div className="host-tags">
                          {selectedSpecies.host_plants_ar?.highly_susceptible_ar?.map((host, idx) => (
                            <span key={idx} className="host-tag">{host}</span>
                          ))}
                        </div>
                      </div>
                      {selectedSpecies.host_plants_ar?.moderately_susceptible_ar && (
                        <div className="host-group">
                          <strong>متوسطة الحساسية:</strong>
                          <div className="host-tags">
                            {selectedSpecies.host_plants_ar.moderately_susceptible_ar.map((host, idx) => (
                              <span key={idx} className="host-tag medium">{host}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* الأهداف (للنيماتودا النافعة) */}
                  {selectedSpecies.isBeneficial && selectedSpecies.target_insects_ar && (
                    <div className="host-section">
                      <h3>🐛 الآفات المستهدفة</h3>
                      <div className="host-tags">
                        {selectedSpecies.target_insects_ar.map((insect, idx) => (
                          <span key={idx} className="host-tag beneficial">{insect}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* محتوى دورة الحياة (للضارة فقط) */}
              {activeSpeciesTab === 'lifecycle' && selectedSpecies.lifecycle && !selectedSpecies.isBeneficial && (
                <div className="tab-content">
                  <div className="lifecycle-timeline">
                    {selectedSpecies.lifecycle.stages_ar?.map((stage, idx) => (
                      <div key={idx} className="lifecycle-stage">
                        <div className="stage-header">
                          <span className="stage-icon">
                            {stage.stage.includes('بيضة') ? '🥚' : 
                             stage.stage.includes('يرقة') ? '🐛' : 
                             stage.stage.includes('عذراء') ? '🦋' : '🪰'}
                          </span>
                          <span className="stage-name">{stage.stage}</span>
                          <span className="stage-duration">{stage.duration_ar}</span>
                        </div>
                        <p className="stage-notes">{stage.notes_ar}</p>
                      </div>
                    ))}
                  </div>
                  <div className="lifecycle-summary">
                    <p><strong>مدة الدورة الكاملة:</strong> {selectedSpecies.lifecycle.total_days_at_25c}</p>
                    <p><strong>درجة الحرارة المثلى:</strong> {selectedSpecies.lifecycle.optimal_temp_c}°C</p>
                    {selectedSpecies.lifecycle.survival_years && (
                      <p><strong>البقاء في التربة:</strong> {selectedSpecies.lifecycle.survival_years}</p>
                    )}
                  </div>
                </div>
              )}

              {/* محتوى الأعراض (للضارة فقط) */}
              {activeSpeciesTab === 'symptoms' && selectedSpecies.symptoms && !selectedSpecies.isBeneficial && (
                <div className="tab-content">
                  <div className="symptoms-section modal-section">
                    <div className="symptom-group underground">
                      <h3>🌿 الأعراض تحت الأرض</h3>
                      <ul>
                        {selectedSpecies.symptoms?.underground_ar?.map((sym, idx) => (
                          <li key={idx}>{sym}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="symptom-group aboveground">
                      <h3>🍃 الأعراض فوق الأرض</h3>
                      <ul>
                        {selectedSpecies.symptoms?.aboveground_ar?.map((sym, idx) => (
                          <li key={idx}>{sym}</li>
                        ))}
                      </ul>
                    </div>
                    {selectedSpecies.symptoms?.confusion_with_ar && (
                      <div className="confusion-box">
                        <h3>⚠️ يتشابه مع</h3>
                        <ul>
                          {selectedSpecies.symptoms.confusion_with_ar.map((conf, idx) => (
                            <li key={idx}>{conf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* محتوى المكافحة (للضارة فقط) */}
              {activeSpeciesTab === 'management' && selectedSpecies.management && !selectedSpecies.isBeneficial && (
                <div className="tab-content">
                  <div className="management-section modal-section">
                    {selectedSpecies.management.cultural_ar && (
                      <div className="management-group">
                        <h3>🌾 المكافحة الزراعية</h3>
                        {selectedSpecies.management.cultural_ar.map((method, idx) => (
                          <div key={idx} className="method-card">
                            <span className="method-name">{method.method_ar}</span>
                            <p className="method-details">{method.details_ar}</p>
                            <span className={`method-effectiveness ${method.effectiveness === 'عالية' ? 'high' : method.effectiveness === 'متوسطة' ? 'medium' : 'low'}`}>
                              الفعالية: {method.effectiveness}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSpecies.management.biological_ar && (
                      <div className="management-group">
                        <h3>🐞 المكافحة الحيوية</h3>
                        {selectedSpecies.management.biological_ar.map((bio, idx) => (
                          <div key={idx} className="method-card">
                            <span className="method-name">{bio.agent_ar}</span>
                            <p className="method-details">{bio.details_ar}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSpecies.management.chemical_ar && (
                      <div className="management-group">
                        <h3>🧪 المكافحة الكيميائية</h3>
                        {selectedSpecies.management.chemical_ar.map((chem, idx) => (
                          <div key={idx} className="method-card chemical">
                            <span className="method-name">{chem.active_ingredient_ar}</span>
                            <p className="method-details">الجرعة: {chem.dose_ar}</p>
                            <p className="method-details">طريقة الاستخدام: {chem.method_ar}</p>
                            {chem.preharvest_interval_days && (
                              <p className="method-details">فترة الأمان: {chem.preharvest_interval_days} يوم</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* محتوى آلية العمل (للنيماتودا النافعة) */}
              {activeSpeciesTab === 'howitworks' && selectedSpecies.isBeneficial && (
                <div className="tab-content">
                  <div className="modal-section">
                    <h3>⚙️ آلية العمل</h3>
                    <p>{selectedSpecies.how_it_works_ar}</p>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">الأنواع الشائعة:</span>
                      <span className="info-value">{selectedSpecies.common_species?.join('، ')}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">السلامة:</span>
                      <span className="info-value">{selectedSpecies.safety_ar}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى طريقة الاستخدام (للنيماتودا النافعة) */}
              {activeSpeciesTab === 'application' && selectedSpecies.isBeneficial && (
                <div className="tab-content">
                  <div className="modal-section">
                    <h3>💧 طريقة الاستخدام</h3>
                    <p>{selectedSpecies.application_ar}</p>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">التوفر في مصر:</span>
                      <span className="info-value">{selectedSpecies.availability_ar}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الآفات المستهدفة:</span>
                      <span className="info-value">{selectedSpecies.target_insects_ar?.join('، ')}</span>
                    </div>
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

export default NematodaPage;