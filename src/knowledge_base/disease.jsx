// components/knowledge/DiseasesPage.jsx
import { useNavigate } from 'react-router-dom';
import { diseaseGroups } from '../disease-folder/all_diseases';
import './disease.css';

const DiseasesPage = () => {
  const navigate = useNavigate();

  // بيانات التصنيفات الرئيسية
  const diseaseCategories = diseaseGroups

  const handleCategoryClick = (categoryId) => {
    navigate(`/knowledge-base/diseases/${categoryId}`);
  };

  return (
    <div className="diseases-page  " dir="rtl">
      {/* خلفية زخرفية */}
      <div className="diseases-bg">
        <div className="bg-glow"></div>
        <div className="bg-particles"></div>
        <div className="bg-leaves"></div>
      </div>

      {/* رأس الصفحة */}
      <div className="diseases-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🩺</span>
          </div>
          <div className="header-text">
            <h1>الأمراض النباتية</h1>
            <p className="header-en">Plant Diseases</p>
            <p className="header-description">
              دليل شامل للأمراض التي تصيب النباتات، مقسمة حسب نوع المسبب المرضي
            </p>
          </div>
        </div>
      </div>

      {/* شبكة التصنيفات */}
      <div className="categories-grid">
        {diseaseCategories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.id)}
            style={{ '--card-color': category.color }}
          >
            <div className="card-glass"></div>
            
            <div className="card-content">
              <div className="card-icon-wrapper" style={{ background: `${category.color}50` }}>
                <span className="card-icon">{category.icon}</span>
              </div>
              
              <h3 className="card-title" style={{ color: `${category.color}` }}>{category.name_ar}</h3>
              <p className="card-name-en" style={{ color: `${category.color}` }}>{category.name_en}</p>
              
              <p className="card-description">{category.description}</p>
              
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-value">{category.pathogens_count}</span>
                  <span className="stat-label">مسبب مرضي</span>
                </div>
              </div>
              
              <div className="card-short-desc">
                <span className="short-dot" style={{ background: category.color }}></span>
                <span className="short-text">{category.shortDesc.substring(0, 80)}...</span>
              </div>
              
              <div className="card-footer">
                <span className="card-link">
                  استعرض الأمراض
                  <span className="link-arrow">→</span>
                </span>
              </div>
            </div>
            
            <div className="card-hover-effect"></div>
            <div className="card-shine"></div>
          </div>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="diseases-stats">
        <div className="stat-card">
          <span className="stat-number">82+</span>
          <span className="stat-label">مرض نباتي</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">5</span>
          <span className="stat-label">تصنيفات رئيسية</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">98%</span>
          <span className="stat-label">دقة المعلومات</span>
        </div>
      </div>
    </div>
  );
};

export default DiseasesPage;