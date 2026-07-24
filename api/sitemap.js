const { createClient } = require('@libsql/client');

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SITE = 'https://hefnoplant.site';

const STATIC_PAGES = [
  { loc: '/', priority: 1.0, changefreq: 'weekly' },
  { loc: '/diagnose', priority: 0.9, changefreq: 'weekly' },
  { loc: '/weather', priority: 0.8, changefreq: 'daily' },
  { loc: '/ai-chat', priority: 0.8, changefreq: 'weekly' },
  { loc: '/program-planner', priority: 0.7, changefreq: 'weekly' },
  { loc: '/knowledge-base', priority: 0.9, changefreq: 'weekly' },
  { loc: '/knowledge-base/calendar', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/plant-elements', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/fertilizer', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/soil-irri', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/weeds', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/plants-crops', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/academic', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/food-safety', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/honey-bees', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases', priority: 0.8, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/bacteria', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/viruses', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/nematodes', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/parasitic_plants', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/physiological_disorders', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/fungi', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/fungi/oomy', priority: 0.5, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/fungi/zygo', priority: 0.5, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/fungi/asco', priority: 0.5, changefreq: 'monthly' },
  { loc: '/knowledge-base/diseases/fungi/basi', priority: 0.5, changefreq: 'monthly' },
  { loc: '/knowledge-base/insects', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/insects/public-health-pests', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/insects/nematoda', priority: 0.6, changefreq: 'monthly' },
  { loc: '/knowledge-base/pesticides', priority: 0.7, changefreq: 'monthly' },
  { loc: '/knowledge-base/resources', priority: 0.6, changefreq: 'monthly' },
  { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
  { loc: '/about', priority: 0.5, changefreq: 'yearly' },
  { loc: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
];

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

module.exports = async (req, res) => {
  try {
    let urls = '';
    for (const p of STATIC_PAGES) {
      urls += `  <url>\n    <loc>${SITE}${p.loc}</loc>\n    <priority>${p.priority}</priority>\n    <changefreq>${p.changefreq}</changefreq>\n  </url>\n`;
    }

    const result = await turso.execute(
      'SELECT slug, updated_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
    );

    for (const post of result.rows) {
      const lastmod = post.updated_at ? post.updated_at.substring(0, 10) : '';
      urls += `  <url>\n    <loc>${SITE}/blog/${escapeXml(post.slug)}</loc>\n`;
      if (lastmod) urls += `    <lastmod>${lastmod}</lastmod>\n`;
      urls += `    <priority>0.7</priority>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.writeHead(200);
    res.end(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.writeHead(500);
    res.end('Internal server error');
  }
};
