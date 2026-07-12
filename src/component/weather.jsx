import { useCallback, useEffect, useMemo, useState } from 'react';
import useTracking from '../hooks/useTracking';
import { Helmet } from 'react-helmet-async';
import {
  MapPin, Clock, RefreshCw, CloudSun, CloudRain, Wind,
  Droplets, Eye, Sun, Gauge,
  Info, X, ChevronLeft, Search, Check, Sprout, CalendarDays,
  AlertTriangle, Ban, Lightbulb, Leaf, Moon, Wheat, Cloud,
  Edit
} from 'lucide-react';

const availableCrops = [
  'قمح', 'شعير', 'ذرة', 'أرز', 'طماطم', 'بطاطس', 'فلفل', 'خيار',
  'باذنجان', 'كوسة', 'فراولة', 'عنب', 'تفاح', 'كمثرى', 'خوخ',
  'مشمش', 'حمضيات', 'زيتون', 'بصل', 'ثوم', 'فول', 'فاصوليا'
];

const WeatherScreen = ({ id }) => {
  const { trackAction } = useTracking();

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
  const [cropSearch, setCropSearch] = useState('');
  const [draftCrops, setDraftCrops] = useState([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    if (weatherData) {
      trackAction('weather_loaded');
      if (weatherData.alerts?.length > 0) {
        trackAction(`weather_alerts_${weatherData.alerts.length}`);
      }
    }
  }, [weatherData, trackAction]);

  const filteredCrops = useMemo(() => {
    if (!cropSearch) return availableCrops;
    return availableCrops.filter(crop =>
      crop.includes(cropSearch)
    );
  }, [cropSearch, availableCrops]);

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
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      setLocationLoading(false);
      setDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
                lat: latitude, lon: longitude,
                name: cityName,
                country: cityInfo.country || '',
                isCurrentLocation: true
              });
            } else {
              setLocation({ lat: latitude, lon: longitude, name: 'موقعك الحالي', country: '', isCurrentLocation: true });
            }
          } else {
            setLocation({ lat: latitude, lon: longitude, name: 'موقعك الحالي', country: '', isCurrentLocation: true });
          }
        } catch (geoError) {
          setLocation({ lat: latitude, lon: longitude, name: 'موقعك الحالي', country: '', isCurrentLocation: true });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED: setPermissionDenied(true); break;
          case error.POSITION_UNAVAILABLE: setLocationError('معلومات الموقع غير متاحة حالياً'); break;
          case error.TIMEOUT: setLocationError('انتهت مهلة طلب الموقع. حاول مرة أخرى.'); break;
          default: setLocationError('حدث خطأ غير معروف'); break;
        }
        setDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [setDefaultLocation]);

  const fetchWeatherData = useCallback(async (crops = userCrops) => {
    if (!location) return;
    setLoading(true);
    try {
      let url = `/api/weather?mode=current&lat=${location.lat}&lon=${location.lon}`;
      if (crops.length > 0) url += `&crops=${crops.join(',')}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('خطأ في تحميل بيانات الطقس');
      const data = await response.json();
      setWeatherData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('فشل تحميل بيانات الطقس. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [location, userCrops]);

  const getAlertIcon = (riskLevel) => {
    if (riskLevel === 'critical') return Ban;
    if (riskLevel === 'high') return AlertTriangle;
    if (riskLevel === 'medium') return Info;
    return Check;
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

  const hourlyData = useMemo(() => {
    if (!weatherData?.current_weather) return [];
    const now = new Date();
    const base = weatherData.current_weather;
    return Array.from({ length: 12 }, (_, i) => {
      const h = new Date(now);
      h.setHours((now.getHours() + i) % 24);
      const hour = h.getHours();
      const t = base.temperature + (Math.sin((i / 12) * Math.PI * 2) * 4);
      const r = (base.humidity || 50) + (Math.cos(i * 0.8) * 12) + (i > 5 ? -8 : 5);
      return {
        hour,
        label: i === 0 ? 'الآن' : `${hour}:00`,
        temp: Math.round(t),
        rain: Math.max(0, Math.min(100, Math.round(r))),
        icon: r > 60 ? 'cloud-rain' : t > 35 ? 'sun' : t > 25 ? 'cloud-sun' : 'cloud'
      };
    });
  }, [weatherData]);

  const weeklyData = useMemo(() => {
    if (!weatherData?.forecast?.today) return [];
    const today = weatherData.forecast.today;
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const label = i === 0 ? 'اليوم' : i === 1 ? 'غداً' : dayNames[d.getDay()];
      const maxT = today.max_temp + Math.sin(i * 0.9) * 4;
      const minT = today.min_temp + Math.cos(i * 0.7) * 3;
      const rainP = today.rain_probability + Math.sin(i * 1.1) * 10;
      const icon = rainP > 50 ? 'cloud-rain' : maxT > 35 ? 'sun' : maxT > 25 ? 'cloud-sun' : 'cloud';
      const condition = rainP > 50 ? 'ممطر' : maxT > 35 ? 'مشمس' : maxT > 25 ? 'غائم جزئياً' : 'مشمس';
      return {
        day: label,
        icon,
        condition,
        high: Math.round(maxT),
        low: Math.round(minT),
        rain: Math.round(Math.max(0, rainP))
      };
    });
  }, [weatherData]);

  const getWeatherIcon = (icon, size, className) => {
    const icons = {
      'sun': <Sun size={size || 20} className={`text-amber-500 ${className || ''}`} />,
      'cloud-sun': <CloudSun size={size || 20} className={`text-amber-400 ${className || ''}`} />,
      'cloud': <Cloud size={size || 20} className={`text-gray-400 ${className || ''}`} />,
      'cloud-rain': <CloudRain size={size || 20} className={`text-blue-500 ${className || ''}`} />
    };
    return icons[icon] || icons['cloud-sun'];
  };

  const alertColor = (severity) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-50 dark:bg-red-900/15', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', pill: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
      case 'high': return { bg: 'bg-amber-50 dark:bg-amber-900/15', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', pill: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
      case 'medium': return { bg: 'bg-yellow-50 dark:bg-yellow-900/15', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600 dark:text-yellow-400', pill: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' };
      case 'info': return { bg: 'bg-blue-50 dark:bg-blue-900/15', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', pill: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
      default: return { bg: 'bg-green-50 dark:bg-green-900/15', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', pill: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
    }
  };

  const SkeletonLine = ({ w = '60%', h = '14px', className = '' }) => (
    <div className={`skeleton-shimmer rounded-lg ${className}`} style={{ width: w, height: h }} />
  );
  const SkeletonCircle = ({ size = '36px' }) => (
    <div className="skeleton-shimmer rounded-full shrink-0" style={{ width: size, height: size }} />
  );

  if (locationLoading || loading) {
    return (
      <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex flex-col" id={id} dir="rtl">
        <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .skeleton-shimmer { position: relative; overflow: hidden; background: #e5e7eb; }
          .dark .skeleton-shimmer { background: #374151; }
          .skeleton-shimmer::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
            animation: shimmer 1.5s infinite;
          }
          .dark .skeleton-shimmer::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 flex-1 overflow-y-auto">
          {/* Location bar skeleton */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <SkeletonCircle size="40px" />
              <div className="space-y-2">
                <SkeletonLine w="120px" h="16px" />
                <SkeletonLine w="80px" h="11px" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SkeletonLine w="60px" h="11px" />
              <SkeletonLine w="70px" h="32px" className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Hero skeleton */}
            <div className="p-5 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonCircle size="44px" />
                  <div className="space-y-2">
                    <SkeletonLine w="100px" h="14px" />
                    <SkeletonLine w="70px" h="11px" />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <SkeletonLine w="80px" h="48px" />
                  <SkeletonLine w="90px" h="12px" />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                <SkeletonLine w="80px" h="12px" />
                <SkeletonLine w="100%" h="36px" className="rounded-xl" />
                <SkeletonLine w="90%" h="36px" className="rounded-xl" />
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <SkeletonLine w="100px" h="12px" />
                  <SkeletonLine w="50px" h="22px" className="rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <SkeletonLine w="80px" h="32px" className="rounded-lg" />
                  <SkeletonLine w="70px" h="32px" className="rounded-lg" />
                  <SkeletonLine w="90px" h="32px" className="rounded-lg" />
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl">
                  <SkeletonCircle size="40px" />
                  <div className="space-y-2 flex-1">
                    <SkeletonLine w="50px" h="11px" />
                    <SkeletonLine w="70px" h="16px" />
                    <SkeletonLine w="60px" h="11px" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly skeleton */}
          <div className="p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SkeletonCircle size="32px" />
                <div className="space-y-1">
                  <SkeletonLine w="90px" h="14px" />
                  <SkeletonLine w="70px" h="11px" />
                </div>
              </div>
              <SkeletonLine w="60px" h="22px" className="rounded-full" />
            </div>
            <div className="flex gap-0 overflow-hidden">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 py-3 px-3 min-w-[72px]">
                  <SkeletonLine w="28px" h="11px" />
                  <SkeletonCircle size="22px" />
                  <SkeletonLine w="20px" h="16px" />
                </div>
              ))}
            </div>
          </div>

          {/* Weekly skeleton */}
          <div className="p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <SkeletonCircle size="32px" />
              <SkeletonLine w="110px" h="14px" />
              <SkeletonLine w="50px" h="22px" className="rounded-full" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 py-3 px-4 min-w-[88px]">
                  <SkeletonLine w="35px" h="12px" />
                  <SkeletonCircle size="26px" />
                  <SkeletonLine w="32px" h="11px" />
                  <SkeletonLine w="40px" h="16px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center px-4" id={id}>
        <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 grid place-items-center mx-auto">
            <MapPin size={28} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">تعذر الوصول إلى موقعك</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">لم نتمكن من تحديد موقعك. سيتم عرض طقس الرياض كموقع افتراضي.</p>
          <div className="flex gap-2 justify-center pt-2">
            <button onClick={checkPermissionAndGetLocation} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 transition-all shadow-md">
              إعادة المحاولة
            </button>
            <button onClick={setDefaultLocation} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              استخدام الموقع الافتراضي
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (locationError || (error && !weatherData)) {
    return (
      <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center px-4" id={id}>
        <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="size-16 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 grid place-items-center mx-auto">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">عذراً، حدث خطأ</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{locationError || error}</p>
          <button onClick={checkPermissionAndGetLocation} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 transition-all shadow-md">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const cw = weatherData?.current_weather;
  const fc = weatherData?.forecast?.today;

  const heroIcon = cw?.description?.includes('مطر') ? 'cloud-rain'
    : cw?.description?.includes('غائم') ? 'cloud'
    : cw?.description?.includes('مشمس') || cw?.description?.includes('صافي') ? 'sun'
    : 'cloud-sun';

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex flex-col" id={id} dir="rtl">
      <style>{`
        .scrollbar-none::-webkit-scrollbar{display:none}
        .scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}
        .scrollbar-thin::-webkit-scrollbar{width:4px}
        .scrollbar-thin::-webkit-scrollbar-track{background:transparent}
        .scrollbar-thin::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:2px}
        .fade-in { animation: fadeIn 0.4s ease-out both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-fade-r { mask-image: linear-gradient(to left, transparent, black 20px, black calc(100% - 20px), transparent); -webkit-mask-image: linear-gradient(to left, transparent, black 20px, black calc(100% - 20px), transparent); }
      `}</style>
      <Helmet>
        <title>الطقس الزراعي | Hefno-Plant</title>
        <meta name="description" content="توقعات الطقس الزراعي اليومية — درجة الحرارة، الرطوبة، سرعة الرياح، ومؤشرات مناسبة للزراعة." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 flex-1 overflow-y-auto">

        {/* ─── Location Bar ─── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 flex-wrap p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl fade-in" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center">
              <MapPin size={18} className="text-blue-500" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{location?.name || '—'}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                {location?.country || '—'}
                {location?.isCurrentLocation ? ' • موقعك الحالي' : ' • الموقع الافتراضي'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              <Clock size={11} className="inline ml-1 -mt-0.5" />
              {lastUpdate ? lastUpdate.toLocaleTimeString('ar-SA') : '—'}
            </span>
            <button onClick={() => fetchWeatherData()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <RefreshCw size={13} />
              تحديث
            </button>
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* ─── Hero Card ─── */}
          <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl p-4 lg:p-5 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getWeatherIcon(heroIcon, 44)}
                <div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">{cw?.description || '—'}</div>
                  {weatherData?.general_status && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      {(() => {
                        const StatIcon = status => status === 'critical' ? Ban : status === 'warning' ? AlertTriangle : status === 'moderate' ? Info : Check;
                        const IconComp = StatIcon(weatherData.general_status);
                        return <IconComp size={11} />;
                      })()}
                      {getGeneralStatusText(weatherData.general_status)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <span className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {cw ? Math.round(cw.temperature) : '—'}
                  <span className="text-xl font-light text-gray-400 dark:text-gray-500 align-super">°C</span>
                </span>
                {fc && (
                  <div className="flex gap-2 mt-1 justify-end text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Sun size={11} className="text-amber-500" /> H: {Math.round(fc.max_temp)}°</span>
                    <span className="flex items-center gap-1"><Moon size={11} className="text-slate-500" /> L: {Math.round(fc.min_temp)}°</span>
                  </div>
                )}
              </div>
            </div>

            {weatherData?.farming_tips && weatherData.farming_tips.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">نصائح زراعية</span>
                </div>
                <div className="space-y-1.5">
                  {weatherData.farming_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <Sprout size={14} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wheat size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">المحاصيل المفضلة</span>
                </div>
                <button onClick={() => { setDraftCrops(userCrops); setShowCropsModal(true); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all" title="تعديل المحاصيل">
                  <Edit size={12} />
                  تعديل
                </button>
              </div>
              {userCrops.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {userCrops.map((crop, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30">
                      <Sprout size={12} className="text-primary" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{crop}</span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 px-1.5 py-0.5 rounded">{'—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => { setDraftCrops(userCrops); setShowCropsModal(true); }} className="w-full py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary transition-all">
                  + اختر محاصيلك
                </button>
              )}
            </div>
          </div>

          {/* ─── Details Sidebar ─── */}
          <div className="space-y-3 fade-in" style={{ animationDelay: '0.2s' }}>
            {cw?.humidity !== undefined && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
                <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center shrink-0">
                  <Droplets size={18} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">الرطوبة</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">{cw.humidity}%</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {cw.humidity > 70 ? 'مرتفعة' : cw.humidity > 40 ? 'متوسطة' : 'منخفضة'}
                  </div>
                </div>
              </div>
            )}
            {cw?.wind_speed !== undefined && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
                <div className="size-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center shrink-0">
                  <Wind size={18} className="text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">سرعة الرياح</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">{cw.wind_speed} كم/س</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {cw.wind_speed > 30 ? 'قوية' : cw.wind_speed > 15 ? 'متوسطة' : 'خفيفة'}
                  </div>
                </div>
              </div>
            )}
            {fc?.avg_humidity !== undefined && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
                <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center shrink-0">
                  <Gauge size={18} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">رطوبة متوقعة</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">{fc.avg_humidity}%</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">متوسط اليوم</div>
                </div>
              </div>
            )}
            {fc?.rain_probability !== undefined && (
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
                <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center shrink-0">
                  <CloudRain size={18} className="text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">احتمال الأمطار</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">{fc.rain_probability}%</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {fc.rain_probability > 70 ? 'مرتفع' : fc.rain_probability > 30 ? 'متوسط' : 'منخفض'}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
                <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center shrink-0">
                  <Eye size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">الرؤية</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">{cw?.visibility != null ? `${cw.visibility} كم` : '—'}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {cw?.visibility == null ? 'غير متوفر' : cw.visibility > 10 ? 'واضحة جداً' : cw.visibility > 5 ? 'متوسطة' : 'محدودة'}
              </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl">
              <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 grid place-items-center shrink-0">
                <Sun size={18} className="text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">الأشعة فوق البنفسجية</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">{cw?.uv_index != null ? cw.uv_index : '—'} <span className="text-[10px] font-normal text-gray-400">/11</span></div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {cw?.uv_index == null ? 'غير متوفر' : cw.uv_index > 7 ? 'مرتفع جداً' : cw.uv_index > 4 ? 'مرتفع' : 'منخفض'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Hourly Forecast ─── */}
        {hourlyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl p-4 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center">
                  <Clock size={16} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">توقعات اليوم</h3>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">الـ 12 ساعة القادمة</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">تقديري</span>
            </div>
            <div className="overflow-x-auto scrollbar-none scroll-fade-r">
              <div className="flex gap-0 min-w-max">
                {hourlyData.map((h, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1.5 py-3 px-3 min-w-[72px] rounded-xl transition-colors ${i === 0 ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <span className={`text-[11px] font-semibold ${i === 0 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>{h.label}</span>
                    {getWeatherIcon(h.icon, 22)}
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{h.temp}°</span>
                    {h.rain > 15 && (
                      <span className="text-[9px] text-blue-500 flex items-center gap-0.5">
                        <CloudRain size={9} />{h.rain}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── 7-Day Forecast ─── */}
        {weeklyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm rounded-2xl p-4 fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center">
                  <CalendarDays size={16} className="text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">توقعات 7 أيام</h3>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">تقديري</span>
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-none scroll-fade-r">
              <div className="flex gap-2 min-w-max sm:justify-between">
                {weeklyData.map((d, i) => (
                  <div key={i} className={`flex flex-col items-center gap-2 py-3 px-4 min-w-[88px] rounded-xl transition-colors ${i === 0 ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <span className={`text-xs font-semibold ${i === 0 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>{d.day}</span>
                    {getWeatherIcon(d.icon, 26)}
                    <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                      <CloudRain size={9} /><span>{d.rain}%</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{d.high}°</span>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{d.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Alerts & Recommendations ─── */}
        <div className="space-y-6 fade-in" style={{ animationDelay: '0.5s' }}>
          {weatherData?.alerts && weatherData.alerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 grid place-items-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">تحذيرات زراعية</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {weatherData.alerts.length === 1
                        ? 'تحذير واحد يتطلب انتباهك'
                        : `${weatherData.alerts.length} تحذيرات تتطلب انتباهك`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">{weatherData.alerts.length}</span>
              </div>
              <div className="space-y-2">
                {(showAllAlerts ? weatherData.alerts : weatherData.alerts.slice(0, 3)).map((alert, idx) => {
                  const severityKey = alert.risk_level === 'critical' ? 'critical'
                    : alert.risk_level === 'high' ? 'high'
                    : alert.risk_level === 'medium' ? 'medium' : 'low';
                  const AlertIcon = getAlertIcon(alert.risk_level);
                  const ac = alertColor(severityKey);
                  return (
                    <div key={idx} className={`${ac.bg} ${ac.border} border rounded-2xl overflow-hidden flex items-start gap-3 transition-all`}>
                      <div className={`w-1 self-stretch shrink-0 ${severityKey === 'critical' ? 'bg-red-500' : severityKey === 'high' ? 'bg-amber-500' : severityKey === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <div className={`size-9 rounded-lg grid place-items-center shrink-0 mt-3 ${alertColor(severityKey).bg}`}>
                        <AlertIcon size={16} className={ac.text} />
                      </div>
                      <div className="flex-1 min-w-0 py-3 pl-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{alert.category_ar || 'تنبيه'}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${ac.pill}`}>
                            <span className={`size-1.5 rounded-full inline-block ${severityKey === 'critical' ? 'bg-red-500 animate-pulse' : severityKey === 'high' ? 'bg-amber-500 animate-pulse' : severityKey === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            {alert.risk_level === 'critical' ? 'عاجل' : alert.risk_level === 'high' ? 'هام' : 'تنبيه'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{alert.alert_ar}</p>
                        {alert.recommendations && alert.recommendations.length > 0 && (
                          <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                            <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                            <span>{alert.recommendations[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {weatherData.alerts.length > 3 && (
                  <button
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                  >
                    {showAllAlerts ? 'عرض أقل' : 'عرض جميع التحذيرات'}
                    <ChevronLeft size={13} className={`transition-transform ${showAllAlerts ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          )}

          {weatherData?.recommendations && weatherData.recommendations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 grid place-items-center">
                    <Lightbulb size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">توصيات</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {weatherData.recommendations.length === 1
                        ? 'توصية واحدة بناءً على حالة الطقس'
                        : `${weatherData.recommendations.length} توصيات بناءً على حالة الطقس`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {weatherData.recommendations.map((rec, idx) => {
                  const recPriority = rec.priority || 'info';
                  const ic = alertColor(recPriority);
                  const iconMap = { critical: Ban, high: AlertTriangle, info: Lightbulb };
                  const RecIcon = iconMap[recPriority] || Lightbulb;
                  return (
                    <div key={idx} className={`${ic.bg} ${ic.border} border border-dashed rounded-2xl overflow-hidden flex items-start gap-3 transition-all`}>
                      <div className={`w-1 self-stretch shrink-0 border-r-2 border-dashed ${recPriority === 'critical' ? 'border-red-500' : recPriority === 'high' ? 'border-amber-500' : 'border-blue-500'}`} />
                      <div className={`size-9 rounded-lg grid place-items-center shrink-0 mt-3 ${ic.bg}`}>
                        <RecIcon size={16} className={ic.text} />
                      </div>
                      <div className="flex-1 min-w-0 py-3 pl-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{rec.title}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{rec.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <footer className="flex items-center justify-between gap-4 px-1 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {lastUpdate ? lastUpdate.toLocaleTimeString('ar-SA') : '—'}
            </span>
            {lastUpdate && (
              <span className={`size-1.5 rounded-full ${Date.now() - lastUpdate.getTime() > 600000 ? 'bg-amber-500' : 'bg-green-500'}`} />
            )}
            {lastUpdate && Date.now() - lastUpdate.getTime() > 600000 && (
              <span className="text-amber-500">قديم</span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Hefno-Plant • طقس زراعي</span>
        </footer>
      </div>

      {/* ─── Crops Modal ─── */}
      {/* ─── Crops Modal ─── */}
      {showCropsModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setShowCropsModal(false); }}
        >
          <div
            className="w-full max-w-lg max-h-[82vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/50 shadow-xl rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-5 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-400 to-primary grid place-items-center shadow-md">
                  <Sprout size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">اختر محاصيلك</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {draftCrops.length > 0
                      ? `${draftCrops.length} من ${availableCrops.length} محصول`
                      : 'اختر المحاصيل التي تزرعها للحصول على تحذيرات مخصصة'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowCropsModal(false); }}
                className="size-9 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mx-5 mb-3">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن محصول..."
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                className="w-full py-2 pr-9 pl-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                aria-label="بحث عن محصول"
              />
              {cropSearch && (
                <button onClick={() => setCropSearch('')} className="absolute left-2 top-1/2 -translate-y-1/2 size-5 rounded grid place-items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" aria-label="مسح البحث">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0 scrollbar-thin" role="group" aria-label="قائمة المحاصيل">
              {filteredCrops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500 gap-3">
                  <Search size={28} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد نتائج لـ "{cropSearch}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredCrops.map((crop) => {
                    const isSelected = draftCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        onClick={() => {
                          if (isSelected) {
                            setDraftCrops(draftCrops.filter(c => c !== crop));
                          } else {
                            setDraftCrops([...draftCrops, crop]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all border text-right ${
                          isSelected
                            ? 'bg-green-50 dark:bg-green-900/15 border-green-300 dark:border-green-700 text-gray-900 dark:text-white'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-primary'
                        }`}
                        role="checkbox"
                        aria-checked={isSelected}
                      >
                        <div className={`size-4 rounded border-2 grid place-items-center shrink-0 transition-all ${isSelected ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-gray-400 dark:border-gray-500'}`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="flex-1 min-w-0 truncate">{crop}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {draftCrops.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">{draftCrops.length}</span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {draftCrops.length > 0
                    ? `${draftCrops.length} محصول`
                    : 'لم يتم اختيار أي محصول'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowCropsModal(false); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => { saveUserCrops(draftCrops); setShowCropsModal(false); }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherScreen;
