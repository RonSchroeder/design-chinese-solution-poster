# Poster QA checklist

## P0 — must pass

- [ ] All required Chinese wording is present and accurate.
- [ ] No visible English expression, translation, kicker, or decorative acronym appears.
- [ ] Every retained Latin term is explicitly required by the source or user and its nearest element has `data-allow-latin`.
- [ ] No unsupported metrics, claims, certifications, or outcomes were introduced.
- [ ] Every local image resolves and has non-zero natural dimensions.
- [ ] No element escapes the poster bounds beyond rounding tolerance.
- [ ] The rendered PNG contains the complete poster at the intended width.
- [ ] No generated illustration contains pseudo-text, watermark, or unintended adjacent scenes.
- [ ] Transparent icons have real transparency and no obvious green background.
- [ ] Physical-print requests use the requested size and resolution rather than the 1200 px screen default.

## P1 — should pass

- [ ] The composition visibly follows this material's narrative type and dominant relationship.
- [ ] The dominant module corresponds to the most important or distinctive content.
- [ ] The chosen template or custom composition accommodates the material without distorting hierarchy or meaning.
- [ ] Reused module order, card counts, geometry, and scene positions remain clear and visually effective for the current content.
- [ ] Large scenes, icons, and quiet regions form distinct visual levels.
- [ ] Every visual explains or anchors meaning; decorative excess is removed.
- [ ] Repeated capabilities reuse the same icon and icons remain readable at final size.
- [ ] Illustrations match actual slots without stretching or destructive crop.
- [ ] Body text remains at least 12 px on a 1200 px screen export.

## P2 — polish

- [ ] Dense and quiet regions form intentional rhythm.
- [ ] Color semantics remain consistent.
- [ ] Card heights, baselines, and neighboring columns align intentionally.
- [ ] The poster resembles the approved visual language more strongly than a generic artificial-intelligence template, while retaining its own composition.
- [ ] Intermediate green sources, debug crops, and unused assets are separated from final deliverables.

## Commands

```text
node <skill-root>/scripts/verify_poster.cjs path/to/poster.html
node <skill-root>/scripts/render_poster.cjs path/to/poster.html path/to/poster.png
```

Use `--allow-placeholders` only for an explicitly labeled low-fidelity draft. Use `data-allow-latin` only on the smallest element containing a source-required Latin term. Final verification must use the default strict behavior.

Open the full PNG and at least the hero, dominant module, and densest region. Code inspection alone is insufficient.
