---
name: design-chinese-solution-poster
description: Create, revise, render, and visually QA Chinese vertical enterprise solution posters as editable HTML and PNG. Use for dense Chinese business, banking, technology, digital-transformation, consulting, or internal-promotion content; material-shaped poster composition; reference-image-driven visual language; slot-matched ImageGen illustrations; consistent small-icon systems; or iterative correction of an existing long poster from screenshots and user feedback.
---

# Design Chinese Solution Posters

Produce a fit-for-purpose poster by adapting a suitable proven template or creating a custom composition. Deliver editable HTML, a rendered PNG, and the local image assets used by the HTML.

## Preserve the production contract

- Keep titles, labels, body copy, numbers, and regulated wording in deterministic HTML. Use generated images only for illustration, visual metaphor, and iconography.
- Keep all visible poster copy in Chinese by default. Do not add English eyebrows, kickers, subtitles, section translations, process labels, decorative acronyms, or English image-slot text.
- Preserve Latin letters only when the source or user explicitly requires a proper name, product name, standard, or unavoidable acronym. Mark that element with `data-allow-latin`.
- Keep source claims intact. Do not invent metrics, outcomes, certifications, customer facts, or implementation promises.
- Treat a user-approved reference as a valid source of visual language and, when suitable, page structure. Preserve or adapt its layout according to the current material and the user's preference.

## Route the task

1. **Revise an existing poster**: inspect the editable HTML, latest full render, and referenced screenshots. Classify feedback as copy, structure, hierarchy, asset fit, or style. Make the smallest coherent change and re-render.
2. **Create from an approved preset**: view `assets/presets/enterprise-blue-orange/` for palette, illustration language, spacing quality, tone, and potentially useful layout patterns. Reuse, adapt, or replace its module order, card counts, and geometry according to fit.
3. **Create without an approved direction**: derive direction from the user's references and content. Show two or three real thumbnail directions only when the visual direction is genuinely ambiguous.

## Read supporting references only when needed

- Read `references/content-model.md` when restructuring dense source material or auditing claims.
- Read `references/composition-strategy.md` before creating a new poster or materially restructuring one.
- Read `references/design-system.md` before style-sensitive work.
- Read `references/chinese-typesetting.md` before laying out or substantially editing visible copy.
- Read `references/imagegen-playbook.md` whenever generating or replacing illustrations or icons.
- Read `references/iteration-ledger.md` when diagnosing a complaint or deciding whether a local fix generalizes.
- Read `references/qa-checklist.md` before every final delivery.

## Execute the workflow

1. Establish audience, channel, size, source material, required wording, brand assets, reference priority, and deliverables. Default to a 1200 px screen poster only when no print specification exists.
2. Build a content matrix and material signature. Identify the dominant question, narrative type, strongest evidence, natural sequence, exceptional content shape, and what deserves the largest visual area.
3. Choose a narrative spine. Use an existing template when it expresses that spine well; otherwise adapt it or create a new composition. Let the material guide module order, count, width, rhythm, card density, and visual placement without treating structural similarity as a defect.
4. Start from `assets/starter/canvas.html` or another appropriate editable template, then adapt the semantic HTML structure as needed. Keep assets beside the HTML and use relative paths.
5. Finish low-fidelity HTML before generating images. Render it, measure actual image slots, and record their dimensions. Check whether the chosen structure communicates the material clearly; revise only where the fit is weak.
6. Generate every scene for its final slot. Regenerate when cropping would remove a person, decision path, diagram, or semantic object.
7. For a new icon family, generate two representative tests first. Remove the green background, inspect transparency, and test both at the actual 40–72 px display size before batching.
8. Run `scripts/verify_poster.cjs`, inspect P0 failures and warnings, and inspect the full PNG plus dense regions. Unexpected visible Latin text is P0.
9. After feedback, preserve approved layers. Do not regenerate all art for a local copy change or hide a systemic composition problem with arbitrary margins or stretching.

## Enforce visual hierarchy

- Use three levels: a few narrative scenes, reusable semantic icons or micro-diagrams, and quiet text regions.
- Give each visual a job. Remove visuals that do not improve recognition, explanation, rhythm, or trust.
- Let the material determine whether the main device is a journey, comparison, system map, diagnosis field, evidence stack, before/after contrast, or another structure.
- Reuse one icon for one capability across modules. Never stretch bitmaps.
- Preserve quiet around principles, governance notes, summaries, and calls to action.

## Use the deterministic helpers

```text
node <skill-root>/scripts/render_poster.cjs <poster.html> <poster.png>
node <skill-root>/scripts/verify_poster.cjs <poster.html>
python <skill-root>/scripts/chroma_key_icons.py <source-or-directory> <output-directory>
python <skill-root>/scripts/trim_transparent_icons.py <source-or-directory> <output-directory>
```

If Node cannot resolve Playwright, call `codex_app__load_workspace_dependencies` when available and set `NODE_PATH` to the returned Node modules directory. Otherwise discover the active workspace runtime through an environment dependency locator. Do not hard-code a user profile, browser executable, project directory, or output filename into reusable scripts.

## Deliver and report

- Deliver the final PNG, editable HTML, and asset directory.
- Report dimensions, unresolved assumptions, the chosen narrative spine, and the material-specific reason for the composition.
- Mention which visuals were generated or replaced and which reference controlled their style.
- Keep intermediate green-screen sources and QA crops out of the main deliverable unless requested.
