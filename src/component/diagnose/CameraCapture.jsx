import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('تم رفض صلاحية الكاميرا — يرجى السماح بالوصول إلى الكاميرا من إعدادات المتصفح');
      } else if (err.name === 'NotFoundError') {
        setError('لم يتم العثور على كاميرا — يرجى استخدام رفع الصورة بدلاً من ذلك');
      } else {
        setError('تعذر فتح الكاميرا — يرجى استخدام رفع الصورة بدلاً من ذلك');
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onCapture(dataUrl);
  };

  if (error) {
    return (
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/50 p-8 text-center">
        <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">تعذر فتح الكاميرا</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">إلغاء</button>
          <button onClick={startCamera} className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-all">محاولة مرة أخرى</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-black overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        onCanPlay={() => setReady(true)}
        className="w-full max-h-[500px] object-cover"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={handleCapture}
          disabled={!ready}
          className="size-14 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg"
        >
          <div className="size-10 rounded-full border-2 border-emerald-600" />
        </button>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 left-3 size-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all flex items-center justify-center"
      >
        <X size={16} />
      </button>
    </div>
  );
}
