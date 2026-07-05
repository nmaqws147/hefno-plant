# Blog Redesign — Premium/Luxury

## Goal

Redesign the blog listing page (`BlogPage`), blog post page (`BlogPostPage`), and blog card component (`BlogCard`) to look premium and luxurious. Warm editorial feel — think *Monocle* meets refined botanical brand.

## Design Direction

- **Accent:** Emerald (#059669) stays, paired with warm charcoal, cream/off-white, and subtle gold/amber (#d97706) as a secondary accent
- **Background:** Warm off-white (`#f8f7f4`) for light mode, warm dark (`#1a1a1a`) for dark mode (not pure black, not blue-gray)
- **Typography:** Refined weight pairings, generous letter-spacing on meta text, larger body text with better leading
- **Shadows:** Deeper, more refined shadows on hover; subtle inner shadows on images

## Components

### BlogPage

- **Featured hero:** Full-width image with dark gradient overlay ("latest" badge, title, excerpt, meta overlaid on image). Image takes full width with max-height capped. Content positioned at bottom of image.
- **Decorative divider** between featured section and grid: a thin rule with a small diamond/leaf ornament
- **Section heading** "All Articles" in refined small-caps style with extra letter-spacing
- **Grid:** 1/2/3 column responsive, larger gap (`gap-8 sm:gap-10`)
- **Empty state / loading / error:** Keep existing structure, update to warm color scheme

### BlogCard

- **Top accent line:** Thin 2px line at the top of each card in gold/amber (`#d97706`), visible in both modes
- **Image container:** 16:9 with a subtle dark gradient overlay at the bottom edge, slight rounded corners on the image itself
- **Content area:** Generous padding (`p-6`), white background with warm off-white border
- **Typography:** Title in semibold with tighter tracking, excerpt in lighter weight, meta in uppercase with large letter-spacing
- **Hover:** Card lifts (`hover:-translate-y-1`), shadow deepens, gold accent line brightens, arrow slides right
- **Read article link:** Refined arrow animation on hover

### BlogPostPage

- **Back link:** Refined with arrow, positioned with more breathing room
- **Cover image:** Full-width with subtle vignette overlay, rounded-xl with a thin border, subtle shadow
- **Article header:** Title larger (`text-4xl sm:text-5xl`), date in uppercase with letter-spacing, thin divider below
- **Body card:** Warm white background (`#fefcfb`), larger padding (`p-8 sm:p-10`), refined prose styling, first-letter drop cap via Tailwind's `first-letter:` utility

### Color Tokens (Light Mode)

- Page bg: `#f8f7f4` (warm off-white)
- Card bg: `#ffffff`
- Card border: `#e8e6e1`
- Gold accent: `#d97706`
- Text primary: `#1c1917` (warm black)
- Text secondary: `#78716c` (warm gray)

### Color Tokens (Dark Mode)

- Page bg: `#1a1a1a` (warm dark)
- Card bg: `#242424`
- Card border: `#333333`
- Gold accent: `#f59e0b` (brighter gold)
- Text primary: `#f5f5f4`
- Text secondary: `#a8a29e`

## Scope

Three files:
- `src/component/blog/BlogCard.jsx` — redesign card
- `src/pages/blog/BlogPage.jsx` — redesign page layout
- `src/pages/blog/BlogPostPage.jsx` — redesign post layout

No new dependencies. No changes to admin or API. No changes to routing or data fetching.
