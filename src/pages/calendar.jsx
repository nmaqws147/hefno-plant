// components/knowledge/AgriculturalCalendarPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import calendarData from '../calender/calender.json';
import './calendar.css';
import { Helmet } from 'react-helmet-async';

const AgriculturalCalendarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeTab, setActiveTab] = useState('planting'); 

useEffect(() => {
    try {
      setData(calendarData);

      if (calendarData.months && calendarData.months.length > 0) {
        setSelectedMonth(calendarData.months[0]);
      }
    } catch (err) {
      console.error('Error processing calendar data:', err);
      setError('حدث خطأ في عرض بيانات التقويم الزراعي');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setActiveTab('planting');
  };

  const getSeasonClass = (season) => {
    switch (season) {
      case 'شتاء': return 'season-winter';
      case 'ربيع': return 'season-spring';
      case 'صيف': return 'season-summer';
      case 'خريف': return 'season-autumn';
      default: return 'season-winter';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'عالية': return 'priority-high';
      case 'متوسطة': return 'priority-medium';
      case 'منخفضة': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="calendar-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل التقويم الزراعي...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="calendar-page error" dir="rtl">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>حدث خطأ</h3>
          <p>{error || 'لا توجد بيانات'}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page  " dir="rtl">
      <Helmet>
        <title>التقويم الزراعي | Hefno-Plant</title>
        <meta name="description" content="التقويم الزراعي الشهري — مواعيد الزراعة والحصاد والعمليات الزراعية حسب كل شهر." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="calendar-header special-page-header">
 
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>

              <div className="header-content">
          <div className="header-icon">
            <span>📅</span>
          </div>
          <div className="header-text">
            <h1>{data.metadata.name_ar}</h1>
            <p className="header-en">{data.metadata.name_en}</p>
            <p className="header-description">{data.metadata.description_ar}</p>
            <div className="stats-badge">
              <span className="stat-badge">🌾 {data.metadata.source_ar}</span>
              <span className="stat-badge">📍 {data.metadata.regions_covered_ar.join(' • ')}</span>
            </div>
          </div>
        </div>  
      </div>

      {/* أشهر السنة */}
      <div className="months-timeline">
        {data.months.map((month) => (
          <button
            key={month.month_number}
            className={`month-btn ${selectedMonth?.month_number === month.month_number ? 'active' : ''}`}
            onClick={() => handleMonthSelect(month)}
          >
            <span className="month-number">{month.month_number}</span>
            <span className="month-name">{month.name_ar}</span>
            <span className={`month-season ${getSeasonClass(month.season_ar)}`}>
              {month.season_ar}
            </span>
          </button>
        ))}
      </div>

      {/* محتوى الشهر المختار */}
      {selectedMonth && (
        <div className="month-content">
          {/* معلومات الشهر */}
          <div className="month-info">
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">📅 الشهر:</span>
                <span className="info-value">{selectedMonth.name_ar} — {selectedMonth.name_en}</span>
              </div>
              <div className="info-row">
                <span className="info-label">🌡️ الدلتا:</span>
                <span className="info-value">{selectedMonth.avg_temp_delta}</span>
              </div>
              <div className="info-row">
                <span className="info-label">🌡️ الوجه القبلي:</span>
                <span className="info-value">{selectedMonth.avg_temp_upper_egypt}</span>
              </div>
              <div className="info-row">
                <span className="info-label">💧 الأمطار:</span>
                <span className="info-value">{selectedMonth.rainfall_ar}</span>
              </div>
              <div className="info-row full-width">
                <span className="info-label">📋 ملخص:</span>
                <span className="info-value">{selectedMonth.summary_ar}</span>
              </div>
            </div>
          </div>

          {/* تبويبات المحتوى */}
          <div className="content-tabs">
            <button
              className={`tab-btn ${activeTab === 'planting' ? 'active' : ''}`}
              onClick={() => setActiveTab('planting')}
            >
              <span>🌱</span> الزراعة
            </button>
            <button
              className={`tab-btn ${activeTab === 'harvesting' ? 'active' : ''}`}
              onClick={() => setActiveTab('harvesting')}
            >
              <span>🌾</span> الحصاد
            </button>
            <button
              className={`tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              <span>🛠️</span> العمليات
            </button>
            <button
              className={`tab-btn ${activeTab === 'fertilization' ? 'active' : ''}`}
              onClick={() => setActiveTab('fertilization')}
            >
              <span>🧪</span> التسميد
            </button>
            <button
              className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <span>⚠️</span> تنبيهات
            </button>
          </div>

          {/* محتوى الزراعة */}
          {activeTab === 'planting' && (
            <div className="tab-content">
              <div className="content-grid">
                <div className="content-card">
                  <h3>🌾 المحاصيل الحقلية</h3>
                  <ul className="content-list">
                    {selectedMonth.planting?.field_crops_ar?.map((crop, idx) => (
                      <li key={idx}>{crop}</li>
                    ))}
                    {(!selectedMonth.planting?.field_crops_ar || selectedMonth.planting.field_crops_ar.length === 0) && (
                      <li className="empty-message">لا توجد زراعات حقلية هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🥬 الخضروات</h3>
                  <ul className="content-list">
                    {selectedMonth.planting?.vegetables_ar?.map((veg, idx) => (
                      <li key={idx}>{veg}</li>
                    ))}
                    {(!selectedMonth.planting?.vegetables_ar || selectedMonth.planting.vegetables_ar.length === 0) && (
                      <li className="empty-message">لا توجد زراعات خضروات هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🍊 الفاكهة</h3>
                  <ul className="content-list">
                    {selectedMonth.planting?.fruits_ar?.map((fruit, idx) => (
                      <li key={idx}>{fruit}</li>
                    ))}
                    {(!selectedMonth.planting?.fruits_ar || selectedMonth.planting.fruits_ar.length === 0) && (
                      <li className="empty-message">لا توجد زراعات فاكهة هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🌿 النباتات الطبية والعطرية</h3>
                  <ul className="content-list">
                    {selectedMonth.planting?.medicinal_ar?.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                    {(!selectedMonth.planting?.medicinal_ar || selectedMonth.planting.medicinal_ar.length === 0) && (
                      <li className="empty-message">لا توجد زراعات طبية هذا الشهر</li>
                    )}
                  </ul>
                </div>
              </div>

              {selectedMonth.planting?.notes_ar && (
                <div className="notes-card">
                  <span className="notes-icon">💡</span>
                  <p>{selectedMonth.planting.notes_ar}</p>
                </div>
              )}
            </div>
          )}

          {/* محتوى الحصاد */}
          {activeTab === 'harvesting' && (
            <div className="tab-content">
              <div className="content-grid">
                <div className="content-card">
                  <h3>🌾 المحاصيل الحقلية</h3>
                  <ul className="content-list">
                    {selectedMonth.harvesting?.field_crops_ar?.map((crop, idx) => (
                      <li key={idx}>{crop}</li>
                    ))}
                    {(!selectedMonth.harvesting?.field_crops_ar || selectedMonth.harvesting.field_crops_ar.length === 0) && (
                      <li className="empty-message">لا توجد محاصيل حقلية للحصاد هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🥬 الخضروات</h3>
                  <ul className="content-list">
                    {selectedMonth.harvesting?.vegetables_ar?.map((veg, idx) => (
                      <li key={idx}>{veg}</li>
                    ))}
                    {(!selectedMonth.harvesting?.vegetables_ar || selectedMonth.harvesting.vegetables_ar.length === 0) && (
                      <li className="empty-message">لا توجد خضروات للحصاد هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🍊 الفاكهة</h3>
                  <ul className="content-list">
                    {selectedMonth.harvesting?.fruits_ar?.map((fruit, idx) => (
                      <li key={idx}>{fruit}</li>
                    ))}
                    {(!selectedMonth.harvesting?.fruits_ar || selectedMonth.harvesting.fruits_ar.length === 0) && (
                      <li className="empty-message">لا توجد فاكهة للحصاد هذا الشهر</li>
                    )}
                  </ul>
                </div>

                <div className="content-card">
                  <h3>🌿 النباتات الطبية والعطرية</h3>
                  <ul className="content-list">
                    {selectedMonth.harvesting?.medicinal_ar?.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                    {(!selectedMonth.harvesting?.medicinal_ar || selectedMonth.harvesting.medicinal_ar.length === 0) && (
                      <li className="empty-message">لا توجد نباتات طبية للحصاد هذا الشهر</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* محتوى العمليات الزراعية */}
          {activeTab === 'operations' && (
            <div className="tab-content">
              <div className="operations-list">
                {selectedMonth.key_operations_ar?.map((op, idx) => (
                  <div key={idx} className="operation-card">
                    <div className="operation-header">
                      <span className={`priority-badge ${getPriorityClass(op.priority)}`}>
                        {op.priority}
                      </span>
                      <h3>{op.operation_ar}</h3>
                    </div>
                    <p className="operation-details">{op.details_ar}</p>
                  </div>
                ))}
                {(!selectedMonth.key_operations_ar || selectedMonth.key_operations_ar.length === 0) && (
                  <div className="empty-message-large">لا توجد عمليات زراعية مسجلة هذا الشهر</div>
                )}
              </div>
            </div>
          )}

          {/* محتوى التسميد */}
          {activeTab === 'fertilization' && (
            <div className="tab-content">
              <div className="fertilization-list">
                {selectedMonth.fertilization_tips_ar?.map((tip, idx) => (
                  <div key={idx} className="tip-card">
                    <span className="tip-icon">🧪</span>
                    <p>{tip}</p>
                  </div>
                ))}
                {(!selectedMonth.fertilization_tips_ar || selectedMonth.fertilization_tips_ar.length === 0) && (
                  <div className="empty-message-large">لا توجد نصائح تسميد هذا الشهر</div>
                )}
              </div>
            </div>
          )}

          {/* محتوى التنبيهات */}
          {activeTab === 'alerts' && (
            <div className="tab-content">
              <div className="alerts-list">
                {selectedMonth.weather_alerts_ar?.map((alert, idx) => (
                  <div key={idx} className="alert-card">
                    <span className="alert-icon">⚠️</span>
                    <p>{alert}</p>
                  </div>
                ))}
                {(!selectedMonth.weather_alerts_ar || selectedMonth.weather_alerts_ar.length === 0) && (
                  <div className="empty-message-large">لا توجد تنبيهات جوية هذا الشهر</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgriculturalCalendarPage;