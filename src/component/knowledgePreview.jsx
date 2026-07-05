// components/home/KnowledgePreview.jsx
import { useNavigate } from 'react-router-dom';
import './knowledgePreview.css';

const KnowledgePreview = () => {
  const navigate = useNavigate();

  const categories = [
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
  ];

  const handleCategoryClick = (categoryId) => {
    navigate(`/knowledge-base/${categoryId}`);
  };

  const handleViewAll = () => {
    navigate('/knowledge-base');
  };

  return (
    <section className="hefno-knowledge-preview" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="hefno-knowledge-bg">
        <div className="hefno-knowledge-glow"></div>
        <div className="hefno-knowledge-particles"></div>
      </div>

      <div className="hefno-knowledge-container">
        {/* عنوان القسم */}
        <div className="hefno-knowledge-header">
          <div className="">
            <span className="hefno-features-title">قاعدة المعرفة</span>
          </div>
          <p className="hefno-features-subtitle">
            مكتبة شاملة للمبيدات والحشرات والأمراض النباتية مع تحديثات مستمرة
          </p>
        </div>

        {/* بطاقات المعرفة */}
        <div className="hefno-knowledge-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`hefno-knowledge-card hefno-${category.bgPattern}`}
              onClick={() => handleCategoryClick(category.id)}
              style={{ '--card-accent': category.color }}
            >
              {/* خلفية زجاجية */}
              <div className="hefno-knowledge-card-glass"></div>
              
              {/* زخرفة خلفية */}
              <div className="hefno-card-pattern"></div>
              
              {/* محتوى البطاقة */}
              <div className="hefno-knowledge-card-content">
                {/* رأس البطاقة */}
                <div className="hefno-card-header">
                  <div className="hefno-card-icon-wrapper">
                    <span className="hefno-card-icon">{category.icon}</span>
                    <div className="hefno-icon-glow" style={{ background: category.color }}></div>
                  </div>
                  <div className="hefno-card-badge">
                    <span className="hefno-badge-count">{category.count}</span>
                    <span className="hefno-badge-label">{category.countLabel}</span>
                  </div>
                </div>

                {/* عنوان ووصف */}
                <h3 className="hefno-card-title">{category.title}</h3>
                <p className="hefno-card-description">{category.description}</p>

                {/* تفاصيل سريعة */}
                <div className="hefno-card-details">
                  {category.details.map((detail, index) => (
                    <div key={index} className="hefno-detail-tag">
                      <span className="hefno-detail-dot" style={{ background: category.color }}></span>
                      <span className="hefno-detail-text">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* زر السهم */}
                <div className="hefno-card-footer">
                  <span className="hefno-card-link">
                    استعرض
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 10L5 10M15 10L11 14M15 10L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* تأثيرات hover */}
              <div className="hefno-card-hover-effect"></div>
              <div className="hefno-card-shine"></div>
            </div>
          ))}
        </div>

        {/* زر عرض الكل */}
        <div className="hefno-knowledge-footer">
          <button className="hefno-view-all-btn" onClick={handleViewAll}>
            <span>استعرض قاعدة المعرفة كاملة</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* إحصائيات سريعة إضافية */}
        <div className="hefno-knowledge-stats">
          <div className="hefno-stat-item">
            <span className="hefno-stat-value">350+</span>
            <span className="hefno-stat-label">مادة علمية</span>
          </div>
          <div className="hefno-stat-divider"></div>
          <div className="hefno-stat-item">
            <span className="hefno-stat-value">98%</span>
            <span className="hefno-stat-label">دقة المعلومات</span>
          </div>
          <div className="hefno-stat-divider"></div>
          <div className="hefno-stat-item">
            <span className="hefno-stat-value">24/7</span>
            <span className="hefno-stat-label">تحديث مستمر</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgePreview;