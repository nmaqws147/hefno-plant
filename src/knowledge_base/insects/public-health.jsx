// components/knowledge/PublicHealthPestsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import afatData from '../../afat-folder/afat.json';
import './public-health.css';

const PublicHealthPestsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPest, setSelectedPest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    // بما أن الملف مستورد (Imported)، البيانات جاهزة فوراً ولا نحتاج لـ fetch
    try {
      setLoading(true);
      
      // نضع البيانات في الـ State
      setData(afatData);
      
      // تعيين أول مجموعة كـ Active
      if (afatData.groups && afatData.groups.length > 0) {
        setActiveGroup(afatData.groups[0].group_id);
      }
    } catch (err) {
      console.error('Error processing data:', err);
      setError('حدث خطأ في عرض البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePestClick = (pest) => {
    setSelectedPest(pest);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPest(null);
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'very high': return 'severity-very-high';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-medium';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'very high': return 'شديد جداً';
      case 'high': return 'شديد';
      case 'medium': return 'متوسط';
      case 'low': return 'خفيف';
      default: return 'متوسط';
    }
  };

  const getActiveGroupData = () => {
    if (!data?.groups) return null;
    return data.groups.find(g => g.group_id === activeGroup);
  };

  const activeGroupData = getActiveGroupData();

  if (loading) {
    return (
      <div className="public-health-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-health-page error" dir="rtl">
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
    <div className="public-health-page " dir="rtl">
      {/* رأس الصفحة */}
      <div className="public-health-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🦟</span>
          </div>
          <div className="header-text">
            <h1>{data.category_ar}</h1>
            <p className="header-en">{data.category_en}</p>
            <p className="header-description">{data.category_description}</p>
            <div className="stats-badge">
              <span className="stat-badge">🦟 {data.groups_count} مجموعات</span>
              <span className="stat-badge">🏥 آفات صحية</span>
            </div>
          </div>
        </div>
      </div>

      {/* تبويبات المجموعات */}
      <div className="groups-tabs">
        {data.groups.map((group) => (
          <button
            key={group.group_id}
            className={`tab-btn ${activeGroup === group.group_id ? 'active' : ''}`}
            onClick={() => setActiveGroup(group.group_id)}
          >
            <span className="tab-icon">
              {group.group_id === 'php-g1' ? '🦟' : 
               group.group_id === 'php-g2' ? '🐀' : 
               group.group_id === 'php-g3' ? '🪳' : 
               group.group_id === 'php-g4' ? '🐜' : '🕷️'}
            </span>
            <span className="tab-text">{group.group_ar}</span>
          </button>
        ))}
      </div>

      {/* محتوى المجموعة النشطة */}
      {activeGroupData && (
        <div className="group-content">
          <div className="group-header">
            <h2 className="group-title">{activeGroupData.group_ar}</h2>
            <p className="group-en">{activeGroupData.group_en}</p>
          </div>

          <div className="pests-grid">
            {activeGroupData.pests.map((pest) => (
              <div
                key={pest.id}
                className="pest-card"
                onClick={() => handlePestClick(pest)}
              >
                <div className="card-glass"></div>
                
                <div className="card-content">
                  <div className="card-header">
                    <span className={`severity-badge ${getSeverityClass(pest.severity)}`}>
                      {getSeverityText(pest.severity)}
                    </span>
                  </div>

                  <h3 className="pest-name">{pest.name_ar}</h3>
                  <p className="scientific-name">{pest.scientificName}</p>

                  <div className="risk-tag">
                    <span className="risk-icon">⚠️</span>
                    <span className="risk-text">{pest.healthRisk}</span>
                  </div>

                  <p className="pest-description">
                    {pest.fullDescription.substring(0, 120)}...
                  </p>

                  <div className="diseases-preview">
                    <div className="preview-title">
                      <span>🦠</span> الأمراض المنقولة
                    </div>
                    <ul className="diseases-list">
                      {pest.diseasesTransmitted.slice(0, 2).map((disease, idx) => (
                        <li key={idx}>{disease}</li>
                      ))}
                      {pest.diseasesTransmitted.length > 2 && (
                        <li className="more-diseases">+{pest.diseasesTransmitted.length - 2} أمراض أخرى</li>
                      )}
                    </ul>
                  </div>

                  <div className="card-stats">
                    <div className="stat-chip">
                      <span>📍</span> <strong>{pest.geographicDistribution?.split('،')[0] || 'منتشر'}</strong>
                    </div>
                    <div className="stat-chip">
                      <span>📅</span> <strong>{pest.peakSeason || 'طوال العام'}</strong>
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

      {/* إحصائيات سريعة */}
      <div className="public-health-stats">
        <div className="stat-card">
          <span className="stat-number">{data.groups?.length || 0}</span>
          <span className="stat-label">مجموعات</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">
            {data.groups?.reduce((sum, g) => sum + (g.pests?.length || 0), 0) || 0}
          </span>
          <span className="stat-label">آفة صحية</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">🛡️</span>
          <span className="stat-label">مكافحة متكاملة</span>
        </div>
      </div>

      {/* Modal لعرض تفاصيل الآفة */}
      {showModal && selectedPest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="pest-detail-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🦟</span>
              </div>
              <div className="modal-title">
                <h2>{selectedPest.name_ar}</h2>
                <p className="modal-scientific">{selectedPest.scientificName}</p>
                <p className="modal-family">{selectedPest.family_en}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* معلومات أساسية */}
              <div className="modal-info-grid">
                <div className="info-item">
                  <span className="info-label">الخطر الصحي:</span>
                  <span className="info-value risk-value">{selectedPest.healthRisk}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">شدة الخطر:</span>
                  <span className={`severity-badge ${getSeverityClass(selectedPest.severity)}`}>
                    {getSeverityText(selectedPest.severity)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">ذروة النشاط:</span>
                  <span className="info-value">{selectedPest.peakSeason}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">الانتشار الجغرافي:</span>
                  <span className="info-value">{selectedPest.geographicDistribution}</span>
                </div>
              </div>

              {/* وصف كامل */}
              <div className="modal-section">
                <h3>📝 الوصف الكامل</h3>
                <p>{selectedPest.fullDescription}</p>
              </div>

              {/* الأعراض على الإنسان */}
              <div className="modal-section">
                <h3>🤒 الأعراض على الإنسان</h3>
                <ul className="modal-list">
                  {selectedPest.symptoms_on_human?.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>

              {/* الأمراض المنقولة */}
              <div className="modal-section">
                <h3>🦠 الأمراض المنقولة</h3>
                <div className="diseases-grid">
                  {selectedPest.diseasesTransmitted?.map((disease, idx) => (
                    <span key={idx} className="disease-badge">{disease}</span>
                  ))}
                </div>
              </div>

              {/* دورة الحياة */}
              {selectedPest.lifeCycle && (
                <div className="modal-section">
                  <h3>🔄 دورة الحياة</h3>
                  <div className="lifecycle-grid">
                    {Object.entries(selectedPest.lifeCycle).map(([stage, description]) => (
                      <div key={stage} className="lifecycle-item">
                        <span className="lifecycle-stage">
                          {stage === 'egg' ? '🥚 بيضة' : 
                           stage === 'larva' ? '🐛 يرقة' : 
                           stage === 'pupa' ? '🦋 عذراء' : '🪰 بالغة'}
                        </span>
                        <span className="lifecycle-desc">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أماكن التكاثر */}
              {selectedPest.breedingSites && (
                <div className="modal-section">
                  <h3>🏠 أماكن التكاثر</h3>
                  <ul className="modal-list">
                    {selectedPest.breedingSites.map((site, idx) => (
                      <li key={idx}>{site}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* المكافحة */}
              {selectedPest.management && (
                <div className="modal-section">
                  <h3>💊 المكافحة</h3>
                  
                  {selectedPest.management.environmental && (
                    <div className="sub-section">
                      <h4>🌍 المكافحة البيئية</h4>
                      <ul className="modal-list">
                        {selectedPest.management.environmental.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPest.management.biological && (
                    <div className="sub-section">
                      <h4>🐞 المكافحة الحيوية</h4>
                      <ul className="modal-list">
                        {selectedPest.management.biological.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPest.management.chemical && (
                    <div className="sub-section">
                      <h4>🧪 المكافحة الكيميائية</h4>
                      <ul className="modal-list">
                        {selectedPest.management.chemical.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* الوقاية الشخصية */}
              {selectedPest.personalProtection && (
                <div className="modal-section">
                  <h3>🛡️ الوقاية الشخصية</h3>
                  <ul className="modal-list">
                    {selectedPest.personalProtection.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="modal-info-footer">
                {selectedPest.resistanceRisk && (
                  <div className="footer-item">
                    <span>⚠️ خطر المقاومة:</span>
                    <strong>{selectedPest.resistanceRisk}</strong>
                  </div>
                )}
                <div className="footer-item">
                  <span>📅 موسم الذروة:</span>
                  <strong>{selectedPest.peakSeason}</strong>
                </div>
              </div>
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

export default PublicHealthPestsPage;