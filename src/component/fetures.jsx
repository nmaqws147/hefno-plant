// components/home/FeaturesSection.jsx
import { useNavigate } from 'react-router-dom';
import './features.css';

const FeaturesSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'hefno-scan-plant',
      icon: '📸',
      title: 'فحص النبات',
      description: 'تشخيص فوري لأمراض النباتات بدقة عالية باستخدام الذكاء الاصطناعي',
      color: '#2D6A4F',
      page: '/diagnose'
    },
    {
      id: 'hefno-knowledge-base',
      icon: '📚',
      title: 'قاعدة المعرفة',
      description: 'مكتبة شاملة للمبيدات والحشرات والأمراض النباتية',
      color: '#4CAF50',
      page: '/knowledge-base'
    },
    {
      id: 'hefno-weather',
      icon: '🌤️',
      title: 'الطقس',
      description: 'تحديثات الطقس اليومية وتأثيرها على المحاصيل الزراعية',
      color: '#64d2ff',
      page: '/weather'
    },
    {
      id: 'hefno-ai-chat',
      icon: '🤖',
      title: 'التحدث مع الذكاء الاصطناعي',
      description: 'استشارات فورية والتحقق من المعلومات الزراعية',
      color: '#9c6bff',
      page: '/ai-chat'
    }
  ];

  const handleFeatureClick = (page) => {
    navigate(page);
  };

  return (
    <section className="hefno-features-section" dir="rtl">
      {/* خلفية زجاجية */}
      <div className="hefno-features-bg">
        <div className="hefno-features-glow"></div>
        <div className="hefno-features-particles"></div>
      </div>

      <div className="hefno-features-container">
        {/* عنوان القسم */}
        <div className="hefno-features-header">
          <h2 className="hefno-features-title">
            خدماتنا الذكية
            <span className="hefno-title-badge">AI-POWERED</span>
          </h2>
          <p className="hefno-features-subtitle">
            كل ما تحتاجه لحماية محاصيلك وتحسين إنتاجيتك في مكان واحد
          </p>
        </div>

        {/* بطاقات الميزات */}
        <div className="hefno-features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="hefno-feature-card"
              onClick={() => handleFeatureClick(feature.page)}
              style={{ '--card-color': feature.color }}
            >
              <div className="hefno-card-glass"></div>
              
              {/* أيقونة متحركة */}
              <div className="hefno-card-icon-wrapper">
                <div className="hefno-card-icon">{feature.icon}</div>
                <div className="hefno-icon-glow" style={{ background: feature.color }}></div>
              </div>

              {/* المحتوى */}
              <div className="hefno-card-content">
                <h3 className="hefno-card-title">{feature.title}</h3>
                <p className="hefno-card-description">{feature.description}</p>
              </div>

              {/* زر السهم */}
              <div className="hefno-card-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              {/* تأثيرات hover */}
              <div className="hefno-card-hover-effect"></div>
              <div className="hefno-card-shine"></div>
            </div>
          ))}
        </div>

        {/* إحصائيات سريعة */}
        <div className="hefno-features-stats">
          <div className="hefno-stat-card">
            <span className="hefno-stat-number">+50</span>
            <span className="hefno-stat-label">نوع نبات</span>
          </div>
          <div className="hefno-stat-card">
            <span className="hefno-stat-number">98%</span>
            <span className="hefno-stat-label">دقة التشخيص</span>
          </div>
          <div className="hefno-stat-card">
            <span className="hefno-stat-number">24/7</span>
            <span className="hefno-stat-label">دعم فوري</span>
          </div>
          <div className="hefno-stat-card">
            <span className="hefno-stat-number">+150</span>
            <span className="hefno-stat-label">مادة علمية</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;