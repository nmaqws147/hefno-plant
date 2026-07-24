import { useEffect } from 'react';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import './terms.css';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: 'مقدمة',
      content: 'مرحباً بك في HEFNOPLANT. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل استخدام خدماتنا.',
    },
    {
      title: 'قبول الشروط',
      content: 'باستخدامك للمنصة، فإنك تقر بأنك قد قرأت وفهمت وتوافق على الالتزام بجميع الشروط والأحكام المذكورة في هذه الوثيقة. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.',
    },
    {
      title: 'خدمات المنصة',
      content: 'تقدم HEFNOPLANT مجموعة من الخدمات الزراعية المتكاملة بما في ذلك:',
      items: [
        'تشخيص الأمراض النباتية باستخدام تقنيات الذكاء الاصطناعي',
        'معلومات الطقس والتقويم الزراعي',
        'قاعدة معرفية شاملة للمعلومات الزراعية',
        'مخططات البرامج التسميدية',
        'استشارات زراعية عبر المساعد الذكي',
      ],
    },
    {
      title: 'حساب المستخدم',
      content: 'عند إنشاء حساب على المنصة، أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب عليك إبلاغنا فوراً بأي استخدام غير مصرح به لحسابك. نحن غير مسؤولين عن أي خسائر ناتجة عن عدم التزامك بهذا الشرط.',
    },
    {
      title: 'الملكية الفكرية',
      content: 'جميع المحتويات المتاحة على المنصة، بما في ذلك النصوص والصور والرسومات والشعارات والبرامج، هي ملك لـ HEFNOPLANT أو مرخصة لنا، ومحمية بموجب قوانين الملكية الفكرية. لا يجوز نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي مسبق.',
    },
    {
      title: 'استخدام المحتوى',
      content: 'المعلومات المتوفرة على المنصة هي لأغراض تعليمية وإرشادية فقط. نبذل قصارى جهدنا لضمان دقة المعلومات، ولكننا لا نضمن اكتمالها أو ملاءمتها لغرض معين. يُنصح باستشارة خبراء زراعيين معتمدين قبل اتخاذ قرارات زراعية مهمة.',
    },
    {
      title: 'خصوصية البيانات',
      content: 'نحن نلتزم بحماية خصوصية بياناتك الشخصية. يرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام وحماية معلوماتك.',
    },
    {
      title: 'إخلاء المسؤولية',
      content: 'تُقدم المنصة وخدماتها "كما هي" دون أي ضمانات، صريحة أو ضمنية. نحن لا نضمن أن المنصة ستكون خالية من الأخطاء أو الانقطاعات. في أي حال من الأحوال، لا تتحمل HEFNOPLANT المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة.',
    },
    {
      title: 'تعديل الشروط',
      content: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر التغييرات على هذه الصفحة، ويعتبر استمرار استخدام المنصة بعد نشر التغييرات قبولاً منها.',
    },
    {
      title: 'القانون الواجب التطبيق',
      content: 'تخضع هذه الشروط والأحكام وتُفسر وفقاً لقوانين جمهورية مصر العربية. أي نزاعات تنشأ عن هذه الشروط تخضع للاختصاص القضائي الحصري للمحاكم المصرية.',
    },
    {
      title: 'اتصل بنا',
      content: 'للاستفسارات المتعلقة بهذه الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني: elhfnaweedowidar21@gmail.com',
    },
  ];

  return (
    <div className="hefno-terms">
      <SEO title="الشروط والأحكام" description="الشروط والأحكام الخاصة باستخدام منصة Hefno-Plant — قواعد الاستخدام والحقوق والمسؤوليات." url="/terms" keywords="شروط وأحكام, Hefno-Plant, قواعد الاستخدام" breadcrumbs={makeBreadcrumbs('/terms')} />
      <div className="hefno-terms-hero">
        <div className="hefno-terms-hero-inner">
          <div className="hefno-terms-hero-label">الشروط والأحكام</div>
          <h1 className="hefno-terms-hero-title">
            اتفاقية
            <span className="hefno-terms-hero-title-accent">الاستخدام</span>
          </h1>
          <p className="hefno-terms-hero-sub">
            نضع بين يديك الشروط التي تنظم استخدامك للمنصة وتحدد حقوقك ومسؤولياتك
          </p>
          <div className="hefno-terms-hero-meta">
            آخر تحديث: يوليو 2026
          </div>
        </div>
      </div>

      <div className="hefno-terms-content">
        {sections.map((section, index) => (
          <div key={index}>
            <div className="hefno-terms-section">
              <h2 className="hefno-terms-section-title">{section.title}</h2>
              <p>{section.content}</p>
              {section.items && (
                <ul className="hefno-terms-list">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
            {index < sections.length - 1 && <div className="hefno-terms-divider"></div>}
          </div>
        ))}
      </div>

      <div className="hefno-terms-note">
        <p>"الشفافية والوضوح هما أساس الثقة — نضع شروطنا بين يديك"</p>
      </div>
    </div>
  );
};

export default TermsPage;
