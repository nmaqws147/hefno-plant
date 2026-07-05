// components/knowledge/PlantsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import plantsData from '../knowledge_base/crops/data.json';
import './plants-crops.css';
import { Helmet } from 'react-helmet-async';

const PlantsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setData(plantsData);
    if (plantsData?.groups?.length > 0) {
      setActiveGroup(plantsData.groups[0].id);
    }
  }, []);

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setShowModal(true);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlant(null);
  };

  const getActiveGroupData = () => {
    if (!data?.groups) return null;
    return data.groups.find(g => g.id === activeGroup);
  };

  const getSeasonClass = (season) => {
    if (season.includes('شتوي')) return 'season-winter';
    if (season.includes('صيفي')) return 'season-summer';
    if (season.includes('ربيع')) return 'season-spring';
    if (season.includes('خريف')) return 'season-autumn';
    return 'season-winter';
  };

  const getSeverityClass = (severity) => {
    if (severity.includes('عالية جدا')) return 'severity-critical';
    if (severity.includes('عالية')) return 'severity-high';
    if (severity.includes('متوسطة')) return 'severity-medium';
    if (severity.includes('منخفضة')) return 'severity-low';
    return 'severity-medium';
  };

  const activeGroupData = getActiveGroupData();

  if (!data) {
    return (
      <div className="plants-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل بيانات المحاصيل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plants-page   " dir="rtl">
      <Helmet>
        <title>المحاصيل الزراعية | Hefno-Plant</title>
        <meta name="description" content="دليل المحاصيل الزراعية — معلومات شاملة عن أنواع المحاصيل وطرق زراعتها ورعايتها." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="plants-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🌾</span>
          </div>
          <div className="header-text">
            <h1>{data.metadata.name_ar}</h1>
            <p className="header-en">{data.metadata.name_en}</p>
            <div className="stats-badge">
              <span className="stat-badge">🌱 {data.metadata.total_plants} محصول</span>
              <span className="stat-badge">📊 {data.metadata.groups_count} مجموعة</span>
              <span className="stat-badge">🇪🇬 محاصيل مصرية</span>
            </div>
          </div>
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
              {group.id === 'grp-field' ? '🌾' : 
               group.id === 'grp-vegetable' ? '🥬' : 
               group.id === 'grp-fruit' ? '🍊' : 
               group.id === 'grp-herbal' ? '🌿' : '🌸'}
            </span>
            <span className="cat-name">{group.name_ar}</span>
            <span className="cat-count">{group.plants_count}</span>
          </button>
        ))}
      </div>

      {/* محتوى المجموعة النشطة */}
      {activeGroupData && (
        <div className="group-content">
          <div className="group-header category-info-new">
            <h2 className="group-title">{activeGroupData.name_ar}</h2>
            <p className="group-en">{activeGroupData.name_en}</p>
            <p className="group-description">{activeGroupData.description_ar}</p>
            {activeGroupData.sub_categories && (
              <div className="sub-categories">
                {activeGroupData.sub_categories.map((cat, idx) => (
                  <span key={idx} className="sub-cat-tag">{cat}</span>
                ))}
              </div>
            )}
          </div>

          <div className="plants-grid">
            {activeGroupData.plants.map((plant) => (
              <div
                key={plant.id}
                className="plant-card"
                onClick={() => handlePlantClick(plant)}
              >
                <div className="card-glass"></div>
                
                <div className="card-content">
                  <div className="card-header">
                    <span className={`season-badge ${getSeasonClass(plant.seasons?.season_type_ar || '')}`}>
                      {plant.seasons?.season_type_ar || 'موسمي'}
                    </span>
                  </div>

                  <h3 className="plant-name">{plant.name_ar}</h3>
                  <p className="scientific-name">{plant.name_scientific}</p>

                  <p className="plant-description">
                    {plant.description_ar?.substring(0, 100)}...
                  </p>

                  <div className="plant-stats">
                    <div className="stat-row">
                      <span className="stat-label">موسم الزراعة:</span>
                      <span className="stat-value">{plant.seasons?.planting_season_ar || 'غير محدد'}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">مدة النمو:</span>
                      <span className="stat-value">{plant.seasons?.growth_duration_days || '-'} يوم</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">المناطق:</span>
                      <span className="stat-value">{plant.geographic_regions_egypt_ar?.slice(0, 2).join('، ') || 'متعددة'}</span>
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

      {/* Modal لعرض تفاصيل المحصول */}
      {showModal && selectedPlant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="plant-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🌱</span>
              </div>
              <div className="modal-title">
                <h2>{selectedPlant.name_ar}</h2>
                <p className="modal-scientific">{selectedPlant.name_scientific}</p>
                <p className="modal-en">{selectedPlant.name_en}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* تبويبات */}
              <div className="modal-tabs">
                <button className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📋 نظرة عامة</button>
                <button className={`modal-tab ${activeTab === 'seasons' ? 'active' : ''}`} onClick={() => setActiveTab('seasons')}>📅 المواسم</button>
                <button className={`modal-tab ${activeTab === 'soil' ? 'active' : ''}`} onClick={() => setActiveTab('soil')}>🌱 التربة</button>
                <button className={`modal-tab ${activeTab === 'irrigation' ? 'active' : ''}`} onClick={() => setActiveTab('irrigation')}>💧 الري</button>
                <button className={`modal-tab ${activeTab === 'nutrition' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition')}>🧪 التسميد</button>
                <button className={`modal-tab ${activeTab === 'pests' ? 'active' : ''}`} onClick={() => setActiveTab('pests')}>🐛 الآفات</button>
              </div>

              {/* محتوى نظرة عامة */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="info-section">
                    <h3>📝 الوصف</h3>
                    <p>{selectedPlant.description_ar}</p>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">التصنيف:</span>
                      <span className="info-value">{selectedPlant.category}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">الأهمية الاقتصادية:</span>
                      <span className="info-value">{selectedPlant.economic_importance_ar}</span>
                    </div>
                    {selectedPlant.export_potential && (
                      <div className="info-item">
                        <span className="info-label">تصدير:</span>
                        <span className="info-value export-badge">✓ محصول تصديري</span>
                      </div>
                    )}
                  </div>
                  <div className="regions-section">
                    <h3>📍 مناطق الزراعة في مصر</h3>
                    <div className="regions-tags">
                      {selectedPlant.geographic_regions_egypt_ar?.map((region, idx) => (
                        <span key={idx} className="region-tag">{region}</span>
                      ))}
                    </div>
                  </div>
                  <div className="varieties-section">
                    <h3>🌾 الأصناف الشائعة</h3>
                    <div className="varieties-tags">
                      {selectedPlant.common_varieties_ar?.map((variety, idx) => (
                        <span key={idx} className="variety-tag">{variety}</span>
                      ))}
                    </div>
                  </div>
                  {selectedPlant.nutritional_value_per_100g && (
                    <div className="nutrition-section">
                      <h3>🥗 القيمة الغذائية (لكل 100 جرام)</h3>
                      <div className="nutrition-grid">
                        <div className="nutrition-item">
                          <span>سعرات حرارية:</span>
                          <strong>{selectedPlant.nutritional_value_per_100g.calories_kcal}</strong>
                        </div>
                        <div className="nutrition-item">
                          <span>بروتين:</span>
                          <strong>{selectedPlant.nutritional_value_per_100g.protein_g}g</strong>
                        </div>
                        <div className="nutrition-item">
                          <span>كربوهيدرات:</span>
                          <strong>{selectedPlant.nutritional_value_per_100g.carbs_g}g</strong>
                        </div>
                        <div className="nutrition-item">
                          <span>ألياف:</span>
                          <strong>{selectedPlant.nutritional_value_per_100g.fiber_g}g</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* محتوى المواسم */}
              {activeTab === 'seasons' && selectedPlant.seasons && (
                <div className="tab-content">
                  <div className="seasons-grid">
                    <div className="season-card">
                      <span className="season-icon">🌱</span>
                      <div>
                        <h4>موسم الزراعة</h4>
                        <p>{selectedPlant.seasons.planting_season_ar}</p>
                        <small>أشهر: {selectedPlant.seasons.planting_months?.join('، ')}</small>
                      </div>
                    </div>
                    <div className="season-card">
                      <span className="season-icon">🌾</span>
                      <div>
                        <h4>موسم الحصاد</h4>
                        <p>{selectedPlant.seasons.harvest_season_ar}</p>
                        <small>أشهر: {selectedPlant.seasons.harvest_months?.join('، ')}</small>
                      </div>
                    </div>
                    <div className="season-card">
                      <span className="season-icon">⏱️</span>
                      <div>
                        <h4>مدة النمو</h4>
                        <p>{selectedPlant.seasons.growth_duration_days} يوم</p>
                      </div>
                    </div>
                    <div className="season-card">
                      <span className="season-icon">🍂</span>
                      <div>
                        <h4>نوع الموسم</h4>
                        <p>{selectedPlant.seasons.season_type_ar}</p>
                      </div>
                    </div>
                  </div>
                  <div className="critical-stages">
                    <h3>⚠️ المراحل الحرجة للري والتسميد</h3>
                    <div className="stages-tags">
                      {selectedPlant.seasons.critical_stages_ar?.map((stage, idx) => (
                        <span key={idx} className="stage-tag">{stage}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى التربة */}
              {activeTab === 'soil' && selectedPlant.soil_requirements && (
                <div className="tab-content">
                  <div className="soil-grid">
                    <div className="soil-item">
                      <span className="soil-label">التربة المناسبة:</span>
                      <div className="soil-tags">
                        {selectedPlant.soil_requirements.preferred_types_ar?.map((type, idx) => (
                          <span key={idx} className="soil-tag">{type}</span>
                        ))}
                      </div>
                    </div>
                    <div className="soil-item">
                      <span className="soil-label">درجة الحموضة (pH):</span>
                      <span className="soil-value">{selectedPlant.soil_requirements.ph_range}</span>
                    </div>
                    <div className="soil-item">
                      <span className="soil-label">تحمل الملوحة:</span>
                      <span className="soil-value">{selectedPlant.soil_requirements.salinity_tolerance_ar}</span>
                    </div>
                    <div className="soil-item">
                      <span className="soil-label">الصرف:</span>
                      <span className="soil-value">{selectedPlant.soil_requirements.drainage_ar}</span>
                    </div>
                    <div className="soil-item">
                      <span className="soil-label">المادة العضوية:</span>
                      <span className="soil-value">{selectedPlant.soil_requirements.organic_matter_ar}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى الري */}
              {activeTab === 'irrigation' && selectedPlant.irrigation && (
                <div className="tab-content">
                  <div className="irrigation-grid">
                    <div className="irri-item">
                      <span className="irri-label">إجمالي المياه:</span>
                      <span className="irri-value">{selectedPlant.irrigation.total_water_m3_per_feddan} م³/فدان</span>
                    </div>
                    <div className="irri-item">
                      <span className="irri-label">عدد الريات:</span>
                      <span className="irri-value">{selectedPlant.irrigation.irrigation_times}</span>
                    </div>
                    <div className="irri-item">
                      <span className="irri-label">الرية الأولى:</span>
                      <span className="irri-value">{selectedPlant.irrigation.first_irrigation_ar}</span>
                    </div>
                    <div className="irri-item">
                      <span className="irri-label">طريقة الري:</span>
                      <span className="irri-value">{selectedPlant.irrigation.method_ar}</span>
                    </div>
                  </div>
                  <div className="critical-stages">
                    <h3>💧 المراحل الحرجة للمياه</h3>
                    <div className="stages-tags">
                      {selectedPlant.irrigation.critical_stages_ar?.map((stage, idx) => (
                        <span key={idx} className="stage-tag water">{stage}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* محتوى التسميد */}
              {activeTab === 'nutrition' && selectedPlant.nutrition && (
                <div className="tab-content">
                  <div className="nutrition-grid-modal">
                    <div className="nutrient-card">
                      <span className="nutrient-symbol">N</span>
                      <div>
                        <h4>النيتروجين</h4>
                        <p>{selectedPlant.nutrition.total_n_kg_per_feddan} كجم/فدان</p>
                        <small>{selectedPlant.nutrition.n_split_ar}</small>
                      </div>
                    </div>
                    <div className="nutrient-card">
                      <span className="nutrient-symbol">P</span>
                      <div>
                        <h4>الفوسفور</h4>
                        <p>{selectedPlant.nutrition.total_p_kg_per_feddan} كجم/فدان</p>
                        <small>{selectedPlant.nutrition.p_timing_ar}</small>
                      </div>
                    </div>
                    <div className="nutrient-card">
                      <span className="nutrient-symbol">K</span>
                      <div>
                        <h4>البوتاسيوم</h4>
                        <p>{selectedPlant.nutrition.total_k_kg_per_feddan} كجم/فدان</p>
                        <small>{selectedPlant.nutrition.k_timing_ar}</small>
                      </div>
                    </div>
                  </div>
                  {selectedPlant.nutrition.micronutrients_ar && (
                    <div className="micronutrients-section">
                      <h3>🔬 العناصر الصغرى</h3>
                      <div className="micro-grid">
                        {Object.entries(selectedPlant.nutrition.micronutrients_ar).map(([key, value]) => (
                          <div key={key} className="micro-item">
                            <span className="micro-symbol">{key}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPlant.recommended_fertilizers && (
                    <div className="fertilizers-section">
                      <h3>🧪 الأسمدة الموصى بها</h3>
                      {selectedPlant.recommended_fertilizers.map((fert, idx) => (
                        <div key={idx} className="fert-item">
                          <span className="fert-name">{fert.name_ar}</span>
                          <span className="fert-purpose">{fert.purpose_ar}</span>
                          <span className="fert-dose">{fert.dose_ar}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* محتوى الآفات */}
              {activeTab === 'pests' && selectedPlant.pests_and_diseases_ar && (
                <div className="tab-content">
                  <div className="pests-grid">
                    {selectedPlant.pests_and_diseases_ar.map((pest, idx) => (
                      <div key={idx} className="pest-card">
                        <div className="pest-header">
                          <span className={`pest-severity ${getSeverityClass(pest.severity)}`}>
                            {pest.severity}
                          </span>
                          <span className="pest-type">{pest.type}</span>
                        </div>
                        <h4>{pest.name_ar}</h4>
                      </div>
                    ))}
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

export default PlantsPage;