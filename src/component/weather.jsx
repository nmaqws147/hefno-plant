// components/weather.jsx
import { useCallback, useEffect, useState } from 'react';
import useTracking from '../hooks/useTracking';
import './weather.css';
import { Helmet } from 'react-helmet-async';

const WeatherScreen = ({ id }) => {

  const {trackAction} = useTracking();

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [userCrops, setUserCrops] = useState([]);
  const [showCropsModal, setShowCropsModal] = useState(false);

    useEffect(() => {
    if (weatherData) {
      trackAction('weather_loaded');
      
      // تتبع التحذيرات
      if (weatherData.alerts?.length > 0) {
        trackAction(`weather_alerts_${weatherData.alerts.length}`);
      }
    }
  }, [weatherData, trackAction]);

  const availableCrops = [
    'قمح', 'شعير', 'ذرة', 'أرز', 'طماطم', 'بطاطس', 'فلفل', 'خيار', 
    'باذنجان', 'كوسة', 'فراولة', 'عنب', 'تفاح', 'كمثرى', 'خوخ', 
    'مشمش', 'حمضيات', 'زيتون', 'بصل', 'ثوم', 'فول', 'فاصوليا'
  ];

  useEffect(() => {
    const savedCrops = localStorage.getItem('userCrops');
    if (savedCrops) {
      setUserCrops(JSON.parse(savedCrops));
    }
  }, []);

  const saveUserCrops = (crops) => {
    setUserCrops(crops);
    localStorage.setItem('userCrops', JSON.stringify(crops));
    if (location) {
      fetchWeatherData(crops);
    }
  };

  const setDefaultLocation = useCallback(() => {
    console.log('📍 استخدام الموقع الافتراضي: الرياض');
    setLocation({
      lat: 24.7136,
      lon: 46.6753,
      name: "الرياض",
      country: "SA",
      isCurrentLocation: false
    });
  }, []);

  const checkPermissionAndGetLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      console.log('❌ المتصفح لا يدعم تحديد الموقع');
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      setLocationLoading(false);
      setDefaultLocation();
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ تم الحصول على الموقع بنجاح');
        const { latitude, longitude } = position.coords;
        
        try {
          const geoResponse = await fetch(
            `/api/weather?mode=reverse&lat=${latitude}&lon=${longitude}`
          );
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData && geoData.length > 0) {
              const cityInfo = geoData[0];
              const cityName = cityInfo.local_names?.ar || cityInfo.name || 'موقعك الحالي';
              
              setLocation({
                lat: latitude,
                lon: longitude,
                name: cityName,
                country: cityInfo.country || '',
                isCurrentLocation: true
              });
            } else {
              setLocation({
                lat: latitude,
                lon: longitude,
                name: 'موقعك الحالي',
                country: '',
                isCurrentLocation: true
              });
            }
          } else {
            setLocation({
              lat: latitude,
              lon: longitude,
              name: 'موقعك الحالي',
              country: '',
              isCurrentLocation: true
            });
          }
        } catch (geoError) {
          console.error('⚠️ خطأ في جلب اسم المدينة:', geoError);
          setLocation({
            lat: latitude,
            lon: longitude,
            name: 'موقعك الحالي',
            country: '',
            isCurrentLocation: true
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.log('❌ فشل الحصول على الموقع:', error);
        setLocationLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermissionDenied(true);
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('معلومات الموقع غير متاحة حالياً');
            break;
          case error.TIMEOUT:
            setLocationError('انتهت مهلة طلب الموقع. حاول مرة أخرى.');
            break;
          default:
            setLocationError('حدث خطأ غير معروف في تحديد الموقع');
            break;
        }
        
        setDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [setDefaultLocation]);

  const fetchWeatherData = useCallback(async (crops = userCrops) => {
    if (!location) return;
    
    setLoading(true);
    console.log('🌦️ جلب بيانات الطقس للموقع:', location.name);
    
    try {
      let url = `/api/weather?mode=current&lat=${location.lat}&lon=${location.lon}`;
      if (crops.length > 0) {
        url += `&crops=${crops.join(',')}`;
      }
      
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error('خطأ في تحميل بيانات الطقس');
      }
      
      const data = await response.json();
      console.log('✅ بيانات الطقس:', data);
      
      setWeatherData(data);
      setLastUpdate(new Date());
      setError(null);
      
    } catch (err) {
      console.error('❌ خطأ في تحميل الطقس:', err);
      setError('فشل تحميل بيانات الطقس. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [location, userCrops]);

  const getAlertIcon = (riskLevel, categoryIcon) => {
    if (riskLevel === 'critical') return '⛔';
    if (riskLevel === 'high') return '⚠️';
    if (riskLevel === 'medium') return 'ℹ️';
    return categoryIcon || '✅';
  };

  const getAlertColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      default: return '#10b981';
    }
  };

  const getGeneralStatusText = (status) => {
    switch (status) {
      case 'critical': return 'تحذير عاجل';
      case 'warning': return 'تنبيه مهم';
      case 'moderate': return 'ملاحظة';
      default: return 'مناسب';
    }
  };

  useEffect(() => {
    checkPermissionAndGetLocation();
  }, [checkPermissionAndGetLocation]);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location, fetchWeatherData]);

  // حالة التحميل
  if (locationLoading || loading) {
    return (
      <div className="weather-screen" id={id} dir="rtl">
        <div className="weather-loader">
          <div className="loader-spinner"></div>
          <p>{locationLoading ? 'جاري تحديد موقعك...' : 'جاري تحميل بيانات الطقس...'}</p>
        </div>
      </div>
    );
  }

  // حالة رفض الصلاحية
  if (permissionDenied) {
    return (
      <div className="weather-screen" id={id} dir="rtl">
        <div className="weather-error glass">
          <div className="error-icon">📍</div>
          <h3>الوصول إلى الموقع</h3>
          <p>لم تتمكن من الوصول إلى موقعك. سيتم عرض طقس الرياض كموقع افتراضي.</p>
          <div className="error-actions">
            <button className="error-btn primary" onClick={checkPermissionAndGetLocation}>
              🔄 المحاولة مرة أخرى
            </button>
            <button className="error-btn secondary" onClick={setDefaultLocation}>
              📍 استخدام الموقع الافتراضي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (locationError || (error && !weatherData)) {
    return (
      <div className="weather-screen" id={id} dir="rtl">
        <div className="weather-error glass">
          <div className="error-icon">⚠️</div>
          <h3>عذراً، حدث خطأ</h3>
          <p>{locationError || error}</p>
          <button className="error-btn primary" onClick={checkPermissionAndGetLocation}>
            🔄 حاول مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-screen" id={id} dir="rtl">
      <Helmet>
        <title>الطقس الزراعي | Hefno-Plant</title>
        <meta name="description" content="توقعات الطقس الزراعي اليومية — درجة الحرارة، الرطوبة، سرعة الرياح، ومؤشرات مناسبة للزراعة." />
      </Helmet>
      {/* خلفية */}
      <div className="weather-bg">
        <div className="bg-gradient"></div>
        <div className="bg-particles"></div>
      </div>

      <div className="weather-container">
        
        {/* الموقع */}
        <div className="weather-location glass">
          <div className="location-info">
            <div className="location-icon">📍</div>
            <div className="location-details">
              <h1>{location?.name}</h1>
              <p>{location?.country} {location?.isCurrentLocation ? '• موقعك الحالي' : '• الموقع الافتراضي'}</p>
            </div>
          </div>
          <button className="refresh-location" onClick={checkPermissionAndGetLocation} title="تحديث الموقع">
            🔄
          </button>
        </div>

        {/* حالة الطقس العامة */}
        {weatherData && (
          <div className={`weather-status glass status-${weatherData.general_status}`}>
            <div className="status-icon">
              {weatherData.general_status === 'critical' && '⛔'}
              {weatherData.general_status === 'warning' && '⚠️'}
              {weatherData.general_status === 'moderate' && 'ℹ️'}
              {weatherData.general_status === 'good' && '✅'}
            </div>
            <div className="status-text">
              <h3>{getGeneralStatusText(weatherData.general_status)}</h3>
              <p>{weatherData.general_message}</p>
            </div>
          </div>
        )}

        {/* الطقس الحالي */}
        {weatherData?.current_weather && (
          <div className="weather-current glass">
            <div className="weather-icon">
              <span className="icon-large">{weatherData.current_weather.description?.charAt(0) || '🌤️'}</span>
            </div>
            <div className="weather-temp">
              <span className="temp-value">{Math.round(weatherData.current_weather.temperature)}</span>
              <span className="temp-unit">°C</span>
            </div>
            <div className="weather-desc">{weatherData.current_weather.description}</div>
            <div className="weather-details">
              <div className="detail">
                <span>💧</span>
                <span>{weatherData.current_weather.humidity}% رطوبة</span>
              </div>
              <div className="detail">
                <span>💨</span>
                <span>{weatherData.current_weather.wind_speed} كم/س</span>
              </div>
              <div className="detail">
                <span>☁️</span>
                <span>{weatherData.current_weather.cloud_cover || 0}% غيوم</span>
              </div>
            </div>
          </div>
        )}

        {/* التوقعات */}
        {weatherData?.forecast && (
          <div className="weather-forecast glass">
            <h3>📅 توقعات اليوم</h3>
            <div className="forecast-grid">
              <div className="forecast-item">
                <span className="forecast-label">الحرارة العظمى</span>
                <span className="forecast-value">{Math.round(weatherData.forecast.today.max_temp)}°</span>
              </div>
              <div className="forecast-item">
                <span className="forecast-label">الحرارة الصغرى</span>
                <span className="forecast-value">{Math.round(weatherData.forecast.today.min_temp)}°</span>
              </div>
              <div className="forecast-item">
                <span className="forecast-label">احتمال الأمطار</span>
                <span className="forecast-value">{weatherData.forecast.today.rain_probability}%</span>
              </div>
              <div className="forecast-item">
                <span className="forecast-label">الرطوبة المتوقعة</span>
                <span className="forecast-value">{weatherData.forecast.today.avg_humidity}%</span>
              </div>
            </div>
          </div>
        )}

        {/* التحذيرات الزراعية */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <div className="weather-alerts glass">
            <div className="alerts-header">
              <h3>⚠️ تحذيرات زراعية</h3>
              <span className="alerts-count">{weatherData.alerts.length}</span>
            </div>
            <div className="alerts-list">
              {weatherData.alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="alert-item" style={{ borderRightColor: getAlertColor(alert.risk_level) }}>
                  <div className="alert-icon">{getAlertIcon(alert.risk_level, alert.icon)}</div>
                  <div className="alert-content">
                    <div className="alert-title">
                      <span className="alert-category">{alert.category_ar}</span>
                      <span className="alert-risk" style={{ color: getAlertColor(alert.risk_level) }}>
                        {alert.risk_level === 'critical' ? 'عاجل' : alert.risk_level === 'high' ? 'هام' : 'تنبيه'}
                      </span>
                    </div>
                    <p className="alert-message">{alert.alert_ar}</p>
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="alert-recommendation">
                        <span>💡 توصية: </span>
                        <span>{alert.recommendations[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {weatherData.alerts.length > 3 && (
              <button className="show-more-btn">عرض جميع التحذيرات ({weatherData.alerts.length})</button>
            )}
          </div>
        )}

        {/* التوصيات */}
        {weatherData?.recommendations && weatherData.recommendations.length > 0 && (
          <div className="weather-recommendations glass">
            <h3>💡 توصيات ذكية</h3>
            <div className="recommendations-list">
              {weatherData.recommendations.map((rec, idx) => (
                <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                  <div className="rec-icon">
                    {rec.priority === 'critical' && '⛔'}
                    {rec.priority === 'high' && '⚠️'}
                    {rec.priority === 'info' && '💡'}
                  </div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نصائح زراعية عامة */}
        {weatherData?.farming_tips && weatherData.farming_tips.length > 0 && (
          <div className="weather-tips glass">
            <h3>🌿 نصائح زراعية</h3>
            <div className="tips-list">
              {weatherData.farming_tips.map((tip, idx) => (
                <div key={idx} className="tip-item">
                  <span className="tip-bullet">🌱</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* اختيار المحاصيل */}
        <div className="weather-crops glass">
          <div className="crops-header">
            <h3>🌾 المحاصيل المفضلة</h3>
            <button className="edit-crops-btn" onClick={() => setShowCropsModal(true)}>
              ✏️ تعديل
            </button>
          </div>
          <div className="crops-list">
            {userCrops.length > 0 ? (
              userCrops.map((crop, idx) => (
                <span key={idx} className="crop-tag">{crop}</span>
              ))
            ) : (
              <p className="crops-empty">لم يتم اختيار محاصيل بعد. اضغط تعديل لإضافة محاصيلك.</p>
            )}
          </div>
          <p className="crops-hint">💡 اختر محاصيلك للحصول على تحذيرات مخصصة</p>
        </div>

        {/* آخر تحديث */}
        <div className="weather-footer">
          <div className="update-info">
            <span>🕒 آخر تحديث: {lastUpdate?.toLocaleTimeString('ar-SA')}</span>
          </div>
          <button className="update-btn" onClick={() => fetchWeatherData()}>
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* مودال اختيار المحاصيل */}
      {showCropsModal && (
        <div className="modal-overlay" onClick={() => setShowCropsModal(false)}>
          <div className="crops-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌾 اختر محاصيلك</h3>
              <button className="modal-close" onClick={() => setShowCropsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>اختر المحاصيل التي تزرعها للحصول على تحذيرات مخصصة:</p>
              <div className="crops-grid">
                {availableCrops.map((crop) => (
                  <label key={crop} className="crop-checkbox">
                    <input
                      type="checkbox"
                      checked={userCrops.includes(crop)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          saveUserCrops([...userCrops, crop]);
                        } else {
                          saveUserCrops(userCrops.filter(c => c !== crop));
                        }
                      }}
                    />
                    <span>{crop}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setShowCropsModal(false)}>
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherScreen;