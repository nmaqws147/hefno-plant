// components/knowledge/insects/InsectOrderPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './insects-page.css';

const InsectOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsect, setSelectedInsect] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const data = await import(`../knowledge_base/insects/insects-folder/data.json`);
        const allData = data.default;
        const selectedOrder = allData[orderId];
        
        if (selectedOrder) {
          setOrder({
            id: orderId,
            ...selectedOrder
          });
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات الرتبة:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  // فلترة الآفات
  const filteredInsects = order?.pathogens?.filter(insect => {
    const matchesSearch = searchTerm === '' || 
      insect.name_ar.includes(searchTerm) || 
      insect.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || insect.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  }) || [];

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'very high': return 'severity-critical';
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

  const getOrderIcon = (orderId) => {
    const icons = {
      Lepidoptera: '🦋',
      Coleoptera: '🐞',
      Hemiptera: '🦟',
      Thysanoptera: '🐜',
      Orthoptera: '🦗'
    };
    return icons[orderId] || '🐛';
  };

  if (loading) {
    return (
      <div className="insects-page" dir="rtl">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="insects-page" dir="rtl">
        <div className="error-container glass">
          <div className="error-icon">⚠️</div>
          <h2>الرتبة غير موجودة</h2>
          <p>عذراً، لم نتمكن من العثور على الرتبة المطلوبة</p>
          <button className="back-home-btn" onClick={() => navigate('/knowledge-base/insects')}>
            العودة إلى قائمة الرتب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="insects-page   " dir="rtl">

      {/* رأس الصفحة */}
      <div className="insects-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base/insects')}>
          <span>←</span> العودة إلى الرتب
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>{getOrderIcon(order.id)}</span>
          </div>
          <div className="header-text">
            <h1>{order.order_ar}</h1>
            <p className="order-en">{order.order_en}</p>
            <p className="order-description-full">{order.order_description}</p>
            <div className="stats-badge">
              <span className="stat">🐛 {order.pathogens_count || order.pathogens?.length || 0} نوع حشري</span>
              <span className="stat">🏠 {order.families_count || 'متعدد'} عائلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="search-filters-section glass">
        <div className="search-wrapper">
          <span className="search-icon" style={{right:50,width:"fit-content"}}>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن آفة... (مثال: دودة القطن)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
        
        <div className="filter-wrapper">
          <select 
            className="filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">كل الآفات</option>
            <option value="very high">شديد جداً</option>
            <option value="high">شديد</option>
            <option value="medium">متوسط</option>
            <option value="low">خفيف</option>
          </select>
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="results-count">
        <span>🦗 عرض {filteredInsects.length} من {order.pathogens?.length || 0} آفة</span>
      </div>

      {/* شبكة الآفات - CARDS */}
      <div className="insects-grid">
        {filteredInsects.map((insect) => (
          <div
            key={insect.id}
            className="insect-card glass"
            onClick={() => {
              setSelectedInsect(insect);
              setShowModal(true);
            }}
          >
            <div className="card-glow"></div>
            
            <div className="card-content">
              {/* رأس البطاقة */}
              <div className="card-header">
                <div className="insect-info">
                  <h3>{insect.name_ar}</h3>
                  <p className="scientific-name">{insect.scientificName}</p>
                  <p className="family-name">
                    <span className="family-icon">🏛️</span>
                    {insect.family_ar}
                  </p>
                </div>
                <span className={`severity-badge ${getSeverityClass(insect.severity)}`}>
                  {getSeverityText(insect.severity)}
                </span>
              </div>

              {/* نوع الآفة */}
              <div className="insect-type">
                <span className="type-icon">📍</span>
                <span>{insect.type}</span>
              </div>

              {/* وصف مختصر */}
              <p className="insect-description">
                {insect.fullDescription.substring(0, 100)}...
              </p>

              {/* الأعراض الرئيسية */}
              <div className="symptoms-preview">
                <div className="symptoms-title">
                  <span>🔍</span> الأعراض الرئيسية
                </div>
                <ul className="symptoms-list">
                  {insect.symptoms?.slice(0, 2).map((symptom, idx) => (
                    <li key={idx}>
                      <span className="symptom-bullet">•</span>
                      {symptom.length > 50 ? symptom.substring(0, 50) + '...' : symptom}
                    </li>
                  ))}
                  {insect.symptoms?.length > 2 && (
                    <li className="more-symptoms">+{insect.symptoms.length - 2} أعراض أخرى</li>
                  )}
                </ul>
              </div>

              {/* إحصائيات سريعة */}
              <div className="card-stats-row">
                <div className="stat-chip">
                  <span>🌱</span>
                  <span className="stat-chip-text">
                    {insect.hostPlants?.slice(0, 3).join(', ')}
                    {insect.hostPlants?.length > 3 && ` +${insect.hostPlants.length - 3}`}
                  </span>
                </div>
                <div className="stat-chip">
                  <span>📅</span>
                  <span className="stat-chip-text">{insect.season || 'طوال الموسم'}</span>
                </div>
              </div>

              {/* الأعداء الطبيعية */}
              {insect.naturalEnemies && insect.naturalEnemies.length > 0 && (
                <div className="natural-enemies">
                  <span className="enemies-icon">🐞</span>
                  <span className="enemies-text">
                    {insect.naturalEnemies.slice(0, 2).map(e => e.split(' ')[0]).join(', ')}
                    {insect.naturalEnemies.length > 2 && ` +${insect.naturalEnemies.length - 2}`}
                  </span>
                </div>
              )}

              {/* تذييل البطاقة */}
              <div className="card-footer">
                <div className="effectiveness">
                  <span>⭐</span>
                  <span>فعالية: {insect.effectiveness || 'عالية'}</span>
                </div>
                <div className="card-link">
                  عرض التفاصيل
                  <span className="link-arrow">←</span>
                </div>
              </div>
            </div>

            <div className="card-hover-effect"></div>
          </div>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredInsects.length === 0 && (
        <div className="no-results glass">
          <div className="no-results-icon">🔍</div>
          <h3>لا توجد نتائج مطابقة</h3>
          <p>لم نتمكن من العثور على آفات تطابق "{searchTerm}"</p>
          <button onClick={() => {
            setSearchTerm('');
            setSeverityFilter('all');
          }}>
            مسح البحث
          </button>
        </div>
      )}

      {/* Modal للتفاصيل - نفس الكود السابق */}
      {showModal && selectedInsect && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="insect-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🐛</div>
              <div className="modal-title">
                <h2>{selectedInsect.name_ar}</h2>
                <p>{selectedInsect.scientificName}</p>
                <p className="modal-family">{selectedInsect.family_ar} | {selectedInsect.family_en}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button className={`tab-btn ${activeTab === 'symptoms' ? 'active' : ''}`} onClick={() => setActiveTab('symptoms')}>
                🔍 الأعراض
              </button>
              <button className={`tab-btn ${activeTab === 'management' ? 'active' : ''}`} onClick={() => setActiveTab('management')}>
                💊 المكافحة
              </button>
              <button className={`tab-btn ${activeTab === 'biology' ? 'active' : ''}`} onClick={() => setActiveTab('biology')}>
                🧬 دورة الحياة
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'symptoms' && (
                <>
                  <div className="modal-section">
                    <h3>📝 الوصف الكامل</h3>
                    <p>{selectedInsect.fullDescription}</p>
                  </div>
                  <div className="modal-section">
                    <h3>🔍 الأعراض</h3>
                    <ul>
                      {selectedInsect.symptoms?.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="modal-section">
                    <h3>🌱 العوائل المصابة</h3>
                    <div className="hosts-grid">
                      {selectedInsect.hostPlants?.map((host, idx) => (
                        <span key={idx} className="host-badge">{host}</span>
                      ))}
                    </div>
                  </div>
                  <div className="modal-section">
                    <h3>📊 العتبة الاقتصادية</h3>
                    <p className="threshold-text">{selectedInsect.economicThreshold}</p>
                  </div>
                </>
              )}

              {activeTab === 'management' && (
                <>
                  {selectedInsect.management?.cultural && (
                    <div className="modal-section">
                      <h3>🌾 المكافحة الزراعية</h3>
                      <ul>
                        {selectedInsect.management.cultural.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedInsect.management?.biological && (
                    <div className="modal-section">
                      <h3>🐞 المكافحة الحيوية</h3>
                      <ul>
                        {selectedInsect.management.biological.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedInsect.management?.chemical && (
                    <div className="modal-section">
                      <h3>💊 المكافحة الكيماوية</h3>
                      <ul className="chemical-list">
                        {selectedInsect.management.chemical.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedInsect.naturalEnemies && (
                    <div className="modal-section">
                      <h3>🦋 الأعداء الطبيعية</h3>
                      <div className="enemies-grid">
                        {selectedInsect.naturalEnemies.map((enemy, idx) => (
                          <span key={idx} className="enemy-badge">{enemy}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'biology' && (
                <>
                  <div className="modal-section">
                    <h3>🔄 دورة الحياة</h3>
                    {selectedInsect.lifeCycle?.egg && <p><strong>البيض:</strong> {selectedInsect.lifeCycle.egg}</p>}
                    {selectedInsect.lifeCycle?.larva && <p><strong>اليرقة:</strong> {selectedInsect.lifeCycle.larva}</p>}
                    {selectedInsect.lifeCycle?.pupa && <p><strong>العذراء:</strong> {selectedInsect.lifeCycle.pupa}</p>}
                    {selectedInsect.lifeCycle?.adult && <p><strong>الحشرة الكاملة:</strong> {selectedInsect.lifeCycle.adult}</p>}
                  </div>
                  <div className="modal-section">
                    <h3>📅 عدد الأجيال السنوية</h3>
                    <p>{selectedInsect.generationsPerYear}</p>
                  </div>
                  <div className="modal-section">
                    <h3>🌡️ الظروف الملائمة للإصابة</h3>
                    <p>{selectedInsect.favorableConditions}</p>
                  </div>
                  <div className="modal-section">
                    <h3>⚠️ مقاومة المبيدات</h3>
                    <p className="resistance-text">{selectedInsect.resistanceRisk}</p>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsectOrderPage;