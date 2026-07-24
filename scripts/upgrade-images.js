const sharp = require('sharp');

const SITE = process.env.SITE_URL || 'https://hefnoplant.site';
const KEY = process.env.BLOG_ADMIN_KEY;
const IMG_RE = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
const DATAURL_RE = /^data:image\//;

if (!KEY) {
  console.error('❌ BLOG_ADMIN_KEY env var required');
  process.exit(1);
}

async function api(path, opts = {}) {
  const res = await fetch(`${SITE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-admin-key': KEY, ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function upgradeImage(url) {
  console.log(`  → downloading: ${url.slice(0, 80)}...`);
  const buf = await fetchImage(url);
  const img = sharp(buf);
  const meta = await img.metadata();

  const out = await img
    .resize({ width: Math.min(meta.width, 1920), withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const b64 = out.toString('base64');
  const ext = meta.format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${ext};base64,${b64}`;

  const { url: newUrl } = await api('/api/blog/image/upload', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });

  console.log(`  ✓ ${newUrl.split('/').pop()}`);
  return newUrl;
}

async function uploadDataUrl(dataUrl) {
  const { url: newUrl } = await api('/api/blog/image/upload', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
  console.log(`  ✓ cover uploaded → ${newUrl.split('/').pop()}`);
  return newUrl;
}

async function main() {
  console.log('📥 Fetching all posts...');
  const { posts } = await api('/api/blog?all=1');
  console.log(`   Found ${posts.length} posts\n`);

  let totalReplaced = 0;

  for (const post of posts) {
    const urls = [...post.body.matchAll(IMG_RE)].map(m => m[1]);
    if (urls.length === 0) continue;
    console.log(`📄 "${post.title}" (${urls.length} images)`);

    const replacements = {};
    for (const url of urls) {
      try {
        const newUrl = await upgradeImage(url);
        replacements[url] = newUrl;
      } catch (err) {
        console.error(`  ✗ ${err.message}`);
      }
    }

    if (Object.keys(replacements).length === 0) {
      console.log();
      continue;
    }

    let newBody = post.body;
    for (const [oldUrl, newUrl] of Object.entries(replacements)) {
      newBody = newBody.replaceAll(oldUrl, newUrl);
    }

    console.log(`  💾 saving...`);
    await api('/api/blog', {
      method: 'PUT',
      body: JSON.stringify({ id: post.id, body: newBody }),
    });

    totalReplaced += Object.keys(replacements).length;
    console.log(`  ✓ ${Object.keys(replacements).length} images upgraded\n`);
  }

  console.log(`\n✅ Body images done — ${totalReplaced} upgraded across ${posts.length} posts`);

  // ── Cover images ──────────────────────────────────────────────
  console.log('\n📸 Checking cover images...');
  let coverUpgraded = 0;

  for (const post of posts) {
    if (!post.cover_url || typeof post.cover_url !== 'string') continue;
    if (!DATAURL_RE.test(post.cover_url)) continue;

    console.log(`📄 "${post.title}" — cover is a dataUrl`);

    try {
      const newUrl = await uploadDataUrl(post.cover_url);
      await api('/api/blog', {
        method: 'PUT',
        body: JSON.stringify({ id: post.id, cover_url: newUrl }),
      });
      coverUpgraded++;
      console.log(`  ✓ cover migrated\n`);
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
    }
  }

  console.log(`\n✅ Done — ${totalReplaced} body images upgraded, ${coverUpgraded} cover images migrated`);
}

main().catch(err => {
  console.error('\n❌', err);
  process.exit(1);
});
