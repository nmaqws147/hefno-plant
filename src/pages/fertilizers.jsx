// components/knowledge/FertilizersPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fertilizersData from '../knowledge_base/Fertilizers/fertilizers.json';
import './fertilizers.css';
import { Helmet } from 'react-helmet-async';

const FertilizersPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setData(fertilizersData);
    if (fertilizersData?.groups?.length > 0) {
      setActiveGroup(fertilizersData.groups[0].id);
    }
  }, []);

  const handleFertilizerClick = (fertilizer) => {
    setSelectedFertilizer(fertilizer);
    setShowModal(true);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFertilizer(null);
  };

  const getActiveGroupData = () => {
    if (!data?.groups) return null;
    return data.groups.find(g => g.id === activeGroup);
  };

  const getNutrientColor = (nutrient) => {
    if (nutrient === 'N') return '#2D6A4F';
    if (nutrient === 'P') return '#F59E0B';
    if (nutrient === 'K') return '#8B5CF6';
    if (nutrient === 'Ca') return '#EF4444';
    if (nutrient === 'Mg') return '#10B981';
    if (nutrient === 'S') return '#3B82F6';
    return '#6B7280';
  };

  const activeGroupData = getActiveGroupData();

  if (!data) {
    return (
      <div className="fertilizers-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل بيانات الأسمدة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fertilizers-page   " dir="rtl">
      <Helmet>
        <title>الأسمدة الزراعية | Hefno-Plant</title>
        <meta name="description" content="دليل الأسمدة الزراعية — أنواع الأسمدة العضوية والمعدنية وطرق استخدامها لكل محصول." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="fertilizers-header special-page-header">
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
            <div className="stats-badge">
              <span className="stat-badge">📊 {data.total_fertilizers} سماد</span>
              <span className="stat-badge">🧪 {data.groups_count} مجموعة</span>
              <span className="stat-badge">🌱 NPK + عناصر صغرى</span>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-value">{data.total_fertilizers}</span>
          <span className="stat-label">نوع سماد</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.groups_count}</span>
          <span className="stat-label">مجموعة رئيسية</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">NPK+Ca+Mg+S</span>
          <span className="stat-label">عناصر متاحة</span>
        </div>
      </div>

      {/* تبويبات المجموعات */}
      <div className="categories-tabs">
        {data.groups.map((group) => (
          <button
            key={group.id}
            className={`cat-tab ${activeGroup === group.id ? 'active' : ''}`}
            onClick={() => setActiveGroup(group.id)}
          >
            <span className="cat-icon">
              {group.id === 'fert-grp-N' ? '🌱' : 
               group.id === 'fert-grp-P' ? '🌿' : 
               group.id === 'fert-grp-K' ? '🍊' : 
               group.id === 'fert-grp-Organic' ? '🍂' : '🧬'}
            </span>
            <span className="cat-name">{group.ar_name}</span>
            <span className="cat-count">{group.fertilizers_count}</span>
          </button>
        ))}
      </div>

      {/* محتوى المجموعة النشطة */}
      {activeGroupData && (
        <div className="group-content">
          <div className="group-header">
            <h2 className="group-title">{activeGroupData.ar_name}</h2>
            <p className="group-en">{activeGroupData.name_en}</p>
            <p className="group-description">{activeGroupData.ar_description}</p>
          </div>

          <div className="fertilizers-grid">
            {activeGroupData.fertilizers.map((fertilizer) => (
              <div
                key={fertilizer.id}
                className="fertilizer-card"
                onClick={() => handleFertilizerClick(fertilizer)}
              >
                <div className="card-glass"></div>
                
                <div className="card-content">
                  <div className="card-header">
                   <div className="nutrient-badge">
                      {/* 1. التحقق من وجود محتوى غذائي (كيميائي أو عضوي) */}
                      {(fertilizer.nutrient_content || fertilizer.nutrient_content_approx) ? (
                        Object.entries(fertilizer.nutrient_content || fertilizer.nutrient_content_approx || {})
                          .filter(([_, value]) => {
                            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                            return numericValue > 0;
                          })
                          .map(([key, value]) => (
                            <span 
                              key={key} 
                              className="nutrient-chip" 
                              style={{ 
                                background: `${getNutrientColor(key)}15`, 
                                color: getNutrientColor(key) 
                              }}
                            >
                              {key} {value}
                              {/* إضافة % فقط إذا لم تكن موجودة في النص القادم من الـ JSON */}
                              {String(value).includes('%') ? '' : '%'}
                            </span>
                          ))
                      ) : (
                        /* 2. حالة الأسمدة الحيوية (مثل الرايزوبيوم) التي لا تملك أرقاماً ثابتة */
                        fertilizer.target_element && (
                          <span className="nutrient-chip bio-target-chip">
                            <span className="bio-dot"></span>
                            يستهدف عنصر: {fertilizer.target_element}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <h3 className="fertilizer-name">{fertilizer.ar_name}</h3>
                  <p className="scientific-name">{fertilizer.name_en}</p>
                  <p className="formula">{fertilizer.chemical_formula}</p>

                  <p className="fertilizer-description">
                    {fertilizer.ar_advantages?.slice(0, 1)[0] || 
                     `سماد ${fertilizer.nitrogen_type || 'متعدد الاستخدامات'} يوفر العناصر الغذائية للنبات`}
                  </p>

                  <div className="usage-tags">
                    <span className="usage-tag">
                      {fertilizer.application?.soil_kg_per_feddan ? 'تسميد أرضي' : 
                       fertilizer.application?.foliar_percent ? 'رش ورقي' : 'متعدد الاستخدامات'}
                    </span>
                    {fertilizer.organic_certified && (
                      <span className="usage-tag organic">عضوي معتمد</span>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="price-tag">
                      <span>💰</span> {fertilizer.price_category || 'متوسط'}
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
        </div>
      )}

  {showModal && selectedFertilizer && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="fertilizer-modal glass" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-icon">
          <span>{selectedFertilizer.id.includes('bio') ? '🧬' : '🧪'}</span>
        </div>
        <div className="modal-title">
          <h2>{selectedFertilizer.ar_name}</h2>
          <p className="modal-scientific">{selectedFertilizer.name_en}</p>
          {selectedFertilizer.chemical_formula && (
            <p className="modal-formula">{selectedFertilizer.chemical_formula}</p>
          )}
        </div>
        <button className="modal-close" onClick={closeModal}>✕</button>
      </div>

      <div className="modal-body">
        {/* التبويبات */}
        <div className="modal-tabs">
          <button className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📋 نظرة عامة</button>
          <button className={`modal-tab ${activeTab === 'application' ? 'active' : ''}`} onClick={() => setActiveTab('application')}>🌱 الاستخدام</button>
          <button className={`modal-tab ${activeTab === 'advantages' ? 'active' : ''}`} onClick={() => setActiveTab('advantages')}>✅ المميزات</button>
          <button className={`modal-tab ${activeTab === 'storage' ? 'active' : ''}`} onClick={() => setActiveTab('storage')}>📦 التخزين</button>
        </div>

        {/* 1. محتوى نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="nutrient-grid">
              <div className="nutrient-item full-width">
                <span className="nutrient-label">المحتوى الغذائي والعناصر</span>
                <div className="nutrient-values">
                  {(selectedFertilizer.nutrient_content || selectedFertilizer.nutrient_content_approx) ? (
                    Object.entries(selectedFertilizer.nutrient_content || selectedFertilizer.nutrient_content_approx || {})
                      .filter(([_, v]) => parseFloat(v) > 0)
                      .map(([key, value]) => (
                        <span key={key} className="nutrient-value-badge" style={{ background: `${getNutrientColor(key)}15`, color: getNutrientColor(key) }}>
                          {key}: {value}{String(value).includes('%') ? '' : '%'}
                        </span>
                      ))
                  ) : (
                    selectedFertilizer.target_element && (
                      <span className="nutrient-value-badge bio-target">🎯 يستهدف عنصر: {selectedFertilizer.target_element}</span>
                    )
                  )}
                </div>
              </div>

              <div className="nutrient-item">
                <span className="nutrient-label">الحالة / النوع</span>
                <span className="nutrient-value">{selectedFertilizer.ar_form || selectedFertilizer.ar_type || "غير محدد"}</span>
              </div>

              {selectedFertilizer.solubility_g_per_100ml && (
                <div className="nutrient-item">
                  <span className="nutrient-label">الذوبان</span>
                  <span className="nutrient-value">{selectedFertilizer.solubility_g_per_100ml} جم/100مل</span>
                </div>
              )}

              {selectedFertilizer.ph_effect_on_soil && (
                <div className="nutrient-item">
                  <span className="nutrient-label">التأثير على التربة (pH)</span>
                  <span className="nutrient-value">{selectedFertilizer.ph_effect_on_soil}</span>
                </div>
              )}

              <div className="nutrient-item full-width">
                <span className="nutrient-label">المحاصيل المناسبة</span>
                <div className="crops-tags">
                  {selectedFertilizer.suitable_crops?.map((crop, idx) => (
                    <span key={idx} className="crop-tag">{crop}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. محتوى طريقة الاستخدام */}
        {activeTab === 'application' && selectedFertilizer.application && (
          <div className="tab-content">
            <div className="application-grid">
              {/* عرض الكميات حسب نوع السماد */}
              {selectedFertilizer.application.soil_kg_per_feddan && (
                <div className="app-item"><h4>🌱 إضافة تربة</h4><p>{selectedFertilizer.application.soil_kg_per_feddan}</p></div>
              )}
              {selectedFertilizer.application.soil_ton_per_feddan && (
                <div className="app-item"><h4>🚜 كمية الفدان</h4><p>{selectedFertilizer.application.soil_ton_per_feddan}</p></div>
              )}
              {selectedFertilizer.application.foliar_percent && (
                <div className="app-item"><h4>🌿 رش ورقي</h4><p>{selectedFertilizer.application.foliar_percent}</p></div>
              )}
              {selectedFertilizer.application.seed_inoculation_ar && (
                <div className="app-item full-width"><h4>🧪 تلقيح البذور</h4><p>{selectedFertilizer.application.seed_inoculation_ar}</p></div>
              )}
              
              <div className="app-item full-width">
                <h4>⏰ التوقيت والطريقة</h4>
                <p>{selectedFertilizer.application.ar_timing} - {selectedFertilizer.application.ar_method}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. محتوى المميزات والعيوب */}
        {activeTab === 'advantages' && (
          <div className="tab-content">
            <div className="advantages-section">
              <h3>✅ المميزات</h3>
              <ul className="advantages-list">
                {selectedFertilizer.ar_advantages?.map((adv, idx) => <li key={idx}>{adv}</li>)}
              </ul>
            </div>
            {selectedFertilizer.ar_disadvantages && (
              <div className="disadvantages-section">
                <h3>⚠️ العيوب والتحذيرات</h3>
                <ul className="disadvantages-list">
                  {selectedFertilizer.ar_disadvantages.map((dis, idx) => <li key={idx}>{dis}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 4. محتوى التخزين */}
        {activeTab === 'storage' && (
          <div className="tab-content">
            <div className="storage-section">
              <h3>📦 شروط التخزين</h3>
              <p>{selectedFertilizer.storage_ar}</p>
            </div>
            {selectedFertilizer.ar_strains && (
              <div className="strains-section">
                <h3>🧬 السلالات المتوفرة</h3>
                <div className="strains-grid">
                  {Object.entries(selectedFertilizer.ar_strains).map(([key, val]) => (
                    <div key={key} className="strain-item"><strong>{key}:</strong> {val}</div>
                  ))}
                </div>
              </div>
            )}
            {selectedFertilizer.egypt_importance && (
              <div className="egypt-section">
                <h3>🇪🇬 الأهمية في مصر</h3>
                <p>{selectedFertilizer.egypt_importance}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <div className="price-info">الفئة السعرية: <strong>{selectedFertilizer.price_category}</strong></div>
        <button className="close-modal-btn" onClick={closeModal}>إغلاق</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FertilizersPage;