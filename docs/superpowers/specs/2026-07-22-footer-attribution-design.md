# Footer Owner Attribution

## Objective
Add a professional attribution line crediting the website owner in the footer of the Home Page.

## Placement
Between the star ornament row and the footer grid container in `Footer.jsx`.

## Structure
```
[ ★ ★ ★ ★ ★  star ornament ]

━━━ صمم وطور بواسطة ━━━
      المهندس الحفناوي محمد دويدار
      Engineer Hefnawy Mohamed Dwedar

[ 4-column footer grid ]
[ divider ]
[ copyright bar ]
```

## Visual Specs

| Element | Style |
|---------|-------|
| Horizontal lines | 1px, `linear-gradient(90deg, transparent, rgba(45,106,79,0.15), transparent)` |
| Label | `صمم وطور بواسطة` — 10px, uppercase, letter-spacing, `rgba(255,255,255,0.2)` |
| Arabic name | 15px, `#b8955a` (gold), medium weight |
| English name | 11px, `rgba(255,255,255,0.25)` |
| Spacing | ~24px padding top, ~8px padding bottom |
| Background | Inherits footer `#0c0c0a` — no box, no card |

## Responsive
- Centered alignment on all viewports
- Text scales down on mobile (responsive font sizes)
- Lines shorten on narrow screens

## Implementation
- 1 CSS block in `footer.css` (~25 lines)
- JSX in `footer.jsx` between ornament and container
- No new dependencies
