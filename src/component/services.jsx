import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, CloudSun, BookOpen, Camera, ArrowUpLeft, ArrowLeft, Leaf } from 'lucide-react';
import mascotAi from './mascot-ai.png';
import mascotWeather from './mascot-weather.png';
import mascotBooks from './mascot-books.png';
import mascotScan from './mascot-scan.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

function SectionShell({ id, children, className = "" }) {
  return (
    <section
      id={id}
      className={`relative border-t border-b border-gray-200/60 dark:border-white/[0.06] bg-gradient-to-b from-gray-50 to-white dark:from-[oklch(0.19_0.03_155)] dark:to-[oklch(0.14_0.02_155)] overflow-x-hidden ${className}`}
    >
      <div className="absolute inset-0 grid-bg opacity-[0.15] dark:opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="relative">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8 lg:mb-12"
    >
      <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-primary">{eyebrow}</div>
      <h2 className="text-xl sm:text-3xl md:text-[42px] font-black tracking-tight leading-[1.5] text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[11px] sm:text-sm px-2">{subtitle}</p>}
    </motion.div>
  );
}

function Services() {
  const services = [
    {
      icon: Bot,
      title: "التحدث مع الذكاء الاصطناعي",
      desc: "استشارات فورية والتحقق من المعلومات الزراعية بواسطة المساعد الذكي.",
      cta: "افتح المساعد",
      mascot: mascotAi,
      to: "/ai-chat",
      hue: "from-emerald-500/30 to-transparent",
      badgeColor: "bg-emerald-50 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-400/30",
      iconColor: "text-emerald-600 dark:text-white",
    },
    {
      icon: CloudSun,
      title: "الطقس",
      desc: "تحديثات الطقس اليومية وتأثيرها على المحاصيل الزراعية.",
      cta: "تحقق من الطقس",
      mascot: mascotWeather,
      to: "/weather",
      hue: "from-sky-500/30 to-transparent",
      badgeColor: "bg-sky-50 border-sky-300 dark:bg-sky-500/15 dark:border-sky-400/30",
      iconColor: "text-sky-600 dark:text-white",
    },
    {
      icon: BookOpen,
      title: "قاعدة المعرفة",
      desc: "مكتبة شاملة للمبيدات والحشرات والأمراض النباتية.",
      cta: "استكشف الآن",
      mascot: mascotBooks,
      to: "/knowledge-base",
      hue: "from-violet-500/30 to-transparent",
      badgeColor: "bg-violet-50 border-violet-300 dark:bg-violet-500/15 dark:border-violet-400/30",
      iconColor: "text-violet-600 dark:text-white",
    },
    {
      icon: Camera,
      title: "فحص النبات",
      desc: "تشخيص فوري لأمراض النباتات بدقة عالية باستخدام الذكاء الاصطناعي.",
      cta: "شخّص الآن",
      mascot: mascotScan,
      to: "/diagnose",
      hue: "from-primary/30 to-transparent",
      badgeColor: "bg-green-50 border-green-300 dark:bg-primary/15 dark:border-primary/30",
      iconColor: "text-green-600 dark:text-white",
    },
  ];
  return (
    <SectionShell id="services" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-14">
      <SectionHeader
        eyebrow="AI SERVICES"
        title={
          <>
            حلول ذكية <span className="text-emerald-600 dark:text-emerald-400">لكل مزارع</span>
            <Leaf className="inline-block size-7 text-primary ms-2 -translate-y-1" />
          </>
        }
        subtitle="أدوات ذكاء اصطناعي قوية مصمّمة لدعمك في كل خطوة من رحلتك الزراعية."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {services.map((s, i) => (
          <Link to={s.to} key={s.title} className="block h-full">
          <motion.div
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-5 pb-4 sm:pb-5 lg:pb-6 border-2 border-gray-300 dark:border-white/[0.08] bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl shadow-lg dark:shadow-none transition-all hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_30px_60px_-20px_rgba(82,183,136,0.5)] dark:hover:shadow-[0_30px_60px_-20px_rgba(82,183,136,0.4)] min-h-[220px] sm:min-h-[300px] lg:min-h-[340px] flex flex-col"
          >
            <div
              className={`absolute -top-8 sm:-top-10 -right-8 sm:-right-10 size-32 sm:size-40 lg:size-56 rounded-full bg-gradient-to-br ${s.hue} blur-3xl opacity-80 dark:opacity-80`}
            />
            <div className="relative flex items-start justify-between">
              <div
                className={`size-10 sm:size-11 rounded-xl border grid place-items-center ${s.badgeColor} backdrop-blur`}
              >
                <s.icon className={`size-4 sm:size-5 ${s.iconColor}`} />
              </div>
              <div className="size-7 sm:size-8 rounded-lg bg-gray-100 dark:bg-transparent dark:glass grid place-items-center opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
                <ArrowUpLeft className="size-3.5 sm:size-4 text-gray-600 dark:text-white" />
              </div>
            </div>

            {/* mascot */}
            <div className="relative flex-1 flex items-center justify-center my-2 sm:my-3 min-h-[80px] sm:min-h-[120px] lg:min-h-[140px]">
              <motion.img
                src={s.mascot}
                alt=""
                loading="lazy"
                className="max-h-[80px] sm:max-h-[120px] lg:max-h-[160px] w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative space-y-1.5 sm:space-y-2">
              <h3 className="text-[13px] sm:text-base lg:text-lg font-bold leading-tight text-gray-900 dark:text-white">{s.title}</h3>
              <p className="text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {s.desc}
              </p>
              <div className="pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 dark:bg-primary/15 border border-primary/40 dark:border-primary/30 text-primary px-3 py-1.5 text-[12px] font-bold">
                  {s.cta}
                  <ArrowLeft className="size-3" />
                </span>
              </div>
            </div>
          </motion.div>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

export default Services;
