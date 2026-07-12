import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Leaf, Send, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

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
      <h2 className="text-xl sm:text-3xl md:text-[42px] font-black tracking-tight leading-[1.3] text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[11px] sm:text-sm px-2">{subtitle}</p>}
    </motion.div>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 00-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.015 3.015 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l1.5 5.5L18 10l-4.5 1.5L12 17l-1.5-5.5L6 10l4.5-1.5z" />
      <path d="M18.5 5l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5z" />
    </svg>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (result.success) {
      toast.success("تم الإرسال بنجاح!");
    } else {
      toast.error(result.message || "حدث خطأ أثناء الإرسال");
    }

    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const contactInfo = [
    { icon: Mail, title: "البريد الإلكتروني", value: "elhfnaweedowidar21@gmail.com" },
    { icon: Phone, title: "الهاتف", value: "+20 11 02118765" },
    { icon: MapPin, title: "العنوان", value: "المنوفيه . مصر" },
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/elhfnawee.dowidar.5", icon: FacebookIcon, label: "Facebook" },
    { href: "https://wa.me/+201102118765", icon: Send, label: "WhatsApp" },
    { href: "https://www.youtube.com/@Eng-elhefnawy", icon: YoutubeIcon, label: "YouTube" },
    { href: "#", icon: InstagramIcon, label: "Instagram" },
    { href: "#", icon: SparklesIcon, label: "More" },
  ];

  return (
    <SectionShell id="contact" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-14">
      <SectionHeader
        eyebrow="CONTACT US"
        title={
          <>
            نحن هنا <span className="text-gradient">لمساعدتك</span>
            <Leaf className="inline-block size-7 text-primary ms-2 -translate-y-1" />
          </>
        }
        subtitle="فريقنا متاح للإجابة على استفساراتك وتقديم الدعم الفني"
      />

      <div className="relative mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-[1fr_1.4fr] lg:grid-cols-[1fr_1.4fr_1fr] gap-3 sm:gap-4 lg:gap-5">
        {/* Contact info card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 border border-gray-200 dark:border-white/[0.08]"
        >
          {contactInfo.map((c) => (
            <div key={c.title} className="flex items-start gap-3">
              <div className="size-9 sm:size-10 rounded-xl bg-primary/15 dark:bg-primary/15 border border-primary/30 dark:border-primary/30 grid place-items-center shrink-0">
                <c.icon className="size-4 sm:size-4 text-primary" />
              </div>
              <div>
                <div className="text-[12px] sm:text-[13px] font-bold text-gray-900 dark:text-white">{c.title}</div>
                <div className="text-[11px] sm:text-[12px] text-gray-500 dark:text-muted-foreground mt-0.5">{c.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-800/70 dark:backdrop-blur-xl shadow-lg dark:shadow-none"
        >
          <form className="space-y-3 sm:space-y-3" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 dark:text-muted-foreground mb-1.5 block">الاسم كامل</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="اسمك"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-white/[0.08] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 dark:text-muted-foreground mb-1.5 block">البريد الإلكتروني</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  placeholder="you@email.com"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-white/[0.08] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary transition-colors text-right"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 dark:text-muted-foreground mb-1.5 block">رقم الهاتف</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+20 XXX XXX XXXX"
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-white/[0.08] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 dark:text-muted-foreground mb-1.5 block">الرسالة</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="اكتب رسالتك هنا..."
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-white/[0.08] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-primary text-primary-foreground dark:text-white py-3 text-sm font-bold shadow-[0_10px_30px_-8px_rgba(82,183,136,0.6)] hover:brightness-110 transition-all disabled:opacity-60"
            >
              {isSubmitting ? "جاري الإرسال..." : (
                <>
                  إرسال الرسالة
                  <Send className="size-4" />
                </>
              )}
            </button>
            {submitStatus === 'success' && (
              <div className="text-center text-sm text-primary font-bold py-2 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/30">
                تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
              </div>
            )}
          </form>
        </motion.div>

        {/* Follow + response */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-3 sm:space-y-4 lg:space-y-5"
        >
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-gray-900 dark:text-white">تابعنا</div>
              <ChevronLeft className="size-4 text-gray-400 dark:text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 grid place-items-center text-gray-600 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-white/[0.08]">
            <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-muted-foreground mb-2 uppercase tracking-wider">
              نرد عادة خلال
            </div>
            <div className="flex items-end gap-2">
              <div className="text-4xl sm:text-5xl font-black text-primary leading-none">24</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground pb-1">ساعة</div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-primary rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default ContactSection;
