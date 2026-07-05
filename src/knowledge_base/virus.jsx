// components/knowledge/VirusesDiseasesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import viruses from '../disease-folder/viruses.json';
import './virus.css';

const VirusesDiseasesPage = () => {
  const navigate = useNavigate();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const virusesDiseases = viruses || [];


  const handleDiseaseClick = (disease) => {
    setSelectedDisease(disease);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDisease(null);
  };

  // دالة لتحديد كلاس شدة المرض
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'moderate': return 'severity-moderate';
      case 'low': return 'severity-low';
      default: return 'severity-moderate';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'شديد';
      case 'moderate': return 'متوسط';
      case 'low': return 'خفيف';
      default: return 'متوسط';
    }
  };

  return (
    <div className="viruses-diseases-page  " dir="rtl">
      {/* خلفية زخرفية */}
      <div className="viruses-bg">
        <div className="bg-glow-purple"></div>
        <div className="bg-particles"></div>
        <div className="bg-virus-shapes"></div>
      </div>

      {/* رأس الصفحة */}
      <div className="viruses-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base/diseases')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🧬</span>
          </div>
          <div className="header-text">
            <h1>الأمراض الفيروسية</h1>
            <p className="header-en">Viral Diseases</p>
            <p className="header-description">
              الفيروسات النباتية كائنات دقيقة تحت مجهرية، تتكون من حمض نووي محاط بغلاف بروتيني. تنتقل بالحشرات الناقلة والتلامس الميكانيكي، ولا علاج للنبات المصاب.
            </p>
            <div className="stats-badge">
              <span className="stat-badge">📊 {virusesDiseases.length} مرض فيروسي</span>
              <span className="stat-badge">🦟 المن • التربس • الحشرات البيضاء</span>
            </div>
          </div>
        </div>
      </div>

      {/* شبكة الأمراض */}
      <div className="diseases-grid">
        {virusesDiseases.map((disease) => (
          <div
            key={disease.id}
            className="disease-card"
            onClick={() => handleDiseaseClick(disease)}
          >
            <div className="card-glass"></div>
            
            <div className="card-content">
              {/* رأس البطاقة */}
              <div className="card-header">
                <span className={`severity-badge ${getSeverityClass(disease.severity)}`}>
                  {getSeverityText(disease.severity)}
                </span>
              </div>

              {/* عنوان المرض */}
              <h3 className="disease-name">{disease.name_ar}</h3>
              <p className="scientific-name">{disease.scientificName}</p>

              {/* العائلة */}
              <div className="family-tag">
                {disease.family_ar}
              </div>

              {/* نوع المرض */}
              <div className="disease-type">
                <span className="type-icon">📍</span>
                <span className="type-text">{disease.type}</span>
              </div>

              {/* الوصف المختصر */}
              <p className="disease-description">
                {disease.fullDescription.substring(0, 120)}...
              </p>

              {/* الأعراض (أول عرضين) */}
              <div className="symptoms-preview">
                <div className="symptoms-title">
                  <span>🔍</span> الأعراض الرئيسية
                </div>
                <ul className="symptoms-list">
                  {disease.symptoms.slice(0, 2).map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                  {disease.symptoms.length > 2 && (
                    <li className="more-symptoms">+{disease.symptoms.length - 2} أعراض أخرى</li>
                  )}
                </ul>
              </div>

              {/* إحصائيات سريعة */}
              <div className="card-stats-row">
                <div className="stat-chip">
                  <span>🌱</span> <strong>{disease.hostPlants?.slice(0, 2).join(', ') || 'متعدد العوائل'}</strong>
                </div>
                <div className="stat-chip">
                  <span>📅</span> <strong>{disease.season || 'طوال الموسم'}</strong>
                </div>
              </div>

              {/* تذييل البطاقة */}
              <div className="card-footer">
                <div className="effectiveness">
                  <span>⭐</span> فعالية: {disease.effectiveness || 'متوسطة'}
                </div>
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

      {/* إحصائيات سريعة أسفل الصفحة */}
      <div className="diseases-stats-footer">
        <div className="stat-card-footer">
          <span className="stat-number-footer">{virusesDiseases.length}</span>
          <span className="stat-label-footer">مرض فيروسي</span>
        </div>
        <div className="stat-divider-footer"></div>
        <div className="stat-card-footer">
          <span className="stat-number-footer">20+</span>
          <span className="stat-label-footer">عائلة فيروسية</span>
        </div>
        <div className="stat-divider-footer"></div>
        <div className="stat-card-footer">
          <span className="stat-number-footer">🦟</span>
          <span className="stat-label-footer">ناقلات حشرية</span>
        </div>
      </div>

      {/* Modal لعرض تفاصيل المرض */}
      {showModal && selectedDisease && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="disease-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🧬</span>
              </div>
              <div className="modal-title">
                <h2>{selectedDisease.name_ar}</h2>
                <p className="modal-scientific">{selectedDisease.scientificName}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* معلومات أساسية */}
              <div className="modal-info-grid">
                <div className="info-item">
                  <span className="info-label">العائلة:</span>
                  <span className="info-value">{selectedDisease.family_ar}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">شدة الإصابة:</span>
                  <span className={`severity-badge ${getSeverityClass(selectedDisease.severity)}`}>
                    {getSeverityText(selectedDisease.severity)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">طريقة الانتقال:</span>
                  <span className="info-value">{selectedDisease.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">العوائل:</span>
                  <span className="info-value">{selectedDisease.hostPlants?.join('، ') || '-'}</span>
                </div>
              </div>

              {/* وصف كامل */}
              <div className="modal-section">
                <h3>📝 الوصف الكامل</h3>
                <p>{selectedDisease.fullDescription}</p>
              </div>

              {/* الأعراض */}
              <div className="modal-section">
                <h3>🔍 الأعراض</h3>
                <ul className="modal-list">
                  {selectedDisease.symptoms?.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>

              {/* دورة العدوى */}
              <div className="modal-section">
                <h3>🔄 دورة العدوى</h3>
                <p>{selectedDisease.infectionCycle}</p>
              </div>

              {/* الظروف الملائمة */}
              <div className="modal-section">
                <h3>🌡️ الظروف الملائمة</h3>
                <p>{selectedDisease.favorableConditions}</p>
              </div>

              {/* المكافحة */}
              {selectedDisease.management && (
                <div className="modal-section">
                  <h3>💊 المكافحة</h3>
                  
                  {selectedDisease.management.cultural && (
                    <div className="sub-section">
                      <h4>🌾 المكافحة الزراعية</h4>
                      <ul className="modal-list">
                        {selectedDisease.management.cultural.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDisease.management.chemical && (
                    <div className="sub-section">
                      <h4>🧪 المكافحة الكيميائية</h4>
                      <ul className="modal-list">
                        {selectedDisease.management.chemical.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDisease.management.biological && (
                    <div className="sub-section">
                      <h4>🐞 المكافحة الحيوية</h4>
                      <ul className="modal-list">
                        {selectedDisease.management.biological.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="modal-info-footer">
                <div className="footer-item">
                  <span>⭐ الفعالية:</span>
                  <strong>{selectedDisease.effectiveness || 'غير محدد'}</strong>
                </div>
                <div className="footer-item">
                  <span>📅 الموسم:</span>
                  <strong>{selectedDisease.season || 'طوال العام'}</strong>
                </div>
                <div className="footer-item">
                  <span>⚠️ العتبة الاقتصادية:</span>
                  <strong>{selectedDisease.economicThreshold || 'ظهور الأعراض'}</strong>
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

export default VirusesDiseasesPage;