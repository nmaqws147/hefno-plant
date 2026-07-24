# KB Remaining Gaps

## 1. irac.json Mixed Schema
- 10 items (index 62-71) have no `id` field — they're IRAC group summaries, not individual AIs
- They contain `active_ingredients`, `irac_code`, `mode_of_action_ar` but lack `applications`, `resistance_risk`, `toxicity`, etc.
- Fix: Either restructure to match standard items or keep as-is (they serve a different purpose)

## 2. Trade Names (user-supplied data)
- `frac.json`: 2/67 have trade names (Captan, Metalaxyl-M)
- `irac.json`: 3/62 have trade names (Imidacloprid, Thiamethoxam, Abamectin)
- `hrac.json`, `nema.json`, `bact.json`: 0/116 have trade names
- **Total: 5/255 with trade names (2%)**
- User needs to supply `trade_names_ar` array per AI

## 3. pysh.json (Physiological Disorders)
- `active_ingredients`: 1/25 (these are disorders, not diseases — most recommend cultural correction, not pesticides)
- `infectionCycle`: 0/25 (physiological disorders don't have an infection cycle by nature)
- These are expected gaps, not bugs

## 4. fungi.json infectionCycle
- 14/82 entries missing infectionCycle (the `*Pro` prevention sections)
- Unfilled because `*Pro` entries are treatment/prevention patterns, not individual diseases

## 5. Unmatched `active_ingredients` (expected)
- 6 viruses: no effective chemical control → empty `active_ingredients` is correct
- 6 parasitic plants: use herbicides not in current HRAC list
- 1 fungi (Potato Wart): no effective treatment → empty is correct
- 0 bacteria unmatched (100% coverage)
- 1 pysh matched (some chemical corrections exist)

## 6. means/data.json vs academic/data.json
- 7 shared keys with different content — not duplicates
- Low priority, no action needed

## Summary
| File | Total | Full Coverage | % |
|------|-------|---------------|---|
| bacteria.json | 28 | 28 | 100% |
| viruses.json | 28 | 22 | 79% |
| para.json | 10 | 4 | 40% |
| fungi.json | 82 | 81 | 99% |
| pysh.json | 25 | 1 | 4% |
