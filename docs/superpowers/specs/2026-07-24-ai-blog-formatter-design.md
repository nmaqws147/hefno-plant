# AI-Powered Automatic Blog Formatting System

## Overview
Replace the manual Markdown blog editor with an AI-powered plain-text-to-HTML formatting pipeline. Author writes plain text, clicks "Format with AI", reviews formatted preview, and publishes.

## Architecture

```
Plain text → POST /api/blog/format → Groq API (Llama 3.3 70B) → semantic HTML
    → Preview page (sanitized with DOMPurify)
    → User approves → saves to Turso DB body field
    → BlogPostPage renders HTML via dangerouslySetInnerHTML + DOMPurify
```

## API Endpoint

**`POST /api/blog/format`**
- Input: `{ text: string, category?: "disease"|"pesticide"|"fertilizer"|"crop"|"pest"|"general" }`
- Calls Groq API with structured system prompt that:
  - Parses plain text into semantic structure (H1, H2, H3, paragraphs, lists, tables, info boxes)
  - Applies typography (bold for disease/pesticide names, italic for scientific names)
  - Organizes agricultural content into consistent templates based on category
  - Outputs clean semantic HTML with reusable CSS classes
- Response: `{ html: string, title: string, excerpt: string }`

## Frontend Changes

### BlogEditor.jsx (rewritten)
- Plain textarea (no formatting toolbar)
- Category selector dropdown
- "Format with AI" button → calls `/api/blog/format` → shows preview
- Preview panel renders HTML with base styles
- "Approve & Save" / "Edit Raw Text" buttons

### AdminBlogPage.jsx (modified)
- Updated to pass category to BlogEditor
- Handle new save flow with HTML body

### BlogPostPage.jsx (modified)
- Replace `ReactMarkdown` with `dangerouslySetInnerHTML` + DOMPurify
- Keep all existing CSS classes and Tailwind prose styling
- Add HTML sanitization

## Dependencies
- `dompurify` (frontend) — sanitize AI-generated HTML before rendering

## Files Changed
- **New**: `api/blog-format.js` — AI formatting endpoint
- **Modified**: `src/component/blog/BlogEditor.jsx` — plain-text + AI format flow
- **Modified**: `src/pages/blog/AdminBlogPage.jsx` — support new editor flow
- **Modified**: `src/pages/blog/BlogPostPage.jsx` — HTML rendering + DOMPurify
- **Modified**: `src/pages/blog/BlogPage.jsx` — if needed
- **Modified**: `package.json` — add dompurify

## Error Handling
- If Groq API fails: return error to client with message, user can retry
- Frontend shows inline error message, raw text preserved
- HTML sanitization prevents XSS from AI output

## Performance
- Formatting call is async with loading state
- Typical Groq inference time: 2-5 seconds for a full article
- No caching needed (formatting is on-demand before save)
