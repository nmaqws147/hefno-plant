// components/knowledge/SoilsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import soilsData from '../knowledge_base/Soil-irri-data/data.json';
import './soil-irri.css';
import { Helmet } from 'react-helmet-async';

const SoilsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedSoil, setSelectedSoil] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

useEffect(() => {
  const loadData = () => {
    try {
      // نتحقق أولاً مما إذا كانت البيانات موجودة وليست null
      if (!soilsData) {
        throw new Error("لم يتم العثور على بيانات التربة!");
      }

      setData(soilsData);
      console.log("تم تحميل البيانات بنجاح:", soilsData);
    } catch (error) {
      console.error("حدث خطأ أثناء معالجة البيانات:", error.message);
      // يمكنك هنا تعيين حالة خطأ لإظهار رسالة للمستخدم
      // setError(error.message); 
    }
  };

  loadData();
}, []);

  const handleSoilClick = (soil) => {
    setSelectedSoil(soil);
    setShowSoilModal(true);
    setActiveTab('overview');
  };

  const handleMethodClick = (method) => {
    setSelectedMethod(method);
    setShowMethodModal(true);
  };

  const closeModals = () => {
    setShowSoilModal(false);
    setShowMethodModal(false);
    setSelectedSoil(null);
    setSelectedMethod(null);
  };

  const getTextureClass = (texture) => {
    if (texture.includes('ثقيلة')) return 'texture-heavy';
    if (texture.includes('خفيفة')) return 'texture-light';
    if (texture.includes('متوسطة')) return 'texture-medium';
    return 'texture-medium';
  };

  const getEfficiencyClass = (efficiency) => {
    const value = parseInt(efficiency);
    if (value >= 85) return 'efficiency-high';
    if (value >= 65) return 'efficiency-medium';
    return 'efficiency-low';
  };

  if (!data) {
    return (
      <div className="soils-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل بيانات التربة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="  soils-page " dir="rtl">
      <Helmet>
        <title>التربة والري | Hefno-Plant</title>
        <meta name="description" content="دليل التربة والري — أنواع التربة، تحليل التربة، طرق الري، وإدارة الموارد المائية." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="soils-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🌱</span>
          </div>
          <div className="header-text">
            <h1>{data.metadata.name_ar}</h1>
            <p className="header-en">{data.metadata.name_en}</p>
            <div className="stats-badge">
              <span className="stat-badge">🌍 {data.egyptian_soil_types.length} نوع تربة</span>
              <span className="stat-badge">💧 {data.irrigation.irrigation_methods_ar.length} نظام ري</span>
              <span className="stat-badge">📊 شامل ومحدث</span>
            </div>
          </div>
        </div>
      </div>

    {/* قسم أنواع التربة - مع Optional Chaining */}
    <div className="soils-section">
      <h2 className="section-title">🏞️ أنواع التربة المصرية</h2>
      <div className="soils-grid">
        {data.egyptian_soil_types?.map((soil) => (
          <div key={soil.id} className="soil-card" onClick={() => handleSoilClick(soil)}>
            <div className="card-glass"></div>
            <div className="card-content">
              <div className="card-header">
                <span className={`texture-badge ${getTextureClass(soil.texture_ar)}`}>
                  {soil.texture_ar}
                </span>
              </div>

              <h3 className="soil-name">{soil.name_ar}</h3>
              <p className="soil-local">{soil.local_name_ar}</p>

              <div className="soil-stats">
                <div className="stat-row">
                  <span className="stat-label">المساحة:</span>
                  <span className="stat-value">{soil.area_million_feddan} مليون فدان</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">درجة الحموضة:</span>
                  <span className="stat-value">{soil.chemical_properties?.ph_range || 'غير محدد'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">المادة العضوية:</span>
                  <span className="stat-value">{soil.chemical_properties?.organic_matter_percent || 'غير محدد'}</span>
                </div>
              </div>

              <div className="crops-preview">
                <span className="crops-label">محاصيل ممتازة:</span>
                <div className="crops-tags">
                  {/* ✅ الحل: استخدام optional chaining */}
                  {(soil.crop_suitability_ar?.excellent_ar?.slice(0, 3) || []).map((crop, idx) => (
                    <span key={idx} className="crop-tag">{crop}</span>
                  ))}
                  {/* لو مفيش excellent_ar، اعرض good_ar بديل */}
                  {(!soil.crop_suitability_ar?.excellent_ar?.length) && (
                    (soil.crop_suitability_ar?.good_ar?.slice(0, 3) || []).map((crop, idx) => (
                      <span key={idx} className="crop-tag">{crop}</span>
                    ))
                  )}
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

    {/* قسم أنظمة الري */}
    <div className="irrigation-section">
      <h2 className="section-title">💧 أنظمة الري</h2>
      <div className="methods-grid">
        {data.irrigation?.irrigation_methods_ar?.map((method) => (
          <div key={method.id} className="method-card" onClick={() => handleMethodClick(method)}>
            <div className="card-glass"></div>
            <div className="card-content">
              <div className="card-header">
                <span className={`efficiency-badge ${getEfficiencyClass(method.efficiency_percent)}`}>
                  كفاءة {method.efficiency_percent}
                </span>
              </div>

              <h3 className="method-name">{method.name_ar}</h3>
              <p className="method-en">{method.name_en}</p>

              <div className="method-stats">
                <div className="stat-row">
                  <span className="stat-label">التربة المناسبة:</span>
                  <span className="stat-value">
                    {method.suitable_soils_ar?.slice(0, 2).join('، ') || "جميع الأنواع"}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">المحاصيل:</span>
                  <span className="stat-value">
                    {method.suitable_crops_ar?.slice(0, 3).join('، ') || "محاصيل متنوعة"}
                  </span>
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

    {/* قسم تحليل التربة - مع Optional Chaining */}
    <div className="analysis-section">
      <h2 className="section-title">🔬 دليل تحليل التربة</h2>
      <div className="analysis-cards">
        <div className="analysis-card">
          <h3>📋 متى تحلل التربة؟</h3>
          <p>{data.soil_analysis_guide?.when_to_sample_ar || 'قبل الموسم بـ 4-6 أسابيع'}</p>
        </div>
        <div className="analysis-card">
          <h3>🔍 كيفية أخذ العينات</h3>
          <ul>
            <li>العمق: {data.soil_analysis_guide?.sampling_guide_ar?.depth_cm || '0-30 سم'}</li>
            <li>عدد النقاط: {data.soil_analysis_guide?.sampling_guide_ar?.points_per_feddan || '5-10 نقطة'}</li>
            <li>الأدوات: {data.soil_analysis_guide?.sampling_guide_ar?.tools_ar || 'مثقاب تربة'}</li>
          </ul>
        </div>
        <div className="analysis-card">
          <h3>⚖️ المؤشرات الرئيسية</h3>
          <div className="params-list">
            {(data.soil_analysis_guide?.key_parameters_ar?.slice(0, 4) || []).map((param, idx) => (
              <div key={idx} className="param-item">
                <span className="param-name">{param.parameter_ar}</span>
                <span className="param-range">{param.ideal_range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* احتياجات المحاصيل المائية - مع Optional Chaining */}
    <div className="water-requirements">
      <h2 className="section-title">💧 احتياجات المحاصيل المائية</h2>
      <div className="crops-water-grid">
        {(data.irrigation?.crop_water_requirements?.slice(0, 4) || []).map((crop, idx) => (
          <div key={idx} className="water-card">
            <h3>{crop.crop_ar}</h3>
            <div className="water-stats">
              <div className="water-stat">
                <span className="water-label">احتياج الماء:</span>
                <span className="water-value">{crop.total_m3_per_feddan} م³/فدان</span>
              </div>
              <div className="water-stat">
                <span className="water-label">فترة الري:</span>
                <span className="water-value">{crop.irrigation_frequency_ar}</span>
              </div>
              <div className="water-stat">
                <span className="water-label">المراحل الحرجة:</span>
                <span className="water-value">{crop.critical_stages_ar?.join(' - ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Modal للتربة */}
      {showSoilModal && selectedSoil && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="soil-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <span>🌱</span>
              </div>
              <div className="modal-title">
                <h2>{selectedSoil.name_ar}</h2>
                <p className="modal-scientific">{selectedSoil.name_en}</p>
                <p className="modal-local">{selectedSoil.local_name_ar}</p>
              </div>
              <button className="modal-close" onClick={closeModals}>✕</button>
            </div>

            <div className="modal-body">
              {/* تبويبات */}
              <div className="modal-tabs">
                <button className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📋 نظرة عامة</button>
                <button className={`modal-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>🔬 الخصائص</button>
                <button className={`modal-tab ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')}>🌾 المحاصيل</button>
                <button className={`modal-tab ${activeTab === 'management' ? 'active' : ''}`} onClick={() => setActiveTab('management')}>🛠️ الإدارة</button>
              </div>

              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">المناطق:</span>
                      <span className="info-value">{selectedSoil.regions_ar.join('، ')}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">المساحة:</span>
                      <span className="info-value">{selectedSoil.area_million_feddan} مليون فدان</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">القوام:</span>
                      <span className="info-value">{selectedSoil.texture_ar}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">اللون:</span>
                      <span className="info-value">{selectedSoil.color_ar}</span>
                    </div>
                  </div>
                  <div className="description-section">
                    <h3>🏞️ التوزيع الجغرافي</h3>
                    <p>{selectedSoil.distribution_ar}</p>
                  </div>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="tab-content">
                  <div className="properties-grid">
                    <div className="property-group">
                      <h3>📐 الخصائص الفيزيائية</h3>
                      <ul>
                        <li>الطين: {selectedSoil.physical_properties.clay_percent}</li>
                        <li>السلت: {selectedSoil.physical_properties.silt_percent}</li>
                        <li>الرمل: {selectedSoil.physical_properties.sand_percent}</li>
                        <li>قدرة الاحتفاظ بالماء: {selectedSoil.physical_properties.water_holding_capacity_ar}</li>
                        <li>الصرف: {selectedSoil.physical_properties.drainage_ar}</li>
                      </ul>
                    </div>
                    <div className="property-group">
                      <h3>🧪 الخصائص الكيميائية</h3>
                      <ul>
                        <li>pH: {selectedSoil.chemical_properties.ph_range}</li>
                        <li>المادة العضوية: {selectedSoil.chemical_properties.organic_matter_percent}</li>
                        <li>CEC: {selectedSoil.chemical_properties.cec_meq_100g}</li>
                        <li>الملوحة: {selectedSoil.chemical_properties.salinity_ec_ds_m}</li>
                        <li>الخصوبة: {selectedSoil.chemical_properties.fertility_ar}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'crops' && (
                <div className="tab-content">
                  <div className="crops-grid">
                    <div className="crop-group excellent">
                      <h3>✅ ممتازة</h3>
                      <div className="crops-tags">
                        {selectedSoil.crop_suitability_ar.excellent_ar.map((crop, idx) => (
                          <span key={idx} className="crop-tag excellent">{crop}</span>
                        ))}
                      </div>
                    </div>
                    <div className="crop-group good">
                      <h3>👍 جيدة</h3>
                      <div className="crops-tags">
                        {selectedSoil.crop_suitability_ar.good_ar?.map((crop, idx) => (
                          <span key={idx} className="crop-tag good">{crop}</span>
                        ))}
                      </div>
                    </div>
                    {selectedSoil.crop_suitability_ar.not_recommended_ar && (
                      <div className="crop-group not-recommended">
                        <h3>❌ غير مناسبة</h3>
                        <div className="crops-tags">
                          {selectedSoil.crop_suitability_ar.not_recommended_ar.map((crop, idx) => (
                            <span key={idx} className="crop-tag not">{crop}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'management' && (
                <div className="tab-content">
                  <div className="management-section">
                    <h3>🌾 نصائح الإدارة</h3>
                    <ul className="tips-list">
                      {selectedSoil.management_tips_ar.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                    <div className="irrigation-note">
                      <h3>💧 نصائح الري</h3>
                      <p>{selectedSoil.irrigation_notes_ar}</p>
                    </div>
                    <div className="fertilization-note">
                      <h3>🧪 نصائح التسميد</h3>
                      <p>{selectedSoil.fertilization_notes_ar}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModals}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لأنظمة الري */}
      {showMethodModal && selectedMethod && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="method-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">💧</div>
              <div className="modal-title">
                <h2>{selectedMethod.name_ar}</h2>
                <p className="modal-scientific">{selectedMethod.name_en}</p>
              </div>
              <button className="modal-close" onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="method-details">
                <div className="detail-item">
                  <span className="detail-label">كفاءة الري:</span>
                  <span className={`efficiency-value ${getEfficiencyClass(selectedMethod.efficiency_percent)}`}>{selectedMethod.efficiency_percent}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">التربة المناسبة:</span>
                  <span className="detail-value">{selectedMethod.suitable_soils_ar.join('، ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">المحاصيل المناسبة:</span>
                  <span className="detail-value">{selectedMethod.suitable_crops_ar.join('، ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">المميزات:</span>
                  <ul className="advantages-list">
                    {selectedMethod.advantages_ar.map((adv, idx) => (<li key={idx}>{adv}</li>))}
                  </ul>
                </div>
                <div className="detail-item">
                  <span className="detail-label">العيوب:</span>
                  <ul className="disadvantages-list">
                    {selectedMethod.disadvantages_ar.map((dis, idx) => (<li key={idx}>{dis}</li>))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModals}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilsPage;