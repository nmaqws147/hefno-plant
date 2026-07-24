const SITE_URL = 'https://hefnoplant.site';

const LABEL_MAP = {
  'knowledge-base': 'قاعدة المعرفة',
  'diagnose': 'تشخيص الأمراض',
  'weather': 'الطقس الزراعي',
  'program-planner': 'مخطط البرامج الزراعية',
  'calendar': 'التقويم الزراعي',
  'plant-elements': 'العناصر الغذائية',
  'fertilizer': 'الأسمدة',
  'soil-irri': 'التربة والري',
  'weeds': 'الحشائش',
  'plants-crops': 'النباتات والمحاصيل',
  'academic': 'المصطلحات الأكاديمية',
  'food-safety': 'سلامة الغذاء',
  'honey-bees': 'نحل العسل',
  'diseases': 'الأمراض',
  'bacteria': 'الأمراض البكتيرية',
  'viruses': 'الأمراض الفيروسية',
  'nematodes': 'النيماتودا',
  'parasitic_plants': 'النباتات المتطفلة',
  'physiological_disorders': 'الاضطرابات الفسيولوجية',
  'fungi': 'الفطريات',
  'oomy': 'فطريات البياض الزغبي',
  'zygo': 'الفطريات الاقترانية',
  'asco': 'الفطريات الزقية',
  'basi': 'الفطريات الدعامية',
  'insects': 'الحشرات',
  'public-health-pests': 'آفات الصحة العامة',
  'nematoda': 'النيماتودا',
  'pesticides': 'المبيدات',
  'resources': 'الموارد',
  'blog': 'المدونة',
  'about': 'حول المنصة',
  'privacy': 'سياسة الخصوصية',
  'terms': 'الشروط والأحكام',
};

function segmentLabel(seg) {
  return LABEL_MAP[seg] || seg.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toLocaleUpperCase('ar'));
}

export function makeBreadcrumbs(path) {
  if (!path || path === '/') return null;
  const segments = path.split('/').filter(Boolean);
  const items = [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
  ];
  let accumulated = '';
  segments.forEach((seg, i) => {
    accumulated += '/' + seg;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: segmentLabel(seg),
      item: `${SITE_URL}${accumulated}`,
    });
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function makeWebApp(name, url, desc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `${SITE_URL}${url}`,
    description: desc,
    applicationCategory: 'Multimedia',
    operatingSystem: 'All',
    inLanguage: 'ar',
  };
}

export function makeFAQ(questions) {
  if (!questions || questions.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  };
}

export function makeCollection(name, url, desc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: `${SITE_URL}${url}`,
    description: desc,
    inLanguage: 'ar',
  };
}
