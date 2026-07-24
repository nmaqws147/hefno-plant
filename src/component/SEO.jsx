import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Hefno-Plant';
const SITE_URL = 'https://hefnoplant.site';
const DEFAULT_DESC = 'منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي، دليل المبيدات، التقويم الزراعي، وأكثر.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS = 'Hefno-Plant, تشخيص أمراض النبات, ذكاء اصطناعي زراعي, دليل المبيدات, آفات النبات, الزراعة الرقمية';

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  jsonLd,
  noindex = false,
  keywords,
  breadcrumbs,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | خبيرك الزراعي الذكي`;
  const desc = description || DEFAULT_DESC;
  const ogImage = image || DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  const combinedLd = [];
  if (breadcrumbs) combinedLd.push(breadcrumbs);
  if (jsonLd) {
    if (Array.isArray(jsonLd)) combinedLd.push(...jsonLd);
    else combinedLd.push(jsonLd);
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="hreflang" content="ar" />
      <link rel="alternate" hrefLang="ar" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_AR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@HefnoPlant" />
      <meta name="twitter:creator" content="@HefnoPlant" />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {combinedLd.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(combinedLd.length === 1 ? combinedLd[0] : { '@context': 'https://schema.org', '@graph': combinedLd })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
