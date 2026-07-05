// components/knowledge/ResourcesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './resources.css';
import { Helmet } from 'react-helmet-async';

const ResourcesPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // بيانات الموارد (PDFs والعروض التقديمية)
  const resources = [
    // ===== PDFs =====
    {
      id: 'pdf-001',
      title: 'دليل التسميد المتكامل للمحاصيل الحقلية',
      title_en: 'Integrated Fertilization Guide for Field Crops',
      type: 'pdf',
      category: 'fertilization',
      size: '2.4 MB',
      pages: 45,
      date: '2024-01-15',
      author: 'مركز البحوث الزراعية',
      description: 'دليل شامل لبرامج التسميد لمحاصيل القمح والذرة والأرز والقطن',
      downloadUrl: '/resources/pdf/fertilization-guide.pdf',
      previewUrl: '/resources/pdf/fertilization-guide.pdf',
      tags: ['تسميد', 'محاصيل حقلية', 'نيتروجين', 'فوسفور', 'بوتاسيوم']
    },
    {
      id: 'pdf-002',
      title: 'دليل مكافحة الآفات الزراعية',
      title_en: 'Agricultural Pest Control Guide',
      type: 'pdf',
      category: 'pests',
      size: '3.1 MB',
      pages: 78,
      date: '2024-02-10',
      author: 'وزارة الزراعة المصرية',
      description: 'دليل شامل للتعرف على الآفات الزراعية وطرق مكافحتها المتكاملة',
      downloadUrl: './resources/pdf/pest-control.pdf',
      previewUrl: '/resources/pdf/pest-control.pdf',
      tags: ['آفات', 'مبيدات', 'مكافحة متكاملة', 'حشرات']
    },
    {
      id: 'pdf-003',
      title: 'دليل تحليل التربة وتفسير النتائج',
      title_en: 'Soil Analysis Guide',
      type: 'pdf',
      category: 'soil',
      size: '1.8 MB',
      pages: 32,
      date: '2023-11-20',
      author: 'معهد بحوث الأراضي',
      description: 'كيفية أخذ عينات التربة وتحليل النتائج وتفسيرها',
      downloadUrl: '/resources/pdf/soil-analysis.pdf',
      previewUrl: '/resources/pdf/soil-analysis.pdf',
      tags: ['تربة', 'تحليل', 'pH', 'عناصر غذائية']
    },
    {
      id: 'pdf-004',
      title: 'دليل الري الحديث للخضروات',
      title_en: 'Modern Irrigation Guide for Vegetables',
      type: 'pdf',
      category: 'irrigation',
      size: '2.2 MB',
      pages: 56,
      date: '2024-03-05',
      author: 'مركز البحوث الزراعية',
      description: 'أنظمة الري الحديثة واحتياجات الخضروات المائية',
      downloadUrl: '/resources/pdf/vegetable-irrigation.pdf',
      previewUrl: '/resources/pdf/vegetable-irrigation.pdf',
      tags: ['ري', 'تنقيط', 'خضروات', 'توفير مياه']
    },
    {
      id: 'pdf-005',
      title: 'دليل العناصر الغذائية للنبات',
      title_en: 'Plant Nutrients Guide',
      type: 'pdf',
      category: 'nutrition',
      size: '1.5 MB',
      pages: 28,
      date: '2024-01-25',
      author: 'قسم تغذية النبات',
      description: 'الوظائف، أعراض النقص، والعلاج لجميع العناصر الغذائية',
      downloadUrl: '/resources/pdf/plant-nutrients.pdf',
      previewUrl: '/resources/pdf/plant-nutrients.pdf',
      tags: ['تغذية', 'عناصر كبرى', 'عناصر صغرى', 'نقص']
    },
    {
      id: 'pdf-006',
      title: 'دليل إدارة الحشائش في مصر',
      title_en: 'Weed Management Guide in Egypt',
      type: 'pdf',
      category: 'weeds',
      size: '4.2 MB',
      pages: 92,
      date: '2023-12-10',
      author: 'قسم أبحاث الحشائش',
      description: 'أنواع الحشائش الضارة وطرق مكافحتها في المحاصيل المختلفة',
      downloadUrl: '/resources/pdf/weed-management.pdf',
      previewUrl: '/resources/pdf/weed-management.pdf',
      tags: ['حشائش', 'مبيدات', 'مكافحة', 'نجيل']
    },

    // ===== Presentations =====
    {
      id: 'pres-001',
      title: 'التسميد الذكي باستخدام الذكاء الاصطناعي',
      title_en: 'Smart Fertilization with AI',
      type: 'presentation',
      category: 'technology',
      size: '5.7 MB',
      slides: 42,
      date: '2024-02-20',
      author: 'د. أحمد محمد',
      description: 'عرض تقديمي عن استخدام الذكاء الاصطناعي في تحسين كفاءة التسميد',
      downloadUrl: '/resources/presentation/ai-fertilization.pptx',
      previewUrl: '/resources/presentation/ai-fertilization.pdf',
      tags: ['ذكاء اصطناعي', 'تسميد ذكي', 'تكنولوجيا']
    },
    {
      id: 'pres-002',
      title: 'المكافحة المتكاملة للآفات',
      title_en: 'Integrated Pest Management',
      type: 'presentation',
      category: 'pests',
      size: '6.1 MB',
      slides: 58,
      date: '2024-01-18',
      author: 'د. محمود حسن',
      description: 'استراتيجيات المكافحة المتكاملة للآفات الزراعية',
      downloadUrl: '/resources/presentation/ipm.pptx',
      previewUrl: '/resources/presentation/ipm.pdf',
      tags: ['IPM', 'مكافحة', 'آفات', 'مبيدات']
    },
    {
      id: 'pres-003',
      title: 'الزراعة العضوية في مصر',
      title_en: 'Organic Farming in Egypt',
      type: 'presentation',
      category: 'organic',
      size: '4.8 MB',
      slides: 35,
      date: '2024-03-01',
      author: 'د. سامي إبراهيم',
      description: 'أساسيات الزراعة العضوية والممارسات المثلى',
      downloadUrl: '/resources/presentation/organic-farming.pptx',
      previewUrl: '/resources/presentation/organic-farming.pdf',
      tags: ['عضوي', 'سماد عضوي', 'ممارسات زراعية']
    },
    {
      id: 'pres-004',
      title: 'إدارة المياه في الزراعة المصرية',
      title_en: 'Water Management in Egyptian Agriculture',
      type: 'presentation',
      category: 'irrigation',
      size: '3.9 MB',
      slides: 48,
      date: '2024-02-05',
      author: 'د. خالد عبدالله',
      description: 'استراتيجيات ترشيد استهلاك المياه في الزراعة',
      downloadUrl: '/resources/presentation/water-management.pptx',
      previewUrl: '/resources/presentation/water-management.pdf',
      tags: ['مياه', 'ري', 'ترشيد', 'تنقيط']
    }
  ];

  const categories = [
    { id: 'all', name: 'الكل', icon: '📚', count: resources.length },
    { id: 'pdf', name: 'ملفات PDF', icon: '📄', count: resources.filter(r => r.type === 'pdf').length },
    { id: 'presentation', name: 'عروض تقديمية', icon: '📊', count: resources.filter(r => r.type === 'presentation').length },
    { id: 'fertilization', name: 'تسميد', icon: '🧪', count: resources.filter(r => r.category === 'fertilization').length },
    { id: 'pests', name: 'آفات', icon: '🐛', count: resources.filter(r => r.category === 'pests').length },
    { id: 'soil', name: 'تربة', icon: '🌱', count: resources.filter(r => r.category === 'soil').length },
    { id: 'irrigation', name: 'ري', icon: '💧', count: resources.filter(r => r.category === 'irrigation').length }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || 
      resource.type === activeCategory || 
      resource.category === activeCategory;
    const matchesSearch = resource.title.includes(searchQuery) || 
      resource.description.includes(searchQuery) ||
      resource.tags.some(tag => tag.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  const handleDownload = (url, title) => {
    // في التطبيق الفعلي، يمكنك استخدام رابط التحميل الفعلي
    window.open(url, '_blank');
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📄';
    return '📊';
  };

  const getFileColor = (type) => {
    if (type === 'pdf') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="resources-page" dir="rtl">
      <Helmet>
        <title>الموارد الزراعية | Hefno-Plant</title>
        <meta name="description" content="الموارد والأدوات الزراعية المساعدة — روابط مفيدة، منشورات، ومواد تعليمية للمزارعين والمهتمين." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="resources-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>📚</span>
          </div>
          <div className="header-text">
            <h1>المكتبة الزراعية</h1>
            <p className="header-en">Agricultural Library</p>
            <p className="header-description">
              دليلك الشامل للملفات التعليمية والعروض التقديمية في المجال الزراعي
            </p>
            <div className="stats-badge">
              <span className="stat-badge">📄 {resources.filter(r => r.type === 'pdf').length} ملف PDF</span>
              <span className="stat-badge">📊 {resources.filter(r => r.type === 'presentation').length} عرض تقديمي</span>
              <span className="stat-badge">📚 {resources.length} مادة علمية</span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="ابحث عن ملف أو عرض تقديمي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="categories-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="filter-icon">{category.icon}</span>
              <span className="filter-name">{category.name}</span>
              <span className="filter-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* شبكة الموارد */}
      <div className="resources-grid">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="resource-card"
            onClick={() => handleResourceClick(resource)}
          >
            <div className="card-glass"></div>
            
            <div className="card-content">
              <div className="card-header">
                <div className="file-icon" style={{ background: `${getFileColor(resource.type)}15` }}>
                  <span>{getFileIcon(resource.type)}</span>
                </div>
                <div className="file-type-badge" style={{ background: `${getFileColor(resource.type)}10`, color: getFileColor(resource.type) }}>
                  {resource.type === 'pdf' ? 'PDF' : 'عرض تقديمي'}
                </div>
              </div>

              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-title-en">{resource.title_en}</p>
              <p className="resource-description">{resource.description.substring(0, 100)}...</p>

              <div className="resource-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">{resource.date.split('-').reverse().join('/')}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <span className="meta-text">{resource.author}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">💾</span>
                  <span className="meta-text">{resource.size}</span>
                </div>
                {resource.pages && (
                  <div className="meta-item">
                    <span className="meta-icon">📄</span>
                    <span className="meta-text">{resource.pages} صفحة</span>
                  </div>
                )}
                {resource.slides && (
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    <span className="meta-text">{resource.slides} شريحة</span>
                  </div>
                )}
              </div>

              <div className="resource-tags">
                {resource.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>

              <div className="card-footer">
                <button 
                  className="download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(resource.downloadUrl, resource.title);
                  }}
                >
                  <span>📥</span> تحميل
                </button>
                <div className="card-link">
                  معاينة
                  <span className="link-arrow">←</span>
                </div>
              </div>
            </div>

            <div className="card-hover-effect"></div>
            <div className="card-shine"></div>
          </div>
        ))}
      </div>

      {/* حالة عدم وجود نتائج */}
      {filteredResources.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>لا توجد نتائج</h3>
          <p>لم يتم العثور على ملفات تطابق بحثك</p>
          <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            عرض جميع الملفات
          </button>
        </div>
      )}

      {/* إحصائيات سريعة */}
      <div className="resources-stats">
        <div className="stat-card">
          <span className="stat-value">{resources.filter(r => r.type === 'pdf').length}</span>
          <span className="stat-label">ملف PDF</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-value">{resources.filter(r => r.type === 'presentation').length}</span>
          <span className="stat-label">عرض تقديمي</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-value">{resources.reduce((sum, r) => sum + (r.pages || r.slides || 0), 0)}</span>
          <span className="stat-label">صفحة/شريحة</span>
        </div>
      </div>

      {/* Modal لعرض تفاصيل المورد */}
      {showModal && selectedResource && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="resource-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ background: `${getFileColor(selectedResource.type)}15` }}>
                <span>{getFileIcon(selectedResource.type)}</span>
              </div>
              <div className="modal-title">
                <h2>{selectedResource.title}</h2>
                <p className="modal-subtitle">{selectedResource.title_en}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>📝 وصف المورد</h3>
                <p>{selectedResource.description}</p>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">المؤلف:</span>
                  <span className="info-value">{selectedResource.author}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">تاريخ النشر:</span>
                  <span className="info-value">{selectedResource.date.split('-').reverse().join('/')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">الحجم:</span>
                  <span className="info-value">{selectedResource.size}</span>
                </div>
                {selectedResource.pages && (
                  <div className="info-item">
                    <span className="info-label">عدد الصفحات:</span>
                    <span className="info-value">{selectedResource.pages}</span>
                  </div>
                )}
                {selectedResource.slides && (
                  <div className="info-item">
                    <span className="info-label">عدد الشرائح:</span>
                    <span className="info-value">{selectedResource.slides}</span>
                  </div>
                )}
              </div>

              <div className="tags-section">
                <h3>🏷️ الكلمات المفتاحية</h3>
                <div className="tags-list">
                  {selectedResource.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="preview-section">
                <h3>📄 معاينة</h3>
                <div className="preview-placeholder">
                  <span className="preview-icon">{getFileIcon(selectedResource.type)}</span>
                  <p>{selectedResource.title}</p>
                  <small>{selectedResource.type === 'pdf' ? 'ملف PDF' : 'عرض تقديمي'}</small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="download-modal-btn"
                onClick={() => handleDownload(selectedResource.downloadUrl, selectedResource.title)}
              >
                <span>📥</span> تحميل الملف
              </button>
              <button className="close-modal-btn" onClick={closeModal}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;