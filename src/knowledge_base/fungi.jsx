// components/knowledge/FungalClassificationPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pathogensData from '../disease-folder/fungi.json';
import './fungi.css';

const FungalClassificationPage = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // تجميع التصنيفات الفطرية
 const fungalGroups = [
    {
      ...pathogensData.oomyPro,
      color: '#3b82f6',
      lightColor: '#eff6ff',
      icon: '💧',
      borderColor: '#3b82f6',
      id: 'oomy' // المعرف للتحويل لصفحة التفاصيل
    },
    {
      ...pathogensData.zygoPro,
      color: '#8b5cf6',
      lightColor: '#f5f0ff',
      icon: '🧫',
      borderColor: '#8b5cf6',
      id: 'zygo'
    },
    {
      ...pathogensData.ascoPro,
      color: '#10b981',
      lightColor: '#ecfdf5',
      icon: '🍄',
      borderColor: '#10b981',
      id: 'asco'
    },
    {
      ...pathogensData.basiPro,
      color: '#f59e0b',
      lightColor: '#fffbeb',
      icon: '🌾',
      borderColor: '#f59e0b',
      id: 'basi'
    }
  ];

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
  };

  return (
    <div className="fungal-classification-page  " dir="rtl">
      {/* خلفية زخرفية */}
      <div className="fungal-class-bg">
        <div className="bg-glow-multi"></div>
        <div className="bg-particles"></div>
        <div className="bg-mushroom-shapes"></div>
      </div>

      {/* رأس الصفحة */}
      <div className="fungal-class-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base/diseases')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🍄</span>
          </div>
          <div className="header-text">
            <h1>تصنيف الفطريات الممرضة</h1>
            <p className="header-en">Fungal Classification</p>
            <p className="header-description">
              الفطريات من أهم مسببات الأمراض النباتية. تنقسم إلى عدة شعب رئيسية تختلف في تركيبها وطرق تكاثرها
              واستجابتها للمبيدات. فهم التصنيف يساعد في اختيار استراتيجية المكافحة المناسبة.
            </p>
            <div className="stats-badge">
              <span className="stat-badge">📊 4 شعب رئيسية</span>
              <span className="stat-badge">🍄 58+ نوع ممرض</span>
              <span className="stat-badge">🔬 تصنيف علمي دقيق</span>
            </div>
          </div>
        </div>
      </div>

      {/* شبكة التصنيفات */}
      <div className="classification-grid">
        {fungalGroups.map((group, index) => (
          <div
            key={group.id}
            className="classification-card"
            style={{ '--card-color': group.color, '--card-light': group.lightColor }}
          >
            <div className="card-glass"></div>
            
            <div className="card-content" onClick={() => navigate(`/knowledge-base/diseases/fungi/${group.id}`)}>
              {/* رأس البطاقة */}
              <div className="card-header">
                <div className="card-icon-wrapper" style={{ background: `${group.color}15` }}>
                  <span className="card-icon">{group.icon}</span>
                </div>
                <div className="card-badge" style={{ background: `${group.color}10`, color: group.color }}>
                  {group.pathogens_count} مسبب
                </div>
              </div>

              {/* العنوان */}
              <h3 className="card-title">{group.group_ar}</h3>
              <p className="card-title-en">{group.group_en}</p>

              {/* الوصف المختصر */}
              <p className="card-description">
                {group.group_description.substring(0, 120)}...
              </p>

              {/* المميزات الرئيسية (أول 3) */}
              <div className="features-preview">
                <div className="features-title">
                  <span>✨</span> المميزات الرئيسية
                </div>
                <ul className="features-list">
                  {group.distinguishing_features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-dot" style={{ background: group.color }}></span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
                {group.distinguishing_features.length > 3 && (
                  <div className="more-features">+{group.distinguishing_features.length - 3} مميزات أخرى</div>
                )}
              </div>

              {/* المسببات */}
              <div className="causal-preview">
                <span className="causal-label">أهم الأجناس:</span>
                <div className="causal-tags">
                  {group.causalAgents.split(',').slice(0, 3).map((agent, idx) => (
                    <span key={idx} className="causal-tag" style={{ background: `${group.color}08` }}>
                      {agent.trim()}
                    </span>
                  ))}
                  {group.causalAgents.split(',').length > 3 && (
                    <span className="causal-tag more">+{group.causalAgents.split(',').length - 3}</span>
                  )}
                </div>
              </div>

              {/* تذييل البطاقة */}
              <div className="card-footer" onClick={() => handleGroupClick(group)}>
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

      {/* إحصائيات سريعة */}
      <div className="classification-stats">
        <div className="stat-card">
          <span className="stat-number">58+</span>
          <span className="stat-label">نوع فطري ممرض</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">4</span>
          <span className="stat-label">شعب رئيسية</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number">🌍</span>
          <span className="stat-label">منتشرة عالمياً</span>
        </div>
      </div>

      {/* Modal لعرض التفاصيل الكاملة */}
      {showModal && selectedGroup && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="fungal-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ background: `${selectedGroup.color}15` }}>
                <span>{selectedGroup.icon}</span>
              </div>
              <div className="modal-title">
                <h2>{selectedGroup.group_ar}</h2>
                <p className="modal-scientific">{selectedGroup.group_en}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* الوصف الكامل */}
              <div className="modal-section">
                <h3 style={{ borderRightColor: selectedGroup.color }}>📝 الوصف العلمي</h3>
                <p>{selectedGroup.group_description}</p>
              </div>

              {/* المميزات التفريقية */}
              <div className="modal-section">
                <h3 style={{ borderRightColor: selectedGroup.color }}>✨ المميزات التفريقية</h3>
                <ul className="modal-features-list">
                  {selectedGroup.distinguishing_features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-bullet" style={{ background: selectedGroup.color }}></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* المسببات المرضية */}
              <div className="modal-section">
                <h3 style={{ borderRightColor: selectedGroup.color }}>🔬 المسببات المرضية</h3>
                <div className="causal-grid">
                  {selectedGroup.causalAgents.split(',').map((agent, idx) => (
                    <span key={idx} className="causal-badge" style={{ background: `${selectedGroup.color}10`, color: selectedGroup.color }}>
                      {agent.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* إحصائيات */}
              <div className="modal-info-footer" style={{ background: `${selectedGroup.color}05` }}>
                <div className="footer-item">
                  <span>📊 عدد المسببات:</span>
                  <strong style={{ color: selectedGroup.color }}>{selectedGroup.pathogens_count}</strong>
                </div>
                <div className="footer-item">
                  <span>🏷️ التصنيف:</span>
                  <strong style={{ color: selectedGroup.color }}>{selectedGroup.group_ar}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" style={{ background: selectedGroup.color }} onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FungalClassificationPage;