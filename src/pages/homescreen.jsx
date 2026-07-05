// components/HomeScreen.jsx
import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import ContactSection from '../component/contact';
import { Devider } from '../component/divider';
import FeaturesSection from '../component/fetures';
import HeroSection from '../component/hero';
import KnowledgePreview from '../component/knowledgePreview';
import agricultureData from '../data';
import './homeScreen.css';
import { Helmet } from 'react-helmet-async';

const HomeScreen = ({ id }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item, category) => {
    setSelectedItem({...item, category});
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="home-screen" id={id}>
        <div className="skeleton-loader" style={{height: '100px', borderRadius: '20px', marginBottom: '30px'}}></div>
        <div className="quick-actions">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-loader feature-card" style={{height: '200px'}}></div>
          ))}
        </div>
      </div>
    );
  }

  // صفحة التفاصيل الخاصة بكل فئة
  if (selectedCategory) {
    return (
      <div className={`home-screen`} id={id} dir="rtl">
        <div className="category-detail-page">
          <div className="page-header">
            <button className="back-button" onClick={handleBackToCategories}>
              ← العودة
            </button>
            <h2 className="page-title">
              {selectedCategory === 'pesticides' && '🛡️ المبيدات الزراعية'}
              {selectedCategory === 'insects' && '🐛 الحشرات الضارة'}
              {selectedCategory === 'diseases' && '🌡️ الأمراض النباتية'}
            </h2>
            <p className="page-subtitle">
              {selectedCategory === 'pesticides' && 'مجموعة شاملة من المبيدات الزراعية وطرق استخدامها'}
              {selectedCategory === 'insects' && 'تعرف على الحشرات الضارة وطرق مكافحتها'}
              {selectedCategory === 'diseases' && 'تشخيص وعلاج الأمراض النباتية المختلفة'}
            </p>
          </div>

          <div className="items-grid">
            {agricultureData[selectedCategory].map((item, index) => (
              <div 
                key={item.id}
                className="item-card"
                onClick={() => handleItemClick(item, selectedCategory)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="card-icon">
                    {selectedCategory === 'pesticides' && '🛡️'}
                    {selectedCategory === 'insects' && '🐛'}
                    {selectedCategory === 'diseases' && '🌡️'}
                  </div>
                  <div className="card-title-section">
                    <h3 className="card-title">{item.name}</h3>
                    <span className={`severity-badge severity-${item.severity}`}>
                      {item.severity === 'high' ? 'خطير' : item.severity === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                </div>
                
                <p className="card-description">{item.description}</p>
                
                <div className="card-footer">
                  <div className="treatment-preview">
                    {item.treatment}
                  </div>
                  <div className="card-arrow">→</div>
                </div>
                
                <div className="card-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal للتفاصيل الكاملة */}
        {selectedItem && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              
              <div className="modal-header">
                <div className="modal-icon">
                  {selectedItem.category === 'pesticides' && '🛡️'}
                  {selectedItem.category === 'insects' && '🐛'}
                  {selectedItem.category === 'diseases' && '🌡️'}
                </div>
                <div className="modal-title-section">
                  <h2>{selectedItem.name}</h2>
                  <span className={`modal-severity severity-${selectedItem.severity}`}>
                    {selectedItem.severity === 'high' ? 'خطورة عالية' : selectedItem.severity === 'medium' ? 'خطورة متوسطة' : 'خطورة منخفضة'}
                  </span>
                </div>
              </div>

              <div className="modal-body">
                <div className="info-section">
                  <h3>📝 الوصف</h3>
                  <p>{selectedItem.fullDescription}</p>
                </div>

                <div className="info-section">
                  <h3>💊 طريقة العلاج</h3>
                  <p>{selectedItem.treatment}</p>
                </div>

                {selectedItem.usage && (
                  <div className="info-section">
                    <h3>⚡ طريقة الاستخدام</h3>
                    <p>{selectedItem.usage}</p>
                  </div>
                )}

                {selectedItem.precautions && (
                  <div className="info-section">
                    <h3>⚠️ الاحتياطات</h3>
                    <p>{selectedItem.precautions}</p>
                  </div>
                )}

                {selectedItem.effectiveness && (
                  <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">الفعالية</span>
                        <span className="info-value">{selectedItem.effectiveness}</span>
                      </div>
                  </div>
                )}

                {selectedItem.lifecycle && (
                  <div className="info-section">
                    <h3>🔄 دورة الحياة</h3>
                    <p>{selectedItem.lifecycle}</p>
                  </div>
                )}

                {selectedItem.symptoms && (
                  <div className="info-section">
                    <h3>🔍 الأعراض</h3>
                    <p>{selectedItem.symptoms}</p>
                  </div>
                )}

                <div className="action-buttons">
                  <button className="action-btn primary">حفظ في المفضلة</button>
                  <button className="action-btn secondary">مشاركة</button>
                  <button className="action-btn outline">طباعة</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // الصفحة الرئيسية
  return (
    <div className={`home-screen`} id={id} dir="rtl">
      <Helmet>
        <title>Hefno-Plant | خبيرك الزراعي الذكي</title>
        <meta name="description" content="منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي — دليل المبيدات، التقويم الزراعي، الطقس، وأكثر." />
      </Helmet>

      <HeroSection />

      <Devider/>

      <FeaturesSection />

      <Devider />

      <KnowledgePreview />

      <Devider />

      <ContactSection />
    </div>
  );
};

export default HomeScreen;