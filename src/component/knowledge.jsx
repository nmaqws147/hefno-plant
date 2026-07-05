// components/knowledge/KnowledgeBase.jsx
import { useNavigate } from 'react-router-dom';
import './knowledge.css';
import { Helmet } from 'react-helmet-async';

const KnowledgeBase = () => {
  const navigate = useNavigate();

  const basicsData = [
        {
      id: 'pesticides',
      icon: '🛡️',
      title: 'المبيدات الزراعية',
      description: 'مجموعة متكاملة من المبيدات الفعالة وطرق الاستخدام الآمن',
      count: '150+',
      countLabel: 'مبيد',
      color: '#2D6A4F',
      bgPattern: 'pesticide-pattern',
      details: [
        'مبيدات حشرية',
        'مبيدات فطرية',
        'مبيدات أعشاب'
      ]
    },
    {
      id: 'insects',
      icon: '🐛',
      title: 'الحشرات الضارة',
      description: 'دليل شامل للتعرف على الحشرات الضارة وطرق المكافحة المتكاملة',
      count: '85+',
      countLabel: 'حشرة',
      color: '#8B5A2B',
      bgPattern: 'insect-pattern',
      details: [
        'حشرات ماصة',
        'حشرات قارضة',
        'مكافحة متكاملة'
      ]
    },
    {
      id: 'diseases',
      icon: '🌡️',
      title: 'الأمراض النباتية',
      description: 'تشخيص دقيق وعلاج فعال للأمراض النباتية مع خطوات الوقاية',
      count: '190+',
      countLabel: 'مرض',
      color: '#C44536',
      bgPattern: 'disease-pattern',
      details: [
        'أمراض فطرية',
        'أمراض بكتيرية',
        'أمراض فيروسية',
        'أمراض نيماتوديه',
        'أمراض فسيولوجيه',
        'أمراض طفيليه',
      ]
    }
  ]

  const sections = [
    {
      id: 'calendar',
      title: 'التقويم الزراعي المصري',
      title_en: 'Agricultural Calendar',
      description: 'دليل شهري شامل لما تزرعه وما تعمله في كل شهر في مصر',
      icon: '📅',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b98115, #10b98105)',
      path: '/knowledge-base/calendar',
      stats: { value: '12 شهر', label: 'دليل شهري' },
      tags: ['زراعة', 'حصاد', 'تسميد', 'تنبيهات']
    },
    // {
    //   id: "presentation-hub",
    //   title: "العروض التقديمية والتقارير",
    //   title_en: "Presentations & Reports",
    //   description: "استكشف العروض التقديمية التعليمية، تقارير نمو النباتات، والنتائج التحليلية لمشروع هفنوبلانت",
    //   icon: "📊",
    //   color: "#2e7d32",
    //   bgGradient: "linear-gradient(135deg, #2e7d3215, #2e7d3205)",
    //   path: "/knowledge-base/resources",
    //   stats: { "value": "12 ملف", "label": "عرض تقديمي" },
    //   tags: ["تقارير نمو", "تحليل بصري", "إحصائيات", "عرض تعليمي"]
    // },
    
    {
      id: 'plant-elements',
      title: 'العناصر الغذائية للنبات',
      title_en: 'Plant Essential Nutrients',
      description: 'دليل شامل للعناصر الكبرى والصغرى، وظائفها وأعراض النقص والعلاج',
      icon: '🧪',
      color: '#2D6A4F',
      bgGradient: 'linear-gradient(135deg, #2D6A4F15, #2D6A4F05)',
      path: '/knowledge-base/plant-elements',
      stats: { value: '16 عنصر', label: 'عنصر أساسي' },
      tags: ['نيتروجين', 'فوسفور', 'بوتاسيوم', 'عناصر صغرى']
    },
    {
      id: 'fertilizer',
      title: 'قاعدة بيانات الأسمدة',
      title_en: 'Fertilizers Database',
      description: 'دليل شامل للأسمدة الكيميائية والعضوية والحيوية مع طرق الاستخدام',
      icon: '🧴',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b15, #f59e0b05)',
      path: '/knowledge-base/fertilizer',
      stats: { value: '52+ سماد', label: 'نوع سماد' },
      tags: ['يوريا', 'سوبر فوسفات', 'سلفات بوتاسيوم', 'عضوي']
    },
    {
      id: 'soil-irri',
      title: 'التربة المصرية والري',
      title_en: 'Egyptian Soils & Irrigation',
      description: 'أنواع التربة المصرية وخصائصها، أنظمة الري، واحتياجات المحاصيل المائية',
      icon: '🌱',
      color: '#8b5a2b',
      bgGradient: 'linear-gradient(135deg, #8b5a2b15, #8b5a2b05)',
      path: '/knowledge-base/soil-irri',
      stats: { value: '6 أنواع', label: 'تربة مصرية' },
      tags: ['تربة طميية', 'تربة رملية', 'ري بالتنقيط', 'احتياجات مائية']
    },
    {
      id: 'weeds',
      title: 'الحشائش والأعشاب الضارة',
      title_en: 'Weeds & Weed Management',
      description: 'دليل شامل للحشائش الضارة بالمحاصيل المصرية، التعريف والتشخيص والمكافحة',
      icon: '🌿',
      color: '#5C4A1E',
      bgGradient: 'linear-gradient(135deg, #5C4A1E15, #5C4A1E05)',
      path: '/knowledge-base/weeds',
      stats: { value: '45+ نوع', label: 'حشيشة ضارة' },
      tags: ['نجيل شيطان', 'حلفا', 'سعد زراعة', 'هالوك']
    },
    {
      id: 'plants-crops',
      title: 'المحاصيل الزراعية',
      title_en: 'Plants & Crops Database',
      description: 'قاعدة بيانات شاملة للمحاصيل المصرية: قمح، أرز، ذرة، قطن، خضروات، فاكهة',
      icon: '🌾',
      color: '#2D6A4F',
      bgGradient: 'linear-gradient(135deg, #2D6A4F15, #2D6A4F05)',
      path: '/knowledge-base/plants-crops',
      stats: { value: '41+ محصول', label: 'نبات زراعي' },
      tags: ['قمح', 'أرز', 'ذرة', 'قطن', 'طماطم']
    },
    {
      id: 'academic',
      title: 'المراجع العلمية والمصطلحات',
      title_en: 'Academic References & Terminology',
      description: 'مرجع أكاديمي شامل للطلاب والمهندسين: مصطلحات، معادلات، مراجع موثقة، تصنيف نباتي',
      icon: '📚',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f615, #3b82f605)',
      path: '/knowledge-base/academic',
      stats: { value: '30+ مصطلح', label: 'مصطلح علمي' },
      tags: ['قاموس', 'معادلات', 'مراجع', 'تصنيف نباتي']
    },
    {
  id: 'fertilizer-planner',
  title: 'مخطط التسميد الذكي',
  title_en: 'AI Fertilization Planner',
  description: 'نظام متطور لتحليل احتياجات التربة وتصميم برامج تسميد مخصصة لكل محصول بناءً على المساحة والمناخ',
  icon: '🌱', // أو يمكنك استخدام '🧪' لإعطاء طابع كيميائي/تقني
  color: '#10b981', // لون أخضر زمردي جذاب
  bgGradient: 'linear-gradient(135deg, #10b98115, #10b98105)',
  path: '/program-planner', // المسار الذي يؤدي لبرنامج التسميد
  stats: { value: 'خطط دقيقة', label: 'مدعوم بالذكاء الاصطناعي' },
  tags: ['نيتروجين', 'فسفور', 'بوتاسيوم', 'توصيات ذكية']
}
  ];

  
  const handleCategoryClick = (categoryId) => {
    navigate(`/knowledge-base/${categoryId}`);
  };

  const handleViewAll = () => {
    navigate('/knowledge-base');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="knowledge-base-page" dir="rtl">
      <Helmet>
        <title>قاعدة المعرفة الزراعية | Hefno-Plant</title>
        <meta name="description" content="قاعدة المعرفة الزراعية الشاملة — أمراض النباتات، الحشرات، المبيدات، التسميد، التقويم الزراعي، وأكثر." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="knowledge-header">
        <div className="double-special-page-header">
          <div className="header-icon">
            <span>📚</span>
          </div>
          <div className="header-text">
            <h1>قاعدة المعرفة الزراعية</h1>
            <p className="header-subtitle">
              مكتبة شاملة للمعلومات الزراعية — كل ما تحتاجه في مكان واحد
            </p>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">7</span>
                <span className="stat-label">أقسام رئيسية</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">350+</span>
                <span className="stat-label">مادة علمية</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">دقة المعلومات</span>
              </div>
            </div>
          </div>
        </div>
      </div>

<div className="knowledge-grid">
  {/* دمج المصفوفتين basicsData و sections في خارطة واحدة */}
  {[...basicsData, ...sections].map((item) => (
    <div
      key={item.id}
      className="knowledge-card"
      onClick={() => item.path ? handleNavigate(item.path) : handleCategoryClick(item.id)}
      style={{ 
        '--card-color': item.color, 
        '--card-gradient': item.bgGradient || `linear-gradient(135deg, ${item.color}10, ${item.color}05)` 
      }}
    >
      {/* تأثيرات الخلفية الزجاجية واللمعان */}
      <div className="card-glass"></div>
      <div className="card-shine"></div>
      
      <div className="card-content">
        {/* رأس البطاقة: الأيقونة والإحصائيات */}
        <div className="card-header">
          <div className="card-icon-wrapper" style={{ background: `${item.color}15` }}>
            <span className="card-icon">{item.icon}</span>
            <div className="icon-glow" style={{ background: item.color }}></div>
          </div>
          
          <div className="card-stats-badge">
            <span className="stats-value">{item.stats?.value || item.count}</span>
            <span className="stats-label">{item.stats?.label || item.countLabel}</span>
          </div>
        </div>

        {/* النصوص: العناوين والوصف */}
        <div className="card-body">
          <h3 className="card-title">{item.title}</h3>
          {item.title_en && <p className="card-title-en">{item.title_en}</p>}
          <p className="card-description">{item.description}</p>
        </div>

        {/* الوسوم أو التفاصيل السريعة */}
        <div className="card-tags">
          {(item.tags || item.details || []).map((tag, idx) => (
            <span key={idx} className="tag" style={{ background: `${item.color}10`, color: item.color }}>
              <span className="tag-dot" style={{ background: item.color }}></span>
              {tag}
            </span>
          ))}
        </div>

        {/* تذييل البطاقة */}
        <div className="card-footer">
          <div className="card-link">
            استعرض المحتوى
            <svg className="link-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 10L5 10M15 10L11 14M15 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* تأثير الـ Hover الخارجي */}
      <div className="card-hover-effect"></div>
    </div>
  ))}
</div>
      

      {/* إحصائيات إضافية */}
      <div className="knowledge-stats">
        <div className="stats-container">
          <div className="stat-block">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-number-large">150+</span>
              <span className="stat-label-large">مادة علمية</span>
            </div>
          </div>
          <div className="stat-block">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <span className="stat-number-large">98%</span>
              <span className="stat-label-large">دقة المعلومات</span>
            </div>
          </div>
          <div className="stat-block">
            <span className="stat-icon">👨‍🌾</span>
            <div className="stat-info">
              <span className="stat-number-large">5000+</span>
              <span className="stat-label-large">مزارع مستفيد</span>
            </div>
          </div>
          <div className="stat-block">
            <span className="stat-icon">📚</span>
            <div className="stat-info">
              <span className="stat-number-large">7</span>
              <span className="stat-label-large">أقسام رئيسية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;