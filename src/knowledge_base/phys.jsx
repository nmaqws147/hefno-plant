// components/knowledge/FungalDiseasesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import phys from '../disease-folder/pysh.json';
import './phys.css';

const FungalDiseasesPage = () => {
  const navigate = useNavigate();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // استيراد الأمراض الفطرية من ملف البيانات
  const fungalDiseases = phys || [];

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
      case 'شديدة جداً':
      case 'very high':
        return 'severity-very-high';
      case 'عالية':
      case 'high':
        return 'severity-high';
      case 'متوسطة':
      case 'moderate':
        return 'severity-moderate';
      case 'خفيفة':
      case 'low':
        return 'severity-low';
      default:
        return 'severity-moderate';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'شديدة جداً':
      case 'very high':
        return 'شديد جداً';
      case 'عالية':
      case 'high':
        return 'شديد';
      case 'متوسطة':
      case 'moderate':
        return 'متوسط';
      case 'خفيفة':
      case 'low':
        return 'خفيف';
      default:
        return 'متوسط';
    }
  };

  return (
    <div className="fungal-diseases-page  " dir="rtl">
      {/* خلفية زخرفية */}
      <div className="fungal-bg">
        <div className="bg-glow-purple-pink"></div>
        <div className="bg-particles"></div>
        <div className="bg-fungal-shapes"></div>
      </div>

      {/* رأس الصفحة */}
     <div className="physiological-header special-page-header" style={{marginBottom:"20px"}}>
        <button className="back-button" onClick={() => navigate('/knowledge-base/diseases')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🌡️</span> {/* أيقونة تعبر عن الظروف البيئية أو ميزان حرارة */}
          </div>
          <div className="header-text">
            <h1>الأمراض الفسيولوجية</h1>
            <p className="header-en">Physiological Disorders</p>
            <p className="header-description">
              اضطرابات غير معدية ناتجة عن خلل في العوامل البيئية مثل نقص العناصر الغذائية، الإجهاد الحراري، أو مشاكل الري.
              تؤثر هذه الأمراض على نمو النبات وإنتاجيته دون وجود مسبب مرضي حي (فطر أو بكتيريا).
            </p>
            <div className="stats-badge">
              <span className="stat-badge">📊 {fungalDiseases.length} اضطراب فسيولوجي</span>
              <span className="stat-badge">🌱 Nutrient Deficiency • Heat Stress • Salinity • Water Logging</span>
            </div>
          </div>
        </div>
      </div>

      {/* شبكة الأمراض */}
      <div className="diseases-grid">
        {fungalDiseases.map((disease) => (
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
              <p className="scientific-name">{disease.scientificName || disease.cause_ar || 'مرض غير محدد'}</p>

              {/* المسبب */}
              {disease.cause_ar && !disease.scientificName && (
                <div className="cause-tag">
                  <span className="cause-icon">🔬</span>
                  <span className="cause-text">{disease.cause_ar}</span>
                </div>
              )}

              {/* نوع المرض */}
              <div className="disease-type">
                <span className="type-icon">📍</span>
                <span className="type-text">{disease.type || 'مرض فسيولوجي'}</span>
              </div>

              {/* الوصف المختصر */}
          <p className="disease-description">
            {disease.fullDescription?.substring(0, 130) || 
              `اضطراب فسيولوجي ناتج عن عوامل بيئية يصيب ${disease.hostPlants?.slice(0, 3).join(', ') || 'النباتات'}، ويؤثر على جودة ونمو المحصول.`
            }...
          </p>

              {/* الأعراض (أول عرضين) */}
              <div className="symptoms-preview">
                <div className="symptoms-title">
                  <span>🔍</span> الأعراض الرئيسية
                </div>
                <ul className="symptoms-list">
                  {disease.symptoms?.slice(0, 2).map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                  {disease.symptoms && disease.symptoms.length > 2 && (
                    <li className="more-symptoms">+{disease.symptoms.length - 2} أعراض أخرى</li>
                  )}
                </ul>
              </div>

              {/* إحصائيات سريعة */}
              <div className="card-stats-row">
                <div className="stat-chip">
                  <span>🌱</span> <strong>{disease.hostPlants?.slice(0, 3).join(', ') || 'متعدد العوائل'}</strong>
                </div>
                <div className="stat-chip">
                  <span>📅</span> <strong>{disease.season || 'طوال الموسم'}</strong>
                </div>
              </div>

              {/* تذييل البطاقة */}
              <div className="card-footer">
                <div className="effectiveness">
                  <span>⭐</span> فعالية: {disease.effectiveness || '70–85%'}
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
        {/* تأكد من تغيير اسم المتغير ليكون معبراً عن الفسيولوجية */}
        <span className="stat-number-footer">{fungalDiseases.length}</span>
        <span className="stat-label-footer">اضطراب فسيولوجي</span>
      </div>
      
      <div className="stat-divider-footer"></div>
      
      <div className="stat-card-footer">
        <span className="stat-number-footer">12+</span>
        <span className="stat-label-footer">عامل بيئي</span>
      </div>
      
      <div className="stat-divider-footer"></div>
      
      <div className="stat-card-footer">
        <span className="stat-number-footer">🌡️</span>
        <span className="stat-label-footer">إجهاد حراري وغذائي</span>
      </div>
    </div>

      {/* Modal لعرض تفاصيل المرض */}
      {showModal && selectedDisease && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="disease-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🍄</span>
              </div>
              <div className="modal-title">
                <h2>{selectedDisease.name_ar}</h2>
                <p className="modal-scientific">
                  {selectedDisease.scientificName || selectedDisease.cause_ar || 'فطر غير محدد'}
                </p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* معلومات أساسية */}
              <div className="modal-info-grid">
                {selectedDisease.scientificName && (
                  <div className="info-item">
                    <span className="info-label">الاسم العلمي:</span>
                    <span className="info-value">{selectedDisease.scientificName}</span>
                  </div>
                )}
                {selectedDisease.cause_ar && !selectedDisease.scientificName && (
                  <div className="info-item">
                    <span className="info-label">المسبب:</span>
                    <span className="info-value">{selectedDisease.cause_ar}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">شدة الإصابة:</span>
                  <span className={`severity-badge ${getSeverityClass(selectedDisease.severity)}`}>
                    {getSeverityText(selectedDisease.severity)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">نوع المرض:</span>
                  <span className="info-value">{selectedDisease.type || 'مرض فطري'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">الأجزاء المصابة:</span>
                  <span className="info-value">{selectedDisease.affectedParts?.join('، ') || 'أوراق وثمار'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">العوائل:</span>
                  <span className="info-value">{selectedDisease.hostPlants?.join('، ') || '-'}</span>
                </div>
              </div>

              {/* وصف كامل */}
              {selectedDisease.fullDescription && (
                <div className="modal-section">
                  <h3>📝 الوصف الكامل</h3>
                  <p>{selectedDisease.fullDescription}</p>
                </div>
              )}

              {/* الأعراض */}
              {selectedDisease.symptoms && (
                <div className="modal-section">
                  <h3>🔍 الأعراض</h3>
                  <ul className="modal-list">
                    {selectedDisease.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* التشخيص */}
              {selectedDisease.diagnosis && (
                <div className="modal-section">
                  <h3>🩺 التشخيص</h3>
                  <p>{selectedDisease.diagnosis}</p>
                </div>
              )}

              {/* العتبة الاقتصادية */}
              {selectedDisease.economicThreshold && (
                <div className="modal-section">
                  <h3>📊 العتبة الاقتصادية</h3>
                  <p>{selectedDisease.economicThreshold}</p>
                </div>
              )}

              {/* العلاقة مع أمراض أخرى */}
              {selectedDisease.interactionWithDisease && (
                <div className="modal-section">
                  <h3>🔄 التفاعل مع أمراض أخرى</h3>
                  <p>{selectedDisease.interactionWithDisease}</p>
                </div>
              )}

              {/* المكافحة */}
              {selectedDisease.correction && (
                <div className="modal-section">
                  <h3>💊 المكافحة والعلاج</h3>
                  
                  {selectedDisease.correction.immediate && (
                    <div className="sub-section">
                      <h4>⚡ إجراءات فورية</h4>
                      <ul className="modal-list">
                        {selectedDisease.correction.immediate.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDisease.correction.soil && (
                    <div className="sub-section">
                      <h4>🌱 إجراءات تربة</h4>
                      <ul className="modal-list">
                        {selectedDisease.correction.soil.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDisease.correction.prevention && (
                    <div className="sub-section">
                      <h4>🛡️ الوقاية</h4>
                      <p>{selectedDisease.correction.prevention}</p>
                    </div>
                  )}
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="modal-info-footer">
                <div className="footer-item">
                  <span>⭐ الفعالية:</span>
                  <strong>{selectedDisease.effectiveness || '70–85%'}</strong>
                </div>
                <div className="footer-item">
                  <span>📅 الموسم:</span>
                  <strong>{selectedDisease.season || 'طوال العام'}</strong>
                </div>
                {selectedDisease.resistanceRisk && (
                  <div className="footer-item">
                    <span>🛡️ خطر المقاومة:</span>
                    <strong>{selectedDisease.resistanceRisk}</strong>
                  </div>
                )}
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

export default FungalDiseasesPage;