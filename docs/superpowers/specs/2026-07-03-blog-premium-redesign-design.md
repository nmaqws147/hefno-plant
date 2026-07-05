# Blog Premium Redesign — Design Spec

## Direction
Nature-inspired premium aesthetic with a magazine-style editorial feel.

## Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Page background | Warm cream | `#faf7f0` |
| Card/surface | White | `#ffffff` |
| Card border | Warm stone | `#e8e3d8` |
| Headings / primary | Forest green | `#1e352f` |
| Accents / borders | Brushed gold | `#b8955a` |
| Body text | Warm charcoal | `#2d2a24` |
| Muted text | Warm gray | `#8a8580` |
| Featured badge bg | Gold | `#b8955a` |
| Gradient overlay | Forest → transparent | `linear-gradient(to top, #1e352f 0%, transparent 60%)` |

Dark mode variants invert backgrounds to deep charcoal (`#1a1a1a`) with gold accents preserved.

## Typography
- **Headings (h1–h3):** Playfair Display (serif) — elegant, editorial
- **Body / UI:** UbuntuCustom (existing) or system sans-serif
- **Article body:** ~17–18px, line-height 1.8
- **Drop caps:** Playfair Display, forest green

## Scope
**Affected files (public blog only — admin unchanged):**
- `src/pages/blog/BlogPage.jsx` — listing page
- `src/pages/blog/BlogPostPage.jsx` — article page
- `src/component/blog/BlogCard.jsx` — card component
- `src/index.css` — add Playfair Display font and any needed global classes
- `public/index.html` — add Google Fonts link for Playfair Display

**No changes to:**
- Admin panel (`AdminBlogPage.jsx`, `BlogEditor.jsx`)
- API or backend
- Image upload system

## Blog Listing Page (`BlogPage.jsx`)

### Featured Hero Post
- Full-width section with large cover image
- Gradient overlay: forest green `#1e352f` at bottom → transparent at top (60%)
- Overlaid content (bottom-aligned): gold "Featured" badge pill, title in Playfair Display white, excerpt in light cream, date/read-time in light cream small text
- Hover: subtle lift effect on the whole hero
- Decorative: thin gold line separating hero from grid below

### Masonry Grid
- 3-column on desktop, 2 on tablet, 1 on mobile
- Uses CSS columns for masonry (no JS library needed)
- Cards have variable heights depending on content/image
- Section heading above grid: "Latest Articles" in forest green Playfair Display, with a gold decorative line

### Empty / Loading / Error States
- Loading: refined skeleton pulse (matching new colors)
- Empty: botanical leaf icon in gold, "No articles yet" in forest green
- Error: subtle error state consistent with new palette

## Blog Card (`BlogCard.jsx`)

### Card Design
- Background: white, rounded corners, warm stone border `#e8e3d8`
- Top accent: 3px forest green bar (amber currently — change to forest green)
- Image: rounded top corners, 16:9 ratio, hover scale (1.03) with smooth transition
- Image fallback: forest → gold gradient
- Content padding: generous (p-6 or p-7)
- Category/tag: gold badge if present
- Title: Playfair Display, `#1e352f`, line-clamp-2
- Excerpt: warm charcoal, line-clamp-2
- Meta: date + reading time in uppercase, warm gray, small
- "Read article" link: forest green with arrow, hover shifts arrow right
- Card hover: `-translate-y-1`, shadow increase, gold border accent

## Blog Post Page (`BlogPostPage.jsx`)

### Layout
- Max-width: ~740px for article body (narrower than current for better readability)
- Outside the article container: full-width cover image area

### Cover Image Section
- Full-width image with max-height 500px
- Subtle gold border frame (2px) around the image container
- Image credit/caption below in small gold text (optional)

### Article Header
- "Back to blog" link in warm gray with arrow, hover turns gold
- Title: Playfair Display, ~2.5rem–3rem, forest green, generous letter-spacing
- Gold decorative line (2px, 60px wide) below title
- Byline area: date + reading time with a gold dot separator, warm gray

### Article Body
- Prose styling customized:
  - Larger base font (17–18px)
  - Line-height 1.8
  - Forest green links with gold hover
  - Gold blockquotes (left border)
  - Gold horizontal rules (thin)
  - Forest green headings in Playfair Display
- Drop cap on first paragraph: Playfair Display, forest green, ~4rem, float left

### Dark Mode
- Background: `#1a1a1a`
- Cards/surfaces: `#242424`
- Borders: `#333`
- Text: `#e5e1dc`
- Gold accents preserved (`#b8955a`)
- Forest green headings → lighter forest `#2d5a4a`

## Implementation Order
1. Add Playfair Display font (Google Fonts link in `public/index.html`)
2. Define color CSS variables or Tailwind extension in `tailwind.config.js`
3. Redesign `BlogCard.jsx`
4. Redesign `BlogPage.jsx` (hero + masonry grid)
5. Redesign `BlogPostPage.jsx` (magazine article layout)
