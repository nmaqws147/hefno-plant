const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const validateImage = (file) => {
  if (!file) return 'الرجاء اختيار صورة';
  if (!ALLOWED_TYPES.includes(file.type)) return 'نوع الصورة غير مدعوم — JPG, PNG, WebP, AVIF فقط';
  if (file.size > MAX_SIZE) return 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت';
  return null;
};

export const uploadProfileImage = async (uid, base64DataUrl, onProgress) => {
  if (onProgress) onProgress(50);

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64DataUrl, uid }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل رفع الصورة');
  }

  if (onProgress) onProgress(100);

  const data = await res.json();
  return data.url;
};

export const deleteProfileImage = async () => {};
