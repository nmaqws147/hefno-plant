// components/knowledge/PesticidesHub.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pesticidesHub.css';

// استيراد البيانات
import groupsData from '../pesticides-folder/groups.json';
import publicHealthData from '../pesticides-folder/pesti-items/phg.json';
import { Helmet } from 'react-helmet-async';

const PesticidesHub = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(() => {
  return localStorage.getItem('activePesticideCategory') || 'insecticides';
});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
  localStorage.setItem('activePesticideCategory', activeCategory);
}, [activeCategory]);
  // دالة لاستخراج المجموعات
  const getGroups = (key) => {
    return groupsData[key]?.groups || [];
  };

  // دالة لمعالجة مجموعات الصحة العامة (لأن هيكلها مختلف)
  const getPublicHealthGroups = () => {
    if (!publicHealthData?.groups) return [];
    
    // تحويل مجموعات الصحة العامة إلى نفس هيكل المجموعات الأخرى
    return publicHealthData.groups.map(group => ({
      id: group.id,
      code: group.code,
      irac_code: group.irac_code,
      name_ar: group.ar_name,
      name_en: group.name_en,
      chemical_class_ar: group.chemical_class_ar,
      MoA_ar: group.ar_MoA,
      application_method_ar: group.ar_method_application,
      spectrum_ar: group.ar_spectrum,
      resistance_risk_ar: group.ar_risk_resistance,
      resistance_risk_level: group.resistance_risk_level,
      resistance_mechanism_ar: group.ar_mechanism_resistance,
      rotation_rule_ar: group.ar_rule_rotation,
      max_applications_season: group.max_applications_season,
      importance_egypt: group.egypt_importance,
      safety_class_ar: group.ar_class_safety,
      ai_count: group.ai_count,
      active_ingredients: group.active_ingredients,
      isPublicHealth: true
    }));
  };

  const categories = {
    insecticides: {
      title: 'المبيدات الحشرية',
      title_en: 'Insecticides — IRAC Classification',
      icon: '🐛',
      color: '#ef4444',
      bgColor: '#fef2f2',
      groups: getGroups('irac-grp')
    },
    fungicides: {
      title: 'المبيدات الفطرية',
      title_en: 'Fungicides — FRAC Classification',
      icon: '🍄',
      color: '#8b5cf6',
      bgColor: '#f5f0ff',
      groups: getGroups('frac-grp')
    },
    herbicides: {
      title: 'مبيدات الحشائش',
      title_en: 'Herbicides — HRAC Classification',
      icon: '🌿',
      color: '#10b981',
      bgColor: '#ecfdf5',
      groups: getGroups('hrac-grp')
    },
    nematicides: {
      title: 'المبيدات النيماتودية',
      title_en: 'Nematicides — Mode of Action',
      icon: '🐛',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      groups: getGroups('nema-grp')
    },
    bactericides: {
      title: 'المبيدات البكتيرية',
      title_en: 'Bactericides',
      icon: '🦠',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      groups: getGroups('bact-grp')
    },
    publicHealth: {
      title: 'مبيدات الصحة العامة',
      title_en: 'Public Health Pesticides',
      icon: '🏥',
      color: '#8b5a2b',
      bgColor: '#fef9e6',
      groups: getPublicHealthGroups()
    }
  };

  const currentCategory = categories[activeCategory];

  // فلترة المجموعات
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return currentCategory.groups;
    
    const query = searchQuery.toLowerCase();
    return currentCategory.groups.filter(group => 
      group.name_ar?.toLowerCase().includes(query) ||
      group.name_en?.toLowerCase().includes(query) ||
      group.code?.toLowerCase().includes(query) ||
      group.irac_code?.toLowerCase().includes(query) ||
      group.chemical_class_ar?.toLowerCase().includes(query)
    );
  }, [searchQuery, currentCategory.groups]);

  const handleGroupClick = (group) => {
    // تخزين المجموعة المختارة مع معلومات إضافية للصحة العامة
    localStorage.setItem('selectedPesticideGroup', JSON.stringify({
      category: activeCategory,
      group: group,
      categoryData: {
        title: currentCategory.title,
        icon: currentCategory.icon,
        color: currentCategory.color
      },
      isPublicHealth: group.isPublicHealth || activeCategory === 'publicHealth'
    }));
    navigate(`/knowledge-base/pesticides/group/${group.id}`);
  };

  const getRiskColor = (level) => {
    if (level === 4 || level === 'very high' || level === 'عالٍ جدا') return '#dc2626';
    if (level === 3 || level === 'high' || level === 'عالٍ' || level === 'عالية') return '#f59e0b';
    if (level === 2 || level === 'medium' || level === 'متوسط') return '#eab308';
    if (level === 1 || level === 'low' || level === 'منخفض') return '#10b981';
    return '#10b981';
  };

  const getRiskText = (risk) => {
    if (risk?.includes('عالٍ جدا') || risk?.includes('عالي جدا') || risk === 'very high') return 'شديد جداً';
    if (risk?.includes('عالٍ') || risk?.includes('عالي') || risk === 'high') return 'شديد';
    if (risk?.includes('متوسط') || risk === 'medium') return 'متوسط';
    if (risk?.includes('منخفض') || risk === 'low') return 'منخفض';
    return 'متوسط';
  };

  return (
    <div className="pesticides-hub-new" dir="rtl">
      <Helmet>
        <title>دليل المبيدات الزراعية | Hefno-Plant</title>
        <meta name="description" content="دليل المبيدات الزراعية الشامل — مبيدات حشرية وفطرية وأعشاب، الجرعات وطرق الاستخدام." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="hub-header-new glass">
        <button className="back-button-new" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content-new">
          <div className="header-icon-new">
            <span>🧪</span>
          </div>
          <div className="header-text-new">
            <h1>مركز المبيدات الزراعية</h1>
            <p>اختر القسم ثم المجموعة لعرض المواد الفعالة</p>
          </div>
        </div>
      </div>

      {/* تبويبات الأقسام */}
      <div className="categories-tabs">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            className={`cat-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
            style={{ '--cat-color': cat.color }}
          >
            <span className="tab-icon-new">{cat.icon}</span>
            <span className="tab-name-new">{cat.title}</span>
            <span className="tab-count-new">{cat.groups.length}</span>
          </button>
        ))}
      </div>

      {/* معلومات القسم */}
      <div className="category-info-new" style={{ background: currentCategory.bgColor }}>
        <div className="info-icon-new" style={{ color: currentCategory.color }}>
          {currentCategory.icon}
        </div>
        <div className="info-text-new">
          <h2>{currentCategory.title}</h2>
          <p>{currentCategory.title_en}</p>
        </div>
        <div className="info-stats-new">
          <span>📊 {currentCategory.groups.length} مجموعة</span>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="search-section-new glass">
        <div className="search-wrapper-new">
          <span className="search-icon-new">🔍</span>
          <input
            type="text"
            placeholder="ابحث عن مجموعة مبيدات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-new"
          />
          {searchQuery && (
            <button className="clear-search-new" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* شبكة المجموعات */}
      <div className="groups-section-new">
        <div className="section-header-new">
          <h3 className="section-title-new">
            <span>📁</span> مجموعات المبيدات
            <span className="section-count-new">{filteredGroups.length}</span>
          </h3>
        </div>
        
        <div className="groups-grid-new">
          {filteredGroups.map((group, idx) => (
            <div
              key={group.id || idx}
              className="group-card-new glass"
              onClick={() => handleGroupClick(group)}
              style={{ '--group-color': currentCategory.color }}
            >
              <div className="card-glow-new"></div>
              
              <div className="card-content-new">
                <div className="card-header-new">
                  <div className="group-code-new" style={{ background: `${currentCategory.color}15`, color: currentCategory.color }}>
                    {group.code || group.irac_code || group.id?.split('-').pop()}
                  </div>
                  <div 
                    className="risk-dot-new" 
                    style={{ background: getRiskColor(group.resistance_risk_level) }}
                    title={group.resistance_risk_ar || 'مخاطر المقاومة'}
                  />
                </div>
                
                <h4 className="group-name-new">{group.name_ar}</h4>
                <p className="group-name-en-new">{group.name_en}</p>
                
                {/* المجموعة الكيميائية */}
                <div className="group-meta-new">
                  <span className="meta-label-new">🧪 المجموعة الكيميائية:</span>
                  <span className="meta-value-new">{group.chemical_class_ar || '—'}</span>
                </div>
                
                {/* آلية العمل */}
                <div className="group-moa-new">
                  <span className="moa-label-new">⚙️ آلية العمل:</span>
                  <p className="moa-text-new">{group.MoA_ar?.substring(0, 100)}...</p>
                </div>
                
                {/* طريقة التطبيق */}
                {group.application_method_ar && (
                  <div className="group-application-new">
                    <span className="app-label-new">💧 طريقة التطبيق:</span>
                    <span className="app-value-new">{group.application_method_ar}</span>
                  </div>
                )}
                
                {/* طيف المكافحة */}
                {group.spectrum_ar && (
                  <div className="group-spectrum-new">
                    <span className="spectrum-label-new">🎯 طيف المكافحة:</span>
                    <span className="spectrum-value-new">{group.spectrum_ar}</span>
                  </div>
                )}
                
                {/* معلومات المقاومة */}
                <div className="group-resistance-info-new">
                  <div className="resistance-item-new">
                    <span className="res-label-new">⚠️ مخاطر المقاومة:</span>
                    <span 
                      className="res-value-new" 
                      style={{ color: getRiskColor(group.resistance_risk_level) }}
                    >
                      {getRiskText(group.resistance_risk_ar)}
                    </span>
                  </div>
                  {group.resistance_mechanism_ar && (
                    <div className="resistance-item-new">
                      <span className="res-label-new">🔬 آلية المقاومة:</span>
                      <span className="res-value-new small">{group.resistance_mechanism_ar.substring(0, 60)}...</span>
                    </div>
                  )}
                </div>
                
                {/* التناوب */}
                {group.rotation_rule_ar && (
                  <div className="group-rotation-new">
                    <span className="rotation-label-new">🔄 التناوب:</span>
                    <span className="rotation-value-new">{group.rotation_rule_ar}</span>
                  </div>
                )}
                
                {/* معلومات إضافية */}
                <div className="group-extra-info-new">
                  {group.max_applications_season && (
                    <div className="extra-item-new">
                      <span>📊 الحد الأقصى:</span>
                      <span>{group.max_applications_season} مرة/موسم</span>
                    </div>
                  )}
                  {group.importance_egypt && (
                    <div className="extra-item-new">
                      <span>🇪🇬 الأهمية في مصر:</span>
                      <span>{group.importance_egypt}</span>
                    </div>
                  )}
                  {group.safety_class_ar && (
                    <div className="extra-item-new safety">
                      <span>⚠️ تصنيف السلامة:</span>
                      <span className="safety-text-new">{group.safety_class_ar}</span>
                    </div>
                  )}
                  {group.isPublicHealth && (
                    <div className="extra-item-new public-health-tag">
                      <span>🏥</span>
                      <span>صحة عامة</span>
                    </div>
                  )}
                </div>
                
                {/* تذييل البطاقة */}
                <div className="card-footer-new" style={{ justifyContent: "space-between" }}>
                  <div className="ai-count-new">
                    <span>🧪</span>
                    <span>{group.ai_count || group.active_ingredients?.length || 'متعدد'} مادة فعالة</span>
                  </div>
                  <div className="view-link-new">
                    عرض المواد
                    <span className="arrow-new">←</span>
                  </div>
                </div>
              </div>
              
              <div className="card-hover-effect-new"></div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="no-results-new glass">
            <div className="no-results-icon-new">🔍</div>
            <h3>لا توجد نتائج مطابقة</h3>
            <p>لم نتمكن من العثور على مجموعة تطابق "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')}>مسح البحث</button>
          </div>
        )}
      </div>

      {/* إحصائيات سريعة */}
      <div className="hub-stats-new">
        <div className="stat-card-new glass">
          <span className="stat-value-new">
            {Object.values(categories).reduce((sum, cat) => sum + cat.groups.length, 0)}
          </span>
          <span className="stat-label-new">مجموعة مبيدات</span>
        </div>
        <div className="stat-divider-new"></div>
        <div className="stat-card-new glass">
          <span className="stat-value-new">6</span>
          <span className="stat-label-new">أقسام رئيسية</span>
        </div>
        <div className="stat-divider-new"></div>
        <div className="stat-card-new glass">
          <span className="stat-value-new">🧪</span>
          <span className="stat-label-new">مواد فعالة متنوعة</span>
        </div>
      </div>
    </div>
  );
};

export default PesticidesHub;