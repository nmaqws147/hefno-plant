import { useEffect } from 'react';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import './privacy.css';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: 'المقدمة',
      content: 'نحن في HEFNOPLANT نلتزم بحماية خصوصية زوارنا ومستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصتنا الزراعية المتكاملة.',
    },
    {
      title: 'المعلومات التي نجمعها',
      content: 'قد نقوم بجمع الأنواع التالية من المعلومات عند استخدامك لخدماتنا:',
      items: [
        'معلومات أساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف عند ملء نموذج التواصل',
        'بيانات الاستخدام مثل الصفحات التي تزورها والميزات التي تستخدمها',
        'معلومات الموقع الجغرافي التقريبي لتوفير بيانات الطقس الدقيقة',
        'صور النباتات التي ترفعها لأغراض التشخيص (لا يتم تخزينها بعد اكتمال التحليل)',
      ],
    },
    {
      title: 'كيف نستخدم معلوماتك',
      content: 'نستخدم المعلومات التي نجمعها للأغراض التالية:',
      items: [
        'تقديم وتحسين خدمات تشخيص الأمراض النباتية',
        'تخصيص المحتوى والتوصيات الزراعية بناءً على اهتماماتك',
        'إرسال النشرات البريدية والتحديثات المهمة (بعد الحصول على موافقتك)',
        'تحسين أداء المنصة وتجربة المستخدم',
        'الرد على استفساراتك وطلبات الدعم الفني',
      ],
    },
    {
      title: 'حماية البيانات',
      content: 'نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. تشمل هذه الإجراءات التشفير وجدران الحماية وبروتوكولات الأمان المتقدمة.',
    },
    {
      title: 'مشاركة المعلومات مع الغير',
      content: 'نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. قد نشارك المعلومات مع مزودي الخدمة الموثوقين الذين يساعدوننا في تشغيل منصتنا، مع التزامهم الصارم بمعايير الخصوصية والأمان.',
    },
    {
      title: 'ملفات تعريف الارتباط (Cookies)',
      content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل استخدام المنصة. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك في أي وقت.',
    },
    {
      title: 'حقوقك',
      content: 'لديك الحق في:',
      items: [
        'الوصول إلى بياناتك الشخصية التي نحتفظ بها',
        'طلب تصحيح أو تحديث بياناتك',
        'طلب حذف بياناتك الشخصية',
        'الاعتراض على معالجة بياناتك',
        'سحب الموافقة في أي وقت (حيثما ينطبق)',
      ],
    },
    {
      title: 'التحديثات على سياسة الخصوصية',
      content: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة المحدثة على هذه الصفحة مع تحديث تاريخ آخر مراجعة.',
    },
    {
      title: 'اتصل بنا',
      content: 'إذا كان لديك أي استفسار حول سياسة الخصوصية هذه أو ممارسات الخصوصية لدينا، فلا تتردد في التواصل معنا عبر البريد الإلكتروني: elhfnaweedowidar21@gmail.com أو من خلال نموذج التواصل في المنصة.',
    },
  ];

  return (
    <div className="hefno-privacy">
      <SEO title="سياسة الخصوصية" description="سياسة الخصوصية لمنصة Hefno-Plant — كيف نحمي بياناتك وكيف نستخدم المعلومات التي نجمعها." url="/privacy" keywords="سياسة الخصوصية, Hefno-Plant, حماية البيانات" breadcrumbs={makeBreadcrumbs('/privacy')} />
      <div className="hefno-privacy-hero">
        <div className="hefno-privacy-hero-inner">
          <div className="hefno-privacy-hero-label">سياسة الخصوصية</div>
          <h1 className="hefno-privacy-hero-title">
            خصوصيتك
            <span className="hefno-privacy-hero-title-accent">في أمان</span>
          </h1>
          <p className="hefno-privacy-hero-sub">
            نلتزم بحماية بياناتك وبناء الثقة من خلال الشفافية التامة وأعلى معايير الأمان وحماية المعلومات
          </p>
          <div className="hefno-privacy-hero-meta">
            آخر تحديث: يوليو 2026
          </div>
        </div>
      </div>

      <div className="hefno-privacy-content">
        {sections.map((section, index) => (
          <div key={index}>
            <div className="hefno-privacy-section">
              <h2 className="hefno-privacy-section-title">{section.title}</h2>
              <p>{section.content}</p>
              {section.items && (
                <ul className="hefno-privacy-list">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
            {index < sections.length - 1 && <div className="hefno-privacy-divider"></div>}
          </div>
        ))}
      </div>

      <div className="hefno-privacy-note">
        <p>"نؤمن بأن الثقة تُبنى من خلال الشفافية — خصوصيتك هي أساس علاقتنا"</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
