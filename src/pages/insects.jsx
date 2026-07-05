// components/knowledge/insects/InsectsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../knowledge_base/insects/insects-folder/data.json';
import './insects-page.css';
import { Helmet } from 'react-helmet-async';

const InsectsPageNew = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const extraCards = [
    {
      id: 'nematoda',
      order_ar: 'النيماتودا (الديدان الثعبانية)',
      order_en: 'Nematoda & Soil Diseases',
      order_description: 'دليل شامل لتشخيص ومكافحة النيماتودا في التربة المصرية وأعراضها على الجذور والنمو الخضري',
      icon: '🐛',
      pathogens_count: 8,
      isExtra: true 
    },
    {
      id: 'public-health-pets',
      order_ar: 'آفات الصحة العامة',
      order_en: 'Public Health Pests',
      order_description: 'دليل مكافحة الآفات العامة والمنزلية المرتبطة بالبيئة الزراعية: القوارض، الحشرات الطائرة، والزاحفة',
      icon: '🦟',
      pathogens_count: 25,
      isExtra: true
    }
  ];

  const insectsData = data;
  const baseOrders = Object.keys(insectsData).map(key => ({
    id: key,
    order_ar: insectsData[key].order_ar,
    order_en: insectsData[key].order_en,
    order_description: insectsData[key].order_description,
    pathogens_count: insectsData[key].pathogens_count,
  }));

  const allOrders = [...baseOrders, ...extraCards];

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.order_ar.includes(searchTerm) || 
      order.order_en.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleOrderClick = (orderId) => {
    if (orderId === 'nematoda' || orderId === 'public-health-pests') {
      navigate(`/knowledge-base/insects/${orderId}`);
    } else {
      navigate(`/knowledge-base/insects/${orderId}`);
    }
  };

  return (
    <div className="insects-page" dir="rtl">
      <Helmet>
        <title>الحشرات الزراعية | Hefno-Plant</title>
        <meta name="description" content="دليل الحشرات الزراعية — تعريف الآفات الحشرية، دورة حياتها، وطرق المكافحة." />
      </Helmet>
      {/* رأس الصفحة */}
      <div className="insects-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>🦋</span>
          </div>
          <div className="header-text">
            <h1>آفات الحشرات والديدان</h1>
            <p className="header-subtitle">دليل شامل لأهم الآفات التي تصيب المحاصيل في مصر (حشرات، نيماتودا، وآفات عامة)</p>
            <div className="stats-badge">
              <span className="stat">📊 {allOrders.length} قسم علمي</span>
              <span className="stat">🐛 60+ نوع مكتشف</span>
              <span className="stat">🛡️ مكافحة متكاملة</span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="search-section glass">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن آفات، رتب، أو نيماتودا..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* شبكة الرتب والآفات */}
      <div className="orders-grid">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`order-card glass ${order.isExtra ? 'special-card' : ''}`}
            onClick={() => handleOrderClick(order.id)}
          >
            <div className="card-glow"></div>
            
            <div className="card-content">
              <div className="card-header">
                <span className="order-icon">
                  {/* تحديد الأيقونة بناءً على الـ ID */}
                  {order.icon ? order.icon : (
                    <>
                      {order.id === 'Lepidoptera' && '🦋'}
                      {order.id === 'Coleoptera' && '🐞'}
                      {order.id === 'Hemiptera' && '🦟'}
                      {order.id === 'Thysanoptera' && '🐜'}
                    </>
                  )}
                </span>
                <div className="order-title">
                  <h3>{order.order_ar}</h3>
                  <p className="order-en">{order.order_en}</p>
                </div>
              </div>

              <p className="order-description">
                {order.order_description.substring(0, 120)}...
              </p>

              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-value">{order.pathogens_count}</span>
                  <span className="stat-label">نوع</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">🛡️</span>
                  <span className="stat-label">وقاية</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="view-link">
                  عرض التفاصيل
                  <span className="arrow">←</span>
                </span>
              </div>
            </div>
            <div className="card-hover-effect"></div>
          </div>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredOrders.length === 0 && (
        <div className="no-results glass">
          <h3>لا توجد نتائج مطابقة لـ "{searchTerm}"</h3>
          <button onClick={() => setSearchTerm('')}>مسح البحث</button>
        </div>
      )}
    </div>
  );
};

export default InsectsPageNew;