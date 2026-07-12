import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Bug, FlaskConical, ArrowLeft } from 'lucide-react';
import kbDiseases from '../images/kb-diseases.jpeg';
import kbPests from '../images/kb-pests.jpeg';
import kbPesticides from '../images/kb-pesticides.jpeg';

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
      className="text-center space-y-3 mb-8 sm:mb-12"
    >
      <div className="text-[11px] font-bold tracking-[0.25em] text-primary">{eyebrow}</div>
      <h2 className="text-2xl sm:text-3xl md:text-[42px] font-black tracking-tight leading-[1.5] text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm">{subtitle}</p>}
    </motion.div>
  );
}

const KnowledgePreview = () => {
  const cards = [
    {
      icon: Leaf,
      title: "الأمراض النباتية",
      count: "200+",
      countLabel: "مرض",
      desc: "تعرّف على الأمراض والأعراض وطرق العلاج والوقاية.",
      img: kbDiseases,
      tags: ["فطرية", "بكتيرية", "فيروسية", "فسيولوجية"],
      cta: "استكشف الأمراض",
      to: "/knowledge-base/diseases",
    },
    {
      icon: Bug,
      title: "الحشرات الضارة",
      count: "150+",
      countLabel: "حشرة",
      desc: "تعرّف على الحشرات وطرق المكافحة المتكاملة.",
      img: kbPests,
      tags: ["قارضة", "ماصة", "نيماتودا", "أخرى"],
      cta: "استكشف الحشرات",
      to: "/knowledge-base/insects",
    },
    {
      icon: FlaskConical,
      title: "المبيدات الزراعية",
      count: "150+",
      countLabel: "مبيد",
      desc: "معلومات عن المبيدات وطرق الاستخدام والسلامة.",
      img: kbPesticides,
      tags: ["أعشاب", "فطرية", "حشرية"],
      cta: "استكشف المبيدات",
      to: "/knowledge-base/pesticides",
    },
  ];

  return (
    <SectionShell id="knowledge" className="py-20 px-4 sm:px-6 lg:px-14">
      <SectionHeader
        eyebrow="KNOWLEDGE BASE"
        title={
          <>
            استكشف قاعدة <span className="text-gradient">بياناتنا الشاملة</span>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5" dir="rtl">
        {cards.map((c, i) => (
          <Link to={c.to} key={c.title} className="block">
            <motion.div
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl overflow-hidden border-2 border-gray-400 dark:border-white/[0.08] bg-gray-50/80 dark:bg-gray-800/50 dark:backdrop-blur-xl backdrop-blur-sm shadow-[0_8px_30px_-10px_rgba(0,0,0,0.2)] dark:shadow-none transition-all hover:border-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] min-h-[300px]"
            >
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover dark:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="relative p-6 flex flex-col h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-9 rounded-xl bg-primary/20 border border-primary/40 grid place-items-center">
                    <c.icon className="size-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                </div>
                <p className="text-[12px] text-white/80 dark:text-gray-400 leading-relaxed mb-4 max-w-[70%]">
                  {c.desc}
                </p>
                <div className="mb-4">
                  <div className="text-4xl font-black text-primary leading-none">{c.count}</div>
                  <div className="text-[11px] text-white/70 dark:text-gray-400 mt-1">{c.countLabel}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-1 rounded-md glass border border-white/10 text-white/70 dark:text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {c.cta}
                  <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
};

export default KnowledgePreview;
