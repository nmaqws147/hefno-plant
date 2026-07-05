// components/knowledge/PesticideGroupPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './pesticidesHub.css';

const PesticideGroupPage = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const normalizeGroupCode = (code) => {
    if (!code) return '';
    return String(code).trim().toUpperCase();
  };

  const extractGroupCode = (item, category) => {
    if (!item) return '';
    switch (category) {
case 'fungicides': 
    return item.frac_group_id || '';
    
  case 'insecticides': 
    return item.irac_group_id || '';
    
  case 'herbicides': 
    return item.hrac_group_id || '';
    
  case 'nematicides': 
    return item.nema_group_id ||  '';
    
  case 'bactericides': 
    return item.bact_group_id ||  '';
  
    case 'publicHealth': return item.group_code || item.code || item.id || '';
      default: return item.group_code || item.code || item.id || '';
    }
  };

  const normalizeItem = (item, category, group) => ({
    ...item,
    name_ar: item.ar_name || item.name_ar || item.name || 'غير معروف',
    name_en: item.name_en || item.name || '',
    type_ar: item.type_ar || item.ar_type || (item.systemic ? 'جهازي' : 'ملامسي'),
    chemical_class_ar: item.chemical_class_ar || item.chemical_class_en || '—',
    group_code_display: extractGroupCode(item, category) || group?.code,
    group_name_ar: item.group_name_ar || group?.name_ar || group?.ar_name,
    resistance_risk: item.resistance?.risk_ar || item.resistance?.ar_risk || item.resistance_risk,
    resistance_risk_level: item.resistance?.risk_level,
    resistance_mechanism: item.resistance?.mechanism_ar || item.resistance?.ar_mechanism,
    target_pests: item.target_pests || item.target_diseases || item.target_nematodes || item.target_weeds || [],
    spectrum_ar: item.spectrum_ar || item.ar_spectrum || '—',
    activity_ar: item.activity_ar || item.ar_activity,
    application: item.application || {},
    safety_notes: item.safety_notes_ar || item.ar_notes_safety,
    special_use: item.special_use_ar || item.ar_use_special,
    regulatory: item.regulatory_ar || item.ar_regulatory,
    isPublicHealth: category === 'publicHealth',
    target_crops: item.target_crops || [],
  });

  const loadItems = useCallback(async (category, rawGroupCode, group) => {
    setLoading(true);
    const targetCode = normalizeGroupCode(rawGroupCode);

    try {
      let allItems = [];

      switch (category) {
        case 'fungicides':
          const fracData = await import('../pesticides-folder/pesti-items/frac.json');
          allItems = fracData.default?.items || [];
          break;
        case 'insecticides':
          const iracData = await import('../pesticides-folder/pesti-items/irac.json');
          allItems = iracData.default?.items || [];
          break;
        case 'herbicides':
          const hracData = await import('../pesticides-folder/pesti-items/hrac.json');
          allItems = hracData.default?.items || [];
          break;
        case 'nematicides':
          const nemaData = await import('../pesticides-folder/pesti-items/nema.json');
          allItems = nemaData.default?.items || [];
          break;
        case 'bactericides':
          const bactData = await import('../pesticides-folder/pesti-items/bact.json');
          allItems = bactData.default?.items || [];
          break;

        case 'publicHealth':
          const phData = await import('../pesticides-folder/pesti-items/phg.json');
          const targetGroup = phData.default?.groups?.find(g =>
            normalizeGroupCode(g.code) === targetCode || normalizeGroupCode(g.id) === targetCode
          );
          if (targetGroup?.active_ingredients) {
            const normalized = targetGroup.active_ingredients.map(item =>
              normalizeItem({ ...item, group_name_ar: targetGroup.ar_name }, category, group)
            );
            setItems(normalized);
            setGroupData(prev => ({ ...prev, group: group }));
            setLoading(false);
            return;
          }
          setItems([]);
          setLoading(false);
          return;
      }

      const filtered = allItems.filter(item => {
        const itemCode = extractGroupCode(item, category);
        return normalizeGroupCode(itemCode) === targetCode;
      });

      const normalizedItems = filtered.map(item => normalizeItem(item, category, group));
      setItems(normalizedItems);

    } catch (error) {
      console.error(`Error loading ${category}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('selectedPesticideGroup');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const codeToUse = parsed.group?.id ||parsed.group?.code || groupCode;
      setGroupData(parsed);
      loadItems(parsed.category, codeToUse, parsed.group);
    } else {
      navigate('/knowledge-base/pesticides');
    }
  }, [groupCode, navigate, loadItems]);

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name_ar?.toLowerCase().includes(q) ||
      item.name_en?.toLowerCase().includes(q) ||
      item.chemical_class_ar?.toLowerCase().includes(q) ||
      item.type_ar?.toLowerCase().includes(q)
    );
  });

  const getRiskLevel = (risk) => {
    if (typeof risk === 'number') return risk;
    const r = String(risk || '').toLowerCase();
    if (r.includes('عالي جدا') || r.includes('very high')) return 4;
    if (r.includes('عالي') || r.includes('high')) return 3;
    if (r.includes('متوسط') || r.includes('medium')) return 2;
    if (r.includes('منخفض') || r.includes('low')) return 1;
    return 2;
  };

  const getRiskColor = (risk) => {
    const level = getRiskLevel(risk);
    if (level >= 4) return '#dc2626';
    if (level === 3) return '#f59e0b';
    if (level === 2) return '#eab308';
    return '#10b981';
  };

  const getRiskText = (risk) => {
    const r = String(risk || '').toLowerCase();
    if (r.includes('عالي جدا') || r.includes('very high')) return 'شديد جداً';
    if (r.includes('عالي') || r.includes('high')) return 'شديد';
    if (r.includes('متوسط') || r.includes('medium')) return 'متوسط';
    if (r.includes('منخفض') || r.includes('low')) return 'منخفض';
    return 'متوسط';
  };

  if (loading) {
    return (
      <div className="pesticides-hub-new" dir="rtl">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المواد الفعالة...</p>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="pesticides-hub-new" dir="rtl">
        <div className="error-container glass">
          <div className="error-icon">⚠️</div>
          <h2>خطأ في تحميل البيانات</h2>
          <p>لم يتم العثور على بيانات المجموعة المطلوبة</p>
          <button className="back-home-btn" onClick={() => navigate('/knowledge-base/pesticides')}>
            العودة إلى المبيدات
          </button>
        </div>
      </div>
    );
  }

  const currentGroup = groupData.group || groupData;
  const categoryData = groupData.categoryData || {};
  const currentCategory = groupData.category;
  const isPublicHealth = currentCategory === 'publicHealth';

  return (
    <div className="pesticides-hub-new" dir="rtl">
      <div className="hub-bg-new">
        <div className="bg-glow-new"></div>
        <div className="bg-particles-new"></div>
      </div>

      {/* رأس الصفحة */}
      <div className="group-header-new glass">
        <button className="back-button-new" onClick={() => navigate('/knowledge-base/pesticides')}>
          <span>←</span> العودة إلى المجموعات
        </button>
        <div className="group-header-content">
          <div className="group-icon" style={{ background: `${categoryData.color || '#ef4444'}15`, color: categoryData.color || '#ef4444' }}>
            <span>{categoryData.icon || '🧪'}</span>
          </div>
          <div className="group-header-text">
            <h1>{currentGroup.name_ar || currentGroup.ar_name}</h1>
            <p>{currentGroup.name_en}</p>
            <div className="group-badges">
              <span className="badge" style={{ background: `${categoryData.color || '#ef4444'}15`, color: categoryData.color || '#ef4444' }}>
                {currentGroup.code || currentGroup.id}
              </span>
              <span className="badge">{currentGroup.chemical_class_ar || 'مبيد'}</span>
              <span className="badge">{items.length} مادة فعالة</span>
            </div>
          </div>
        </div>
      </div>

      {/* وصف المجموعة */}
      <div className="group-description-new glass">
        <h3>📖 عن هذه المجموعة</h3>
        <p>{currentGroup.MoA_ar || currentGroup.ar_MoA || 'لا يوجد وصف متاح'}</p>
        
        {isPublicHealth && (
          <div className="public-health-note">
            <span className="note-icon">🏥</span>
            <span className="note-text">مبيدات الصحة العامة - تستخدم لمكافحة ناقلات الأمراض (البعوض، الذباب، الصراصير، القوارض)</span>
          </div>
        )}
        
        {currentGroup.ar_rule_rotation && (
          <div className="rotation-note">
            <span>🔄</span>
            <span>{currentGroup.ar_rule_rotation}</span>
          </div>
        )}
        
        {currentGroup.ar_spectrum && (
          <div className="spectrum-note">
            <span>🎯</span>
            <span>{currentGroup.ar_spectrum}</span>
          </div>
        )}
      </div>

      {/* شريط البحث */}
      <div className="search-section-new glass">
        <div className="search-wrapper-new">
          <span className="search-icon-new">🔍</span>
          <input
            type="text"
            placeholder="ابحث عن مادة فعالة بالاسم العربي أو الإنجليزي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-new"
          />
          {searchQuery && (
            <button className="clear-search-new" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="results-count-new">
        <span>🧪 {filteredItems.length} مادة فعالة</span>
      </div>

      {/* شبكة المواد الفعالة */}
      <div className="items-grid-new">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="item-card-new glass"
            onClick={() => {
              setSelectedItem(item);
              setShowModal(true);
            }}
          >
            <div className="item-card-content">
              <div className="item-header" style={{ justifyContent: "space-between" }}>
                <h4>{item.name_ar}</h4>
                <p className="item-name-en">{item.name_en}</p>
              </div>
              
              <div className="item-details">
                <div className="item-detail">
                  <span className="detail-label">النوع:</span>
                  <span className="detail-value">{item.type_ar}</span>
                </div>
                
                {item.chemical_class_ar && item.chemical_class_ar !== '—' && (
                  <div className="item-detail">
                    <span className="detail-label">التركيب:</span>
                    <span className="detail-value">{item.chemical_class_ar}</span>
                  </div>
                )}
                
                {item.application?.dose_feddan_ar && (
                  <div className="item-detail">
                    <span className="detail-label">الجرعة:</span>
                    <span className="detail-value">{item.application.dose_feddan_ar}</span>
                  </div>
                )}
                
                {item.resistance_risk && (
                  <div className="item-detail">
                    <span className="detail-label">مخاطر المقاومة:</span>
                    <span className="detail-value" style={{ color: getRiskColor(item.resistance_risk) }}>
                      {getRiskText(item.resistance_risk)}
                    </span>
                  </div>
                )}
                
                {item.spectrum_ar && item.spectrum_ar !== '—' && (
                  <div className="item-detail">
                    <span className="detail-label">المكافحة:</span>
                    <span className="detail-value">{item.spectrum_ar}</span>
                  </div>
                )}
              </div>

              {/* الأهداف المستهدفة */}
              {item.target_pests && item.target_pests.length > 0 && (
                <div className="item-targets">
                  <span>
                    {isPublicHealth ? '🐛 الآفات المستهدفة:' : 
                     currentCategory === 'fungicides' ? '🦠 الأمراض المستهدفة:' :
                     currentCategory === 'herbicides' ? '🌿 الحشائش المستهدفة:' :
                     currentCategory === 'nematicides' ? '🪱 النيماتودا المستهدفة:' : '🎯 الأهداف:'}
                  </span>
                  <div className="targets-list">
                    {item.target_pests.slice(0, 3).map((pest, idx) => (
                      <span key={idx} className="target-tag">
                        {typeof pest === 'string' ? pest : pest.ar_name || pest.name_ar}
                      </span>
                    ))}
                    {item.target_pests.length > 3 && (
                      <span className="target-tag more">+{item.target_pests.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="item-footer">
                <span className="view-details">
                  عرض التفاصيل
                  <span className="arrow">←</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* لا توجد نتائج */}
      {filteredItems.length === 0 && (
        <div className="no-results-new glass">
          <div className="no-results-icon-new">🔍</div>
          <h3>لا توجد مواد فعالة</h3>
          <p>لم يتم العثور على مواد فعالة تطابق "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')}>مسح البحث</button>
        </div>
      )}

      {/* Modal للمادة الفعالة */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="item-modal-new glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ background: `${categoryData.color || '#ef4444'}15` }}>
                <span>🧪</span>
              </div>
              <div className="modal-title">
                <h2>{selectedItem.name_ar}</h2>
                <p>{selectedItem.name_en}</p>
                {selectedItem.who_class && (
                  <p className="who-class">تصنيف منظمة الصحة العالمية: {selectedItem.who_class}</p>
                )}
                <p className="modal-group">
                  {selectedItem.group_name_ar || currentGroup.name_ar}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* المعلومات الأساسية */}
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">التركيب الكيميائي:</span>
                  <span className="detail-value">{selectedItem.chemical_class_ar}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">نوع المادة:</span>
                  <span className="detail-value">{selectedItem.type_ar}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">رمز المجموعة:</span>
                  <span className="detail-value">{selectedItem.group_code_display || '—'}</span>
                </div>
                {selectedItem.activity_ar && (
                  <div className="detail-row">
                    <span className="detail-label">آلية التأثير:</span>
                    <span className="detail-value">{selectedItem.activity_ar}</span>
                  </div>
                )}
              </div>

              {/* معلومات التطبيق */}
              {selectedItem.application && Object.keys(selectedItem.application).length > 0 && (
                <div className="application-box">
                  <h4>💧 معلومات التطبيق</h4>
                  <div className="application-details">
                    {selectedItem.application.dose_feddan_ar && (
                      <div className="app-row">
                        <span>الجرعة للفدان:</span>
                        <strong>{selectedItem.application.dose_feddan_ar}</strong>
                      </div>
                    )}
                    {selectedItem.application.dose_spray_ar && (
                      <div className="app-row">
                        <span>الجرعة للرش:</span>
                        <strong>{selectedItem.application.dose_spray_ar}</strong>
                      </div>
                    )}
                    {selectedItem.application.methods_ar && selectedItem.application.methods_ar.length > 0 && (
                      <div className="app-row">
                        <span>طريقة التطبيق:</span>
                        <span>{selectedItem.application.methods_ar.join('، ')}</span>
                      </div>
                    )}
                    {selectedItem.application.timing_ar && (
                      <div className="app-row">
                        <span>توقيت التطبيق:</span>
                        <span>{selectedItem.application.timing_ar}</span>
                      </div>
                    )}
                    {selectedItem.application.preharvest_interval_ar && (
                      <div className="app-row">
                        <span>فترة التحريم:</span>
                        <span>{selectedItem.application.preharvest_interval_ar}</span>
                      </div>
                    )}
                    {selectedItem.application.max_applications_season && (
                      <div className="app-row">
                        <span>الحد الأقصى للرشات:</span>
                        <strong>{selectedItem.application.max_applications_season} رشات/موسم</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات المقاومة */}
              {selectedItem.resistance_risk && (
                <div className="resistance-box">
                  <h4>⚠️ معلومات المقاومة</h4>
                  <div className="resistance-row">
                    <span>مخاطر المقاومة:</span>
                    <strong style={{ color: getRiskColor(selectedItem.resistance_risk) }}>
                      {getRiskText(selectedItem.resistance_risk)}
                    </strong>
                  </div>
                  {selectedItem.resistance_mechanism && (
                    <div className="resistance-row">
                      <span>آلية المقاومة:</span>
                      <span>{selectedItem.resistance_mechanism}</span>
                    </div>
                  )}
                </div>
              )}

              {/* الأهداف المستهدفة */}
              {selectedItem.target_pests && selectedItem.target_pests.length > 0 && (
                <div className="target-pests-box">
                  <h4>
                    {isPublicHealth ? '🐛 الآفات المستهدفة' : 
                     currentCategory === 'fungicides' ? '🦠 الأمراض المستهدفة' :
                     currentCategory === 'herbicides' ? '🌿 الحشائش المستهدفة' :
                     currentCategory === 'nematicides' ? '🪱 النيماتودا المستهدفة' : '🎯 الأهداف'}
                  </h4>
                  <div className="pests-list">
                    {selectedItem.target_pests.map((pest, idx) => (
                      <span key={idx} className="pest-tag">
                        {typeof pest === 'string' ? pest : pest.ar_name || pest.name_ar}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* المحاصيل المستهدفة */}
              {selectedItem.target_crops && selectedItem.target_crops.length > 0 && (
                <div className="target-pests-box">
                  <h4>🌾 المحاصيل</h4>
                  <div className="pests-list">
                    {selectedItem.target_crops.map((crop, idx) => (
                      <span key={idx} className="pest-tag">{crop}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات إضافية */}
              {selectedItem.special_use && (
                <div className="special-box">
                  <h4>⭐ استخدامات خاصة</h4>
                  <p>{selectedItem.special_use}</p>
                </div>
              )}

              {selectedItem.regulatory && (
                <div className="regulatory-box">
                  <h4>📋 معلومات تنظيمية</h4>
                  <p>{selectedItem.regulatory}</p>
                </div>
              )}

              {/* تحذيرات السلامة */}
              {selectedItem.safety_notes && (
                <div className="safety-box">
                  <h4>⚠️ تحذيرات السلامة</h4>
                  <p>{selectedItem.safety_notes}</p>
                </div>
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

export default PesticideGroupPage;