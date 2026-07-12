// components/HomeScreen.jsx
import { useState } from 'react';
import {
  Shield, Bug, Thermometer, FlaskConical,
  Activity, AlertTriangle, Bookmark, Share2, Printer, ArrowRight, X
} from 'lucide-react';
import ContactSection from '../component/contact';
import Services from '../component/services';
import HeroSection from '../component/hero';
import KnowledgePreview from '../component/knowledgePreview';
import agricultureData from '../data';
import './homeScreen.css';
import { Helmet } from 'react-helmet-async';

const HomeScreen = ({ id }) => {
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

  const categoryIcon = (cat) => {
    if (cat === 'pesticides') return <Shield size={20} className="text-emerald-600" />;
    if (cat === 'insects') return <Bug size={20} className="text-emerald-600" />;
    return <Thermometer size={20} className="text-emerald-600" />;
  };

  const categoryTitle = (cat) => {
    if (cat === 'pesticides') return 'المبيدات الزراعية';
    if (cat === 'insects') return 'الحشرات الضارة';
    return 'الأمراض النباتية';
  };

  const categorySubtitle = (cat) => {
    if (cat === 'pesticides') return 'مجموعة شاملة من المبيدات الزراعية وطرق استخدامها';
    if (cat === 'insects') return 'تعرف على الحشرات الضارة وطرق مكافحتها';
    return 'تشخيص وعلاج الأمراض النباتية المختلفة';
  };

  if (selectedCategory) {
    return (
      <div className="home-screen" id={id} dir="rtl">
        <div className="category-detail-page">
          <div className="page-header">
            <button className="back-button" onClick={handleBackToCategories}>
              <ArrowRight size={16} className="inline ml-1" /> العودة
            </button>
            <h2 className="page-title inline-flex items-center gap-2">
              {categoryIcon(selectedCategory)} {categoryTitle(selectedCategory)}
            </h2>
            <p className="page-subtitle">{categorySubtitle(selectedCategory)}</p>
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
                    {categoryIcon(selectedCategory)}
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
                  <div className="card-arrow"><ArrowRight size={14} /></div>
                </div>

                <div className="card-hover-effect" />
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleCloseModal}><X size={20} /></button>

                <div className="modal-header">
                  <div className="modal-icon">
                    {categoryIcon(selectedItem.category)}
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
                    <h3 className="flex items-center gap-1.5"><Activity size={16} /> الوصف</h3>
                    <p>{selectedItem.fullDescription}</p>
                  </div>

                  <div className="info-section">
                    <h3 className="flex items-center gap-1.5"><FlaskConical size={16} /> طريقة العلاج</h3>
                    <p>{selectedItem.treatment}</p>
                  </div>

                  {selectedItem.usage && (
                    <div className="info-section">
                      <h3 className="flex items-center gap-1.5"><AlertTriangle size={16} /> طريقة الاستخدام</h3>
                      <p>{selectedItem.usage}</p>
                    </div>
                  )}

                  {selectedItem.precautions && (
                    <div className="info-section">
                      <h3 className="flex items-center gap-1.5"><AlertTriangle size={16} /> الاحتياطات</h3>
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
                      <h3 className="flex items-center gap-1.5"><Activity size={16} /> دورة الحياة</h3>
                      <p>{selectedItem.lifecycle}</p>
                    </div>
                  )}

                  {selectedItem.symptoms && (
                    <div className="info-section">
                      <h3 className="flex items-center gap-1.5"><AlertTriangle size={16} /> الأعراض</h3>
                      <p>{selectedItem.symptoms}</p>
                    </div>
                  )}

                  <div className="action-buttons flex gap-2 mt-4">
                    <button className="action-btn primary inline-flex items-center gap-1.5"><Bookmark size={14} /> حفظ في المفضلة</button>
                    <button className="action-btn secondary inline-flex items-center gap-1.5"><Share2 size={14} /> مشاركة</button>
                    <button className="action-btn outline inline-flex items-center gap-1.5"><Printer size={14} /> طباعة</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen" id={id} dir="rtl">
      <Helmet>
        <title>Hefno-Plant | خبيرك الزراعي الذكي</title>
        <meta name="description" content="منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي — دليل المبيدات، التقويم الزراعي، الطقس، وأكثر." />
      </Helmet>

      <HeroSection />

      <Services />

      <KnowledgePreview />

      <ContactSection />
    </div>
  );
};

export default HomeScreen;