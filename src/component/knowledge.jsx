import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Beaker, FlaskConical, Sprout, Bug, BookOpen, Leaf, Brain, Sparkles, ShieldCheck, Grid3x3, ArrowLeft, Hexagon } from 'lucide-react';
import heroLeaf from '../images/hero-leaf.jpeg';
import kbCalendar from '../images/kb-calendar.jpeg';
import kbNutrients from '../images/kb-nutrients.jpeg';
import kbSoil from '../images/kb-soil.jpeg';
import kbWeeds from '../images/kb-weeds.jpeg';
import kbCrops from '../images/kb-crops.jpeg';
import kbAcademic from '../images/kb-academic.webp';
import kbFertilizer2 from '../images/kb-fertilizer2.jpg';
import kbPlanner from '../images/kb-planner.jpeg';
import kbDiseases from '../images/kb-diseases.jpeg';
import kbPests from '../images/kb-pests.jpeg';
import kbPesticides from '../images/kb-pesticides.jpeg';
import kbFoodSafety from '../images/kb-food-safety.jpg';
import kbHoneyBees from '../images/kb-honey-bees.jpg';
import './knowledge.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const StatCard = ({ value, label, icon: Icon }) => (
  <motion.div
    variants={fadeUp}
    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/5"
  >
    <Icon className="h-5 w-5 text-primary" />
    <span className="text-xl font-black text-gray-900 dark:text-white">{value}</span>
    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
  </motion.div>
);

const KnowledgeBase = () => {
  const sectionIcons = {
    diseases: Leaf,
    insects: Bug,
    pesticides: FlaskConical,
    calendar: Calendar,
    'plant-elements': Beaker,
    fertilizer: FlaskConical,
    'soil-irri': Sprout,
    weeds: Bug,
    'plants-crops': Leaf,
    academic: BookOpen,
    'fertilizer-planner': Brain,
    'food-safety': ShieldCheck,
    'honey-bees': Hexagon,
  };

  const sections = [
    {
      id: 'diseases',
      title: 'الأمراض النباتية',
      title_en: 'Plant Diseases',
      description: 'تعرّف على الأمراض والأعراض وطرق العلاج والوقاية.',
      icon: '🌡️',
      img: kbDiseases,
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef444415, #ef444405)',
      path: '/knowledge-base/diseases',
      stats: { value: '200+', label: 'مرض' },
      tags: ['فطرية', 'بكتيرية', 'فيروسية', 'فسيولوجية']
    },
    {
      id: 'insects',
      title: 'الحشرات الضارة',
      title_en: 'Pests',
      description: 'تعرّف على الحشرات وطرق المكافحة المتكاملة.',
      icon: '🐛',
      img: kbPesticides,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b15, #f59e0b05)',
      path: '/knowledge-base/insects',
      stats: { value: '150+', label: 'حشرة' },
      tags: ['قارضة', 'ماصة', 'نيماتودا', 'أخرى']
    },
    {
      id: 'pesticides',
      title: 'المبيدات الزراعية',
      title_en: 'Pesticides',
      description: 'معلومات عن المبيدات وطرق الاستخدام والسلامة.',
      icon: '🧴',
      img: kbPests,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf615, #8b5cf605)',
      path: '/knowledge-base/pesticides',
      stats: { value: '150+', label: 'مبيد' },
      tags: ['أعشاب', 'فطرية', 'حشرية']
    },
    {
      id: 'calendar',
      title: 'التقويم الزراعي المصري',
      title_en: 'Agricultural Calendar',
      description: 'دليل شهري شامل لما تزرعه وما تعمله في كل شهر في مصر',
      icon: '📅',
      img: kbCalendar,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b98115, #10b98105)',
      path: '/knowledge-base/calendar',
      stats: { value: '12 شهر', label: 'دليل شهري' },
      tags: ['زراعة', 'حصاد', 'تسميد', 'تنبيهات']
    },
    {
      id: 'plant-elements',
      title: 'العناصر الغذائية للنبات',
      title_en: 'Plant Essential Nutrients',
      description: 'دليل شامل للعناصر الكبرى والصغرى، وظائفها وأعراض النقص والعلاج',
      icon: '🧪',
      img: kbNutrients,
      color: '#2D6A4F',
      bgGradient: 'linear-gradient(135deg, #2D6A4F15, #2D6A4F05)',
      path: '/knowledge-base/plant-elements',
      stats: { value: '16 عنصر', label: 'عنصر أساسي' },
      tags: ['نيتروجين', 'فوسفور', 'بوتاسيوم', 'عناصر صغرى']
    },
    {
      id: 'fertilizer',
      title: 'قاعدة بيانات الأسمدة',
      title_en: 'Fertilizers Database',
      description: 'دليل شامل للأسمدة الكيميائية والعضوية والحيوية مع طرق الاستخدام',
      icon: '🧴',
      img: kbFertilizer2,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b15, #f59e0b05)',
      path: '/knowledge-base/fertilizer',
      stats: { value: '52+ سماد', label: 'نوع سماد' },
      tags: ['يوريا', 'سوبر فوسفات', 'سلفات بوتاسيوم', 'عضوي']
    },
    {
      id: 'soil-irri',
      title: 'التربة المصرية والري',
      title_en: 'Egyptian Soils & Irrigation',
      description: 'أنواع التربة المصرية وخصائصها، أنظمة الري، واحتياجات المحاصيل المائية',
      icon: '🌱',
      img: kbSoil,
      color: '#8b5a2b',
      bgGradient: 'linear-gradient(135deg, #8b5a2b15, #8b5a2b05)',
      path: '/knowledge-base/soil-irri',
      stats: { value: '6 أنواع', label: 'تربة مصرية' },
      tags: ['تربة طميية', 'تربة رملية', 'ري بالتنقيط', 'احتياجات مائية']
    },
    {
      id: 'weeds',
      title: 'الحشائش والأعشاب الضارة',
      title_en: 'Weeds & Weed Management',
      description: 'دليل شامل للحشائش الضارة بالمحاصيل المصرية، التعريف والتشخيص والمكافحة',
      icon: '🌿',
      img: kbWeeds,
      color: '#5C4A1E',
      bgGradient: 'linear-gradient(135deg, #5C4A1E15, #5C4A1E05)',
      path: '/knowledge-base/weeds',
      stats: { value: '45+ نوع', label: 'حشيشة ضارة' },
      tags: ['نجيل شيطان', 'حلفا', 'سعد زراعة', 'هالوك']
    },
    {
      id: 'plants-crops',
      title: 'المحاصيل الزراعية',
      title_en: 'Plants & Crops Database',
      description: 'قاعدة بيانات شاملة للمحاصيل المصرية: قمح، أرز، ذرة، قطن، خضروات، فاكهة',
      icon: '🌾',
      img: kbCrops,
      color: '#2D6A4F',
      bgGradient: 'linear-gradient(135deg, #2D6A4F15, #2D6A4F05)',
      path: '/knowledge-base/plants-crops',
      stats: { value: '41+ محصول', label: 'نبات زراعي' },
      tags: ['قمح', 'أرز', 'ذرة', 'قطن', 'طماطم']
    },
    {
      id: 'academic',
      title: 'المراجع العلمية والمصطلحات',
      title_en: 'Academic References & Terminology',
      description: 'مرجع أكاديمي شامل للطلاب والمهندسين: مصطلحات، معادلات، مراجع موثقة، تصنيف نباتي',
      icon: '📚',
      img: kbAcademic,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f615, #3b82f605)',
      path: '/knowledge-base/academic',
      stats: { value: '30+ مصطلح', label: 'مصطلح علمي' },
      tags: ['قاموس', 'معادلات', 'مراجع', 'تصنيف نباتي']
    },
    {
      id: 'food-safety',
      title: 'جودة وسلامة الغذاء',
      title_en: 'Food Safety & Quality',
      description: 'المعايير الدولية، متبقيات المبيدات، السموم الفطرية، سلامة ما بعد الحصاد، التصدير.',
      icon: '🛡️',
      img: kbFoodSafety,
      color: '#059669',
      bgGradient: 'linear-gradient(135deg, #05966915, #05966905)',
      path: '/knowledge-base/food-safety',
      stats: { value: '12+', label: 'قسم' },
      tags: ['GlobalGAP', 'HACCP', 'MRL', 'تصدير']
    },
    {
      id: 'honey-bees',
      title: 'نحل العسل',
      title_en: 'Honey Bees',
      description: 'أنواع النحل، التقويم السنوي، النباتات العسلية، الأمراض، التلقيح، وإنتاج العسل في مصر.',
      icon: '🐝',
      img: kbHoneyBees,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b15, #f59e0b05)',
      path: '/knowledge-base/honey-bees',
      stats: { value: '9+', label: 'قسم' },
      tags: ['فاروا', 'عسل', 'تلقيح', 'مناحل']
    },
    {
      id: 'fertilizer-planner',
      title: 'مخطط التسميد الذكي',
      title_en: 'AI Fertilization Planner',
      description: 'نظام متطور لتحليل احتياجات التربة وتصميم برامج تسميد مخصصة لكل محصول بناءً على المساحة والمناخ',
      icon: '🌱',
      img: kbPlanner,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b98115, #10b98105)',
      path: '/program-planner',
      stats: { value: 'خطط دقيقة', label: 'مدعوم بالذكاء الاصطناعي' },
      tags: ['نيتروجين', 'فسفور', 'بوتاسيوم', 'توصيات ذكية']
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#0f1a09]" dir="rtl">
      {/* BackgroundFX */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #2D6A4F 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
        />
      </div>

      <div className="knowledge-shell relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />

        <div className="relative">
          {/* HERO */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative mt-6 overflow-hidden rounded-3xl border border-gray-200/60 bg-white/70 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[oklch(0.19_0.03_155/0.7)]"
          >
             <div className="grid min-h-[320px] md:min-h-[420px] grid-cols-1 lg:grid-cols-2">
              <div className="relative order-2 min-h-[200px] sm:min-h-[280px] lg:order-1">
                <img
                  src={heroLeaf}
                  alt="Green leaf"
                  width={1600}
                  height={1000}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              <div className="relative order-1 flex flex-col justify-center gap-4 sm:gap-6 p-6 sm:p-8 md:p-12 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="knowledge-eyebrow"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  منصة معرفة زراعية متكاملة
                </motion.div>

                <h1 className="knowledge-hero-title">
                  قاعدة المعرفة <span className="text-gradient">الزراعية</span>
                </h1>
                <p className="knowledge-hero-sub">
                  مكتبة شاملة للمعلومات الزراعية — كل ما تحتاجه في مكان واحد
                </p>

                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <StatCard value="98%" label="دقة المعلومات" icon={ShieldCheck} />
                  <StatCard value="+350" label="مادة علمية" icon={BookOpen} />
                  <StatCard value="7" label="أقسام رئيسية" icon={Grid3x3} />
                </div>
              </div>
            </div>
          </motion.section>

        {/* CATEGORY GRID */}
          <section className="mt-12 sm:mt-16 mb-12 sm:mb-16">
          <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sections.map((item, i) => {
              const Icon = sectionIcons[item.id];
              return (
              <Link to={item.path} key={item.id} className="block">
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="group relative rounded-3xl overflow-hidden border-2 border-white/[0.08] bg-[#0a1f15] bg-gradient-to-b from-[oklch(0.24_0.04_155/0.85)] to-[oklch(0.16_0.02_155/0.6)] backdrop-blur-xl shadow-none transition-all hover:border-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] min-h-[220px]"
                >
                  {item.img && (
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                  <div className="relative p-4 flex flex-col h-full">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="size-7 rounded-xl bg-primary/20 border border-primary/40 grid place-items-center">
                        {Icon && <Icon className="size-3.5 text-primary" />}
                      </div>
                      <h3 className="text-[14px] font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                      {item.description}
                    </p>
                    <div className="mb-2">
                      <div className="text-xl font-black text-primary leading-none">{item.stats.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{item.stats.label}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md glass border border-white/10 text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                      استعرض المحتوى
                      <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  </div>
  );
};

export default KnowledgeBase;
