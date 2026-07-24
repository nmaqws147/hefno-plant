import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Sparkles, Sprout, FlaskConical, ArrowLeft } from 'lucide-react';
import heroBg from './hero-drone.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

function Hero() {
  const stats = [
    { v: "97%", l: "دقة التشخيص", i: ShieldCheck },
    { v: "50K+", l: "مزارع يثقون بنا", i: Users },
    { v: "24/7", l: "مساعد ذكي", i: Sparkles },
    { v: "200+", l: "مرض نباتي", i: Sprout },
    { v: "150+", l: "مبيد زراعي", i: FlaskConical },
  ];
  return (
    <section id="home" className="relative overflow-x-hidden dark:bg-[#0a1f15] bg-[#0a1f15]">
      <div
        className="relative w-full bg-cover bg-center bg-no-repeat shadow-[0_60px_140px_-30px_oklch(0.05_0.02_150/0.95)]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_transparent_0%,_oklch(0.16_0.02_155/0.6)_70%)]" />
        <div className="absolute -top-40 right-1/3 size-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-8 items-start lg:items-center px-4 sm:px-8 lg:px-14 py-16 lg:py-24">
          {/* text side (right in RTL) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 lg:space-y-6 order-2 lg:order-1 lg:col-start-1">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider bg-[rgba(10,31,21,0.8)] border border-primary/40 text-primary uppercase"
            >
              AI POWERED AGRICULTURE
            </motion.span>
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-[32px] md:text-[44px] font-black leading-[1.3] tracking-normal text-white"
            >
              منصة الزراعة الذكية
              <br />
              <span className="text-gradient inline-block pb-1">التي تضع المعرفة في جيبك</span>
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-[15px] text-gray-300/90 max-w-lg leading-relaxed"
            >
              حيث تلتقي التكنولوجيا بالطبيعة — تشخيص دقيق، معرفة شاملة،{" "}
              <span className="text-primary font-semibold">أفضل القرارات الزراعية</span>.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/knowledge-base"
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-emerald-400 to-primary text-primary-foreground px-5 py-3 font-bold text-sm shadow-[0_10px_30px_-8px_oklch(0.78_0.19_148/0.6)] hover:brightness-110 transition-all"
              >
                استكشف قاعدة المعرفة
                <span className="size-6 rounded-md bg-white/20 grid place-items-center">
                  <ArrowLeft className="size-3.5" />
                </span>
              </Link>
              <Link
                to="/diagnose"
                className="inline-flex items-center gap-2 rounded-lg bg-[rgba(10,31,21,0.8)] border border-white/10 px-5 py-3 font-bold text-sm hover:bg-white/5 transition-all text-white"
              >
                تشخيص نباتك الآن
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative order-1 lg:order-2 hidden lg:block" />
        </div>
      </div>

      {/* stats row */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="relative px-6 pt-6 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-white/10"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            custom={i}
            variants={fadeUp}
            className="bg-[rgba(10,31,21,0.8)] rounded-2xl p-4 flex items-center gap-3 border border-white/5 hover:border-primary/30 transition-colors"
          >
            <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
              <s.i className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-lg font-black leading-none text-white">{s.v}</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{s.l}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Hero;
