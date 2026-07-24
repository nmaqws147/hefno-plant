export default function DiagnosisLoader() {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl sm:rounded-2xl">
      <div className="scan-line" />
      <div className="shimmer-bg absolute inset-0" />
      <div className="flex items-center gap-2 text-white text-sm font-semibold z-10">
        <div className="flex gap-1">
          <span className="dot-anim" />
          <span className="dot-anim" />
          <span className="dot-anim" />
        </div>
        جاري تحليل حالة النبات...
      </div>
    </div>
  );
}
