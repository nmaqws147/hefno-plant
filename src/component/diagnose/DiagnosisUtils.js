const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export const validateImage = (file) => {
  if (!file) return { valid: false, error: 'الرجاء اختيار صورة' };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الصورة غير مدعوم — يرجى استخدام JPG, PNG, أو WebP' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `حجم الصورة كبير جداً — الحد الأقصى 15 ميجابايت` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'الملف تالف أو فارغ — يرجى اختيار صورة أخرى' };
  }
  return { valid: true, error: null };
};

export const compressImage = (file, maxWidth = 1200, maxHeight = 1200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        } else {
          if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => reject(new Error('فشل تحميل الصورة'));
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
  });
};

export const formatDate = (date) => {
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const safeArray = (arr) => {
  if (!arr) return [];
  return Array.isArray(arr) ? arr : (typeof arr === 'string' ? [arr] : []);
};

export const getHealthStatusClass = (status) => {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s.includes('جيدة') || s.includes('جيد') || s.includes('سليم')) return 'good';
  if (s.includes('متوسطة') || s.includes('متوسط')) return 'warning';
  if (s.includes('سيئة') || s.includes('سيء') || s.includes('حرجة')) return 'critical';
  return 'unknown';
};

export const getSeverityClass = (severity) => {
  if (!severity) return 'unknown';
  const s = severity.toLowerCase();
  if (s.includes('خفيفة') || s.includes('mild')) return 'mild';
  if (s.includes('متوسطة') || s.includes('moderate')) return 'moderate';
  if (s.includes('شديدة') || s.includes('severe')) return 'severe';
  return 'unknown';
};

export const severityBadge = (severity) => {
  const cls = getSeverityClass(severity);
  if (cls === 'mild') return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
  if (cls === 'moderate') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
  if (cls === 'severe') return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
  return 'bg-gray-50 dark:bg-gray-800 text-gray-500';
};

export const CAPTURE_KEY = Symbol('capture');
