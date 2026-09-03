# ImageGen playbook

## Generate scene illustrations by final slot

Measure the slot before writing the prompt. Include:

- asset type and exact intended container size;
- whether the slot is square, portrait, extra-tall, or landscape;
- subject and visual job;
- approved style reference priority;
- safe margins and required objects;
- background treatment and palette;
- explicit exclusions: text, adjacent scenes, watermarks, robots, chips, neon, or unwanted brand colors.

Use this scaffold:

```text
Use case: productivity-visual
Asset type: standalone [shape] illustration for a [width]×[height] module in a Chinese enterprise solution poster
Primary request: create one scene for [semantic role]. Use the reference only for visual language, character styling, palette, line quality, and professional tone.
Subject: [people, board, flow, objects, and their relationships]
Style: restrained flat editorial corporate illustration, crisp navy outlines, muted blue fills, warm orange accents, slight hand-drawn character
Composition: match the final slot ratio; fill the height with useful information; keep critical objects inside [8–10]% safe margins
Text: none; no letters, numbers, labels, watermark, or pseudo-text
Avoid: adjacent scene fragments, cyberpunk, neon, robot protagonist, chips, AI brain, hologram, green-dominant colors
```

Regenerate instead of cropping when the crop would remove a person, decision path, diagram, or important object. Do not stretch an illustration to make two columns align.

## Build an icon system

1. Choose one abstract concept and one concrete or governance concept.
2. Generate the two tests against the approved scene and icon references.
3. Require one compact silhouette, low detail, roughly 68% subject coverage, generous padding, and readability at 40–72 px.
4. Use the same outline weight, rounded geometry, palette, and detail density across the family.
5. Test transparent results inside the actual poster component before generating the remainder.
6. Reuse the same icon for the same capability across modules.

Use this green-screen clause:

```text
Background: perfectly flat solid #00FF00 chroma-key background. Keep the background uniform with no gradient, shadow, texture, lighting variation, floor, halo, reflection, or vignette. Do not use green in the subject. Use no cast or contact shadow and no translucent elements.
```

Run `chroma_key_icons.py`, then `trim_transparent_icons.py`. Inspect pale blue and warm off-white fills for accidental transparency and inspect the edge for green spill.

## Preserve an approved style

- Supply the approved poster or scene as the dominant style reference.
- Supply the two approved icons as icon-system references for later icons.
- State that the reference controls visual language, not subject matter or text.
- Do not silently switch from flat editorial illustration to glossy 3D or generic vector iconography.

