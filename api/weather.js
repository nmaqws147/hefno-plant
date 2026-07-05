
import fs from 'fs';
import path from 'path';

function loadWeatherAlertsData() {
  try {
    const dataPath = path.join(process.cwd(), 'api', 'weather-data', 'weather_alerts.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading weather alerts:', error.message);
    return null;
  }
}

function evaluateRisks(weatherData, alertsData, userCrops = []) {
  const alerts = [];
  const current = weatherData.current || {};
  const forecast24h = weatherData.forecast_24h || {};
  const forecast72h = weatherData.forecast_72h || {};

  const checkCondition = (condition, currentData, forecast24Data, forecast72Data) => {
    const param = condition.param;
    let value = null;

    if (param.includes('.')) {
      const parts = param.split('.');
      if (parts[0] === 'forecast_24h') value = forecast24Data[parts[1]];
      else if (parts[0] === 'forecast_72h') value = forecast72Data[parts[1]];
    } else {
      value = currentData[param];
    }

    if (value === undefined || value === null) return false;

    switch (condition.op) {
      case '>=': return value >= condition.value;
      case '<=': return value <= condition.value;
      case '>': return value > condition.value;
      case '<': return value < condition.value;
      case 'between': return value >= condition.min && value <= condition.max;
      default: return false;
    }
  };

  const checkConditions = (ruleConditions, currentData, forecast24Data, forecast72Data) => {
    if (ruleConditions.operator === 'AND') {
      return ruleConditions.conditions.every(cond => 
        checkCondition(cond, currentData, forecast24Data, forecast72Data)
      );
    } else if (ruleConditions.operator === 'OR') {
      return ruleConditions.conditions.some(cond => 
        checkCondition(cond, currentData, forecast24Data, forecast72Data)
      );
    }
    return false;
  };

  for (const category of alertsData.alert_categories || []) {
    for (const rule of category.rules || []) {
      if (userCrops.length > 0) {
        const hasMatchingCrop = rule.affected_crops.some(crop => 
          userCrops.some(uc => uc.toLowerCase() === crop.toLowerCase())
        );
        if (!hasMatchingCrop && userCrops.length > 0) continue;
      }

      const conditionsMet = checkConditions(
        rule.trigger_conditions,
        current,
        forecast24h,
        forecast72h
      );

      if (conditionsMet) {
        alerts.push({
          category_id: category.category_id,
          category_ar: category.category_ar,
          category_en: category.category_en,
          icon: category.icon,
          priority: category.priority,
          rule_id: rule.rule_id,
          disease_ar: rule.disease_ar,
          disease_en: rule.disease_en,
          risk_level: rule.risk_level,
          alert_ar: rule.alert_ar,
          alert_en: rule.alert_en,
          recommendations: rule.recommendations_ar,
          urgency_hours: rule.urgency_hours,
          affected_crops: rule.affected_crops,
          timing: rule.timing
        });
      }
    }
  }

  if (current.temperature_c > 38) {
    alerts.push({
      category_id: 'extreme_heat',
      category_ar: 'حرارة شديدة',
      icon: '🔥',
      priority: 'critical',
      risk_level: 'critical',
      alert_ar: `⚠️ تحذير عاجل! درجة الحرارة ${current.temperature_c}°م — خطر إجهاد حراري`,
      recommendations: ['الري المبكر عند الفجر', 'تجنب الرش الكيميائي في ذروة الحرارة'],
      urgency_hours: 6
    });
  }

  if (current.temperature_c < 2 && forecast24h.min_temp_c < 0) {
    alerts.push({
      category_id: 'frost_risk',
      category_ar: 'خطر الصقيع',
      icon: '❄️',
      priority: 'critical',
      risk_level: 'critical',
      alert_ar: `❄️ تحذير من الصقيع! الحرارة ${current.temperature_c}°م`,
      recommendations: ['الري بالرش الخفيف', 'تغطية المحاصيل الحساسة'],
      urgency_hours: 12
    });
  }

  if (current.wind_speed_kmh > 30) {
    alerts.push({
      category_id: 'high_wind',
      category_ar: 'رياح قوية',
      icon: '💨',
      priority: 'high',
      risk_level: 'high',
      alert_ar: `💨 رياح شديدة ${current.wind_speed_kmh} كم/س`,
      recommendations: ['تثبيت البيوت المحمية', 'تأجيل الرش الكيميائي'],
      urgency_hours: 6
    });
  }

  if (forecast24h.rain_probability_pct > 70 && forecast24h.expected_rainfall_mm > 20) {
    alerts.push({
      category_id: 'heavy_rain',
      category_ar: 'أمطار غزيرة',
      icon: '🌧️',
      priority: 'high',
      risk_level: 'high',
      alert_ar: `🌧️ أمطار غزيرة متوقعة (${forecast24h.expected_rainfall_mm} مم)`,
      recommendations: ['تأكد من جاهزية قنوات الصرف', 'لا تسمد قبل المطر'],
      urgency_hours: 12
    });
  }

  if (current.wind_speed_kmh < 10 && current.humidity_pct > 60 && current.humidity_pct < 80 && 
      current.temperature_c > 15 && current.temperature_c < 28) {
    alerts.push({
      category_id: 'optimal_spray',
      category_ar: 'فرصة مثالية للرش',
      icon: '✅',
      priority: 'info',
      risk_level: 'info',
      alert_ar: `✅ فرصة مثالية للرش — ريح ${current.wind_speed_kmh} كم/س — حرارة ${current.temperature_c}°م`,
      recommendations: ['استثمر هذه الفرصة لأي رش وقائي'],
      urgency_hours: 8
    });
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, info: 3 };
  alerts.sort((a, b) => priorityOrder[a.risk_level] - priorityOrder[b.risk_level]);

  return alerts;
}

function getWeatherDescription(weather) {
  if (weather.rainfall_mm_last24h > 0) return '🌧️ ممطر';
  if (weather.cloud_cover_pct > 80) return '☁️ غائم';
  if (weather.cloud_cover_pct > 50) return '⛅ غائم جزئياً';
  if (weather.temperature_c > 35) return '🔥 حار جداً';
  if (weather.temperature_c < 10) return '❄️ بارد';
  return '☀️ مشمس';
}

function getTopRecommendations(alerts, current, forecast) {
  const recommendations = [];
  
  const criticalAlerts = alerts.filter(a => a.risk_level === 'critical');
  const highAlerts = alerts.filter(a => a.risk_level === 'high');
  
  for (const alert of [...criticalAlerts, ...highAlerts].slice(0, 3)) {
    if (alert.recommendations && alert.recommendations.length > 0) {
      recommendations.push({
        priority: alert.risk_level,
        title: alert.disease_ar || alert.category_ar,
        message: alert.recommendations[0],
        full_recommendations: alert.recommendations
      });
    }
  }
  
  if (recommendations.length === 0) {
    if (current.temperature_c > 30) {
      recommendations.push({
        priority: 'info',
        title: 'نصائح للحرارة',
        message: 'ري المحاصيل صباحاً قبل ارتفاع الحرارة'
      });
    }
    if (current.humidity_pct > 70) {
      recommendations.push({
        priority: 'info',
        title: 'الرطوبة العالية',
        message: 'حسن التهوية في البيوت المحمية'
      });
    }
    if (forecast.rain_probability_pct > 50) {
      recommendations.push({
        priority: 'info',
        title: 'استعداد للمطر',
        message: 'تأكد من جاهزية قنوات الصرف'
      });
    }
  }
  
  return recommendations;
}

function getFarmingTips(current, forecast) {
  const tips = [];
  
  if (current.temperature_c < 15) {
    tips.push('🌡️ درجات حرارة منخفضة — قلل الري وتجنب الزراعات الحساسة');
  }
  if (current.wind_speed_kmh > 20) {
    tips.push('💨 رياح نشطة — تجنب الرش الكيميائي وثبت البيوت المحمية');
  }
  if (current.humidity_pct > 80) {
    tips.push('💧 رطوبة عالية — خطر الأمراض الفطرية، حسّن التهوية');
  }
  if (forecast.rain_probability_pct > 60) {
    tips.push('🌧️ أمطار متوقعة — جهز قنوات الصرف وتجنب التسميد');
  }
  
  if (tips.length === 0) {
    tips.push('✅ الظروف الجوية مناسبة — يمكن متابعة الأنشطة الزراعية الطبيعية');
  }
  
  return tips;
}

function buildWeatherResponse(weatherData, alerts, userCrops) {
  const current = weatherData.current || {};
  const forecast24h = weatherData.forecast_24h || {};
  const forecast72h = weatherData.forecast_72h || {};

  let generalStatus = 'good';
  let generalMessage = '';

  if (alerts.some(a => a.risk_level === 'critical')) {
    generalStatus = 'critical';
    generalMessage = '⚠️ هناك تحذيرات عاجلة يجب اتخاذ إجراء فوري';
  } else if (alerts.some(a => a.risk_level === 'high')) {
    generalStatus = 'warning';
    generalMessage = '⚠️ هناك تنبيهات مهمة يُنصح بمتابعتها';
  } else if (alerts.some(a => a.risk_level === 'medium')) {
    generalStatus = 'moderate';
    generalMessage = 'ℹ️ هناك ملاحظات يمكن أخذها في الاعتبار';
  } else {
    generalStatus = 'good';
    generalMessage = '✅ الظروف الجوية مناسبة للأنشطة الزراعية';
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    general_status: generalStatus,
    general_message: generalMessage,
    current_weather: {
      temperature: current.temperature_c,
      humidity: current.humidity_pct,
      wind_speed: current.wind_speed_kmh,
      wind_direction: current.wind_direction,
      rainfall: current.rainfall_mm_last24h || 0,
      cloud_cover: current.cloud_cover_pct,
      pressure: current.pressure_hpa,
      visibility: current.visibility_km,
      description: getWeatherDescription(current)
    },
    forecast: {
      today: {
        max_temp: forecast24h.max_temp_c,
        min_temp: forecast24h.min_temp_c,
        rain_probability: forecast24h.rain_probability_pct,
        expected_rainfall: forecast24h.expected_rainfall_mm,
        avg_humidity: forecast24h.avg_humidity_pct
      },
      next_72h: {
        rain_probability: forecast72h.rain_probability_pct,
        max_temp: forecast72h.max_temp_c,
        min_temp: forecast72h.min_temp_c,
        frost_risk: forecast72h.frost_risk,
        heat_wave_risk: forecast72h.heat_wave_risk
      }
    },
    alerts: alerts,
    recommendations: getTopRecommendations(alerts, current, forecast24h),
    user_crops: userCrops,
    farming_tips: getFarmingTips(current, forecast24h)
  };
}

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.WEATHER; 
    const BASE_URL = "https://api.openweathermap.org/data/2.5";
    
    if (!API_KEY) {
      console.error("WEATHER_API_KEY is missing");
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    const query = req.query || {};
    const mode = query.mode || "current";
    const userCrops = query.crops ? query.crops.split(',') : [];

    if (mode === "current") {
      const { lat, lon } = query;

      if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon are required" });
      }

      const weatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=ar&appid=${API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      if (weatherResponse.status !== 200) {
        return res.status(weatherResponse.status).json({ error: weatherData.message });
      }

      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ar&appid=${API_KEY}&cnt=8`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      const current = {
        temperature_c: weatherData.main?.temp,
        humidity_pct: weatherData.main?.humidity,
        wind_speed_kmh: weatherData.wind?.speed ? weatherData.wind.speed * 3.6 : 0,
        wind_direction: weatherData.wind?.deg,
        rainfall_mm_last24h: weatherData.rain?.rain?.['1h'] || 0,
        cloud_cover_pct: weatherData.clouds?.all,
        pressure_hpa: weatherData.main?.pressure,
        visibility_km: weatherData.visibility ? weatherData.visibility / 1000 : 10
      };

      const forecast24h = {
        max_temp_c: Math.max(...(forecastData.list?.slice(0, 8).map(item => item.main.temp_max) || [current.temperature_c])),
        min_temp_c: Math.min(...(forecastData.list?.slice(0, 8).map(item => item.main.temp_min) || [current.temperature_c])),
        rain_probability_pct: Math.max(...(forecastData.list?.slice(0, 8).map(item => item.pop || 0) || [0])) * 100,
        expected_rainfall_mm: forecastData.list?.slice(0, 8).reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0) || 0,
        avg_humidity_pct: forecastData.list?.slice(0, 8).reduce((sum, item) => sum + item.main.humidity, 0) / 8 || current.humidity_pct
      };

      const forecast72h = {
        rain_probability_pct: Math.max(...(forecastData.list?.slice(0, 24).map(item => item.pop || 0) || [0])) * 100,
        max_temp_c: Math.max(...(forecastData.list?.slice(0, 24).map(item => item.main.temp_max) || [current.temperature_c])),
        min_temp_c: Math.min(...(forecastData.list?.slice(0, 24).map(item => item.main.temp_min) || [current.temperature_c])),
        frost_risk: Math.min(...(forecastData.list?.slice(0, 24).map(item => item.main.temp_min) || [0])) < 2,
        heat_wave_risk: Math.max(...(forecastData.list?.slice(0, 24).map(item => item.main.temp_max) || [0])) > 38
      };

      const weatherInput = { current, forecast_24h: forecast24h, forecast_72h: forecast72h };

      const alertsData = loadWeatherAlertsData();
      let alerts = [];
      if (alertsData) {
        alerts = evaluateRisks(weatherInput, alertsData, userCrops);
      }

      const response = buildWeatherResponse(weatherInput, alerts, userCrops);
      response.raw_weather = {
        city: weatherData.name,
        country: weatherData.sys?.country,
        coordinates: { lat, lon }
      };

      return res.status(200).json(response);
    }

    if (mode === "search") {
      const { q } = query;
      if (!q) {
        return res.status(400).json({ error: "search query 'q' is required" });
      }

      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`;
      const response = await fetch(geoUrl);
      const data = await response.json();

      return res.status(200).json(data);
    }

    if (mode === "reverse") {
      const { lat, lon } = query;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      const response = await fetch(geoUrl);
      const data = await response.json();

      return res.status(200).json(data);
    }

    return res.status(400).json({ error: "Invalid mode value" });

  } catch (err) {
    console.error("Weather API Error:", err.message);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};