import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './about.css';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hefno-about">
      <Helmet>
        <title>من نحن | Hefno-Plant</title>
        <meta name="description" content="منصة Hefno-Plant — منصة زراعية متكاملة تجمع بين المعرفة العلمية والذكاء الاصطناعي لخدمة المزارعين." />
      </Helmet>
      <div className="hefno-about-hero">
        <div className="hefno-about-hero-inner">
          <div className="hefno-about-hero-label">من نحن</div>
          <h1 className="hefno-about-hero-title">عن المنصة</h1>
          <p className="hefno-about-hero-sub">
            منصة عربية متخصصة في نشر المعرفة الزراعية وتقديم محتوى علمي موثوق
          </p>
        </div>
      </div>

      <div className="hefno-about-content">
        <div className="hefno-about-article">
          <p>
            مرحبًا بكم في <strong>HefnoPlant</strong>، منصة عربية متخصصة في نشر المعرفة الزراعية وتقديم محتوى علمي موثوق يخدم المهندسين الزراعيين، والمزارعين، والطلاب، وكل المهتمين بالقطاع الزراعي.
          </p>

          <p>
            أسس هذه المنصة المهندس <strong>الحفناوي الدويدار</strong>، خريج كلية الزراعة، انطلاقًا من إيمانه بأهمية توفير محتوى زراعي عربي يجمع بين الدقة العلمية والتطبيق العملي، ويساعد العاملين في المجال الزراعي على تطوير معارفهم واتخاذ قرارات أفضل داخل الحقل.
          </p>

          <p>
            يقدم <strong>HefnoPlant</strong> مقالات وأدلة متخصصة تغطي مجالات وقاية النبات، والمبيدات الزراعية، وأمراض النبات، والحشرات الزراعية، والتسميد، وتغذية النبات، وإدارة المحاصيل، مع الحرص على تبسيط المعلومات العلمية وتقديمها بأسلوب واضح وسهل الفهم.
          </p>

          <p>
            نعتمد في إعداد المحتوى على المراجع العلمية الموثوقة، والنشرات الفنية، وأحدث المستجدات في القطاع الزراعي، مع الالتزام بالدقة والمراجعة المستمرة لضمان تقديم معلومات ذات قيمة حقيقية لزوار الموقع.
          </p>

          <section className="hefno-about-mission-vision">
            <div className="hefno-about-mv-block">
              <h3>رؤيتنا</h3>
              <p>أن يصبح HefnoPlant من أبرز المنصات الزراعية العربية التي يعتمد عليها المهندسون الزراعيون والمزارعون والطلاب للحصول على معلومات علمية موثوقة وحديثة.</p>
            </div>
            <div className="hefno-about-mv-block">
              <h3>رسالتنا</h3>
              <p>تقديم محتوى زراعي احترافي يساهم في نشر الوعي الزراعي، ورفع كفاءة العاملين بالقطاع، وربط الجانب الأكاديمي بالتطبيق العملي، بما يدعم التنمية الزراعية ويحقق أفضل النتائج في الإنتاج.</p>
            </div>
          </section>

          <p className="hefno-about-closing">
            نشكركم على زيارة <strong>HefnoPlant</strong>، ونسعد بثقتكم، ونتطلع إلى أن يكون موقعنا مصدرًا موثوقًا لكل من يسعى إلى التعلم والتطوير في المجال الزراعي.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
