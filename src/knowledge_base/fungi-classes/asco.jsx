// components/knowledge/OomycotaDiseasesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from '../../component/advancedSearch';
import pathogensData from '../../disease-folder/fungi.json';
import './oomy.css';

const AscomycotaDiseasesPage = () => {
  const navigate = useNavigate();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms'); // إضافة الـ State المفقودة للـ Tabs
  const [filteredDiseases, setFilteredDiseases] = useState([]); // حالة للنتائج المفلترة
  // استيراد أمراض الفطريات البيضية
  const diseases = pathogensData.asco || [];
  
  const searchFilters = [
  {
    key: 'severity',
    label: 'شدة المرض',
    options: [
      { value: 'very high', label: 'شديد جداً' },
      { value: 'high', label: 'شديد' },
      { value: 'moderate', label: 'متوسط' },
      { value: 'low', label: 'خفيف' }
    ]
  },
  {
    key: 'type',
    label: 'نوع المرض',
    options: [
      { value: 'مرض تربة', label: 'مرض تربة' }
      // أضف الأنواع المتوفرة في بياناتك
    ]
  },
  {
    key: 'season',
    label: 'الموسم',
    options: [
      { value: 'شتوي', label: 'شتوي' },
      { value: 'صيفي', label: 'صيفي' },
      { value: 'ربيعي', label: 'ربيعي' }
    ]
  }
];

  // دالة لاستقبال النتائج من البحث
  const handleSearchResults = (results) => {
    setFilteredDiseases(results);
  };

  // استخدم filteredDiseases إذا وجدت، وإلا استخدم diseases كلها
  const displayDiseases = filteredDiseases.length > 0 ? filteredDiseases : diseases;


  const handleDiseaseClick = (disease) => {
    setSelectedDisease(disease);
    setShowModal(true);
    setActiveTab('symptoms'); // إعادة ضبط التاب عند فتح كل مرض جديد
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDisease(null);
  };

  // دالة لتحديد كلاس شدة المرض
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'عالية جداً':
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
      case 'عالية جداً':
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
    <div className="oomycota-diseases-page   " dir="rtl">

      {/* رأس الصفحة */}
      <div className="oomycota-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base/diseases/fungi')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>💧</span>
          </div>
            <div className="header-text">
            <h1>الفطريات الأسكية</h1>
            <p className="header-en">Ascomycota (Sac Fungi)</p>
            <p className="header-description">
                أكبر شعبة في مملكة الفطريات، وتضم مسببات أمراض اقتصادية مدمرة. 
                تتميز بتكوين أبواغ داخل أكياس (Asci)، وتشمل أمراض البياض الدقيقي، اللفحات، والذبول الفيوزاريومي، وبعضها ينتج سموماً فطرية خطيرة.
            </p>
            <div className="stats-badge">
                <span className="stat-badge">📊 {diseases.length} مرض</span>
                <span className="stat-badge">🍂 Fusarium • Botrytis • Alternaria</span>
                <span className="stat-badge">🎒 أبواغ كيسية (Ascospores)</span>
            </div>
            </div>
        </div>
      </div>

                 <div className="search-section">
        <AdvancedSearch
          data={diseases}
          searchFields={['name_ar', 'scientificName', 'family_ar', 'type']}
          onResults={handleSearchResults}
          placeholder="ابحث عن مرض... (مثال: تعفن ساق الشتلات)"
          showFilters={true}
          filters={searchFilters}
          debounceTime={300}
        />
      </div>

         {/* عرض عدد النتائج */}
      <div className="results-count">
        <span>🦠 عرض {displayDiseases.length} من {diseases.length} مرض</span>
      </div>

      {/* شبكة الأمراض */}
      <div className="diseases-grid">
        {displayDiseases.map((disease) => (
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

              {/* المسبب */}
              <div className="cause-tag">
                <span className="cause-icon">🔬</span>
                <span className="cause-text">{disease.cause_ar}</span>
              </div>

              {/* نوع المرض */}
              <div className="disease-type">
                <span className="type-icon">📍</span>
                <span className="type-text">{disease.type}</span>
              </div>

              {/* الوصف المختصر */}
              <p className="disease-description">
                {disease.fullDescription.substring(0, 130)}...
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
                  <span>🌱</span> <strong>{disease.hostPlants.slice(0, 3).join(', ')}</strong>
                </div>
                <div className="stat-chip">
                  <span>📅</span> <strong>{disease.season || 'طوال الموسم'}</strong>
                </div>
              </div>

              {/* الأعداء الطبيعية */}
              {disease.naturalEnemies && (
                <div className="natural-enemies">
                  <span className="enemies-icon">🐞</span>
                  <span className="enemies-text">
                    {disease.naturalEnemies.slice(0, 2).join(', ')}
                    {disease.naturalEnemies.length > 2 && ` +${disease.naturalEnemies.length - 2}`}
                  </span>
                </div>
              )}

              {/* تذييل البطاقة */}
              <div className="card-footer">
                <div className="effectiveness">
                  <span>⭐</span> فعالية: 75–90%
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

            {/* عرض رسالة عدم وجود نتائج */}
{displayDiseases.length === 0 && (
  <div className="no-results">
    <div className="no-results-icon">🔍</div>
    <h3>لا توجد نتائج مطابقة</h3>
    <p>لم نتمكن من العثور على أمراض تطابق معايير البحث</p>
  </div>
)}

      {/* إحصائيات سريعة أسفل الصفحة */}
      <div className="diseases-stats-footer">
        <div className="stat-card-footer">
          <span className="stat-number-footer">{diseases.length}</span>
          <span className="stat-label-footer">مرض فطري بيضي</span>
        </div>
        <div className="stat-divider-footer"></div>
        <div className="stat-card-footer">
          <span className="stat-number-footer">💧</span>
          <span className="stat-label-footer">جراثيم سباحة</span>
        </div>
        <div className="stat-divider-footer"></div>
        <div className="stat-card-footer">
          <span className="stat-number-footer">🌊</span>
          <span className="stat-label-footer">تنتشر بالماء</span>
        </div>
      </div>

     {/* Modal لعرض تفاصيل المرض */}
      {showModal && selectedDisease && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="disease-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>💧</span>
              </div>
              <div className="modal-title">
                <h2>{selectedDisease.name_ar}</h2>
                <p className="modal-scientific">{selectedDisease.scientificName}</p>
                <p className="modal-family">{selectedDisease.family_ar} | {selectedDisease.family_en}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'symptoms' ? 'active' : ''}`}
                onClick={() => setActiveTab('symptoms')}
              >
                🔍 الأعراض والتشخيص
              </button>
              <button 
                className={`tab-btn ${activeTab === 'management' ? 'active' : ''}`}
                onClick={() => setActiveTab('management')}
              >
                💊 المكافحة والعلاج
              </button>
              <button 
                className={`tab-btn ${activeTab === 'biology' ? 'active' : ''}`}
                onClick={() => setActiveTab('biology')}
              >
                🧬 دورة الحياة والظروف
              </button>
            </div>

            <div className="modal-body">
              {/* Tab 1: Symptoms & Diagnosis */}
              {activeTab === 'symptoms' && (
                <>
                  {/* وصف كامل */}
                  <div className="modal-section">
                    <h3>📝 الوصف الكامل</h3>
                    <p>{selectedDisease.fullDescription}</p>
                  </div>

                  {/* الأعراض */}
                  <div className="modal-section">
                    <h3>🔍 الأعراض</h3>
                    <ul className="modal-list">
                      {selectedDisease.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  {/* العتبة الاقتصادية */}
                  <div className="modal-section">
                    <h3>📊 العتبة الاقتصادية</h3>
                    <p className="threshold-warning">{selectedDisease.economicThreshold}</p>
                  </div>

                  {/* العوائل */}
                  <div className="modal-section">
                    <h3>🌱 العوائل المصابة</h3>
                    <div className="hosts-grid">
                      {selectedDisease.hostPlants.map((host, idx) => (
                        <span key={idx} className="host-badge">{host}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Management & Treatment */}
              {activeTab === 'management' && (
                <>
                  {/* المكافحة */}
                  {selectedDisease.management && (
                    <>
                      {/* المكافحة الزراعية */}
                      {selectedDisease.management.cultural && (
                        <div className="modal-section">
                          <h3>🌾 المكافحة الزراعية</h3>
                          <ul className="modal-list">
                            {selectedDisease.management.cultural.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* المكافحة الحيوية */}
                      {selectedDisease.management.biological && (
                        <div className="modal-section">
                          <h3>🐞 المكافحة الحيوية</h3>
                          <ul className="modal-list">
                            {selectedDisease.management.biological.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* المكافحة الكيماوية */}
                      {selectedDisease.management.chemical && (
                        <div className="modal-section">
                          <h3>💊 المكافحة الكيماوية</h3>
                          <ul className="modal-list chemical-list">
                            {selectedDisease.management.chemical.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* الأعداء الطبيعية */}
                  {selectedDisease.naturalEnemies && selectedDisease.naturalEnemies.length > 0 && (
                    <div className="modal-section">
                      <h3>🐞 الأعداء الطبيعية</h3>
                      <div className="enemies-grid">
                        {selectedDisease.naturalEnemies.map((enemy, idx) => (
                          <span key={idx} className="enemy-badge">{enemy}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ملاحظات الوقاية */}
                  {selectedDisease.prevention_notes && (
                    <div className="modal-section prevention-note">
                      <h3>🛡️ ملاحظات الوقاية</h3>
                      <p className="prevention-text">{selectedDisease.prevention_notes}</p>
                    </div>
                  )}

                  {/* مقاومة المبيدات */}
                  {selectedDisease.resistanceRisk && (
                    <div className="modal-section">
                      <h3>⚠️ مقاومة المبيدات</h3>
                      <p>{selectedDisease.resistanceRisk}</p>
                    </div>
                  )}
                </>
              )}

              {/* Tab 3: Biology & Conditions */}
              {activeTab === 'biology' && (
                <>
                  {/* دورة الإصابة */}
                  <div className="modal-section">
                    <h3>🔄 دورة الإصابة</h3>
                    <p>{selectedDisease.infectionCycle}</p>
                  </div>

                  {/* الظروف الملائمة */}
                  <div className="modal-section">
                    <h3>🌡️ الظروف الملائمة للإصابة</h3>
                    <p>{selectedDisease.favorableConditions}</p>
                  </div>

                  {/* معلومات إضافية */}
                  <div className="modal-info-grid">
                    <div className="info-item">
                      <span className="info-label">نوع المرض:</span>
                      <span className="info-value">{selectedDisease.type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">شدة الإصابة:</span>
                      <span className={`severity-badge ${getSeverityClass(selectedDisease.severity)}`}>
                        {getSeverityText(selectedDisease.severity)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الموسم:</span>
                      <span className="info-value">{selectedDisease.season || 'طوال العام'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الفعالية:</span>
                      <span className="info-value">{selectedDisease.effectiveness}</span>
                    </div>
                  </div>
                </>
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

export default AscomycotaDiseasesPage;