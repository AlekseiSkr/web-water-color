# watercolor-timelapse

A stroke-based watercolor and oil-painting timelapse renderer for image inputs. It analyzes the source into thousands of ordered brush paths, then reconstructs it on a blank surface. The source bitmap is never displayed by the renderer.

**[Try the interactive demo](https://alekseiskr.github.io/web-water-color/)** — choose any local image, switch between oil and watercolor, scrub or scroll through the painting, and tune the brush model. Images are processed locally in the browser and are never uploaded by the demo.

Oil mode renders spline-smoothed paths as layered impasto with asymmetric pressure and loaded, palette-knife, broken dry-brush, or tap characters. Five to nine independent bristle lanes sample an unlit wet-pigment field beneath the brush, carry different mixtures through intersections, and combine reflectance with a Kubelka–Munk approximation instead of averaging screen RGB. The visible pass adds local ridge-and-groove relief, matte pits, directional gloss, and occasional paint trails without feeding those artificial highlights back into later color mixtures.

The painting develops through broad washes, medium color masses, form strokes, fine color brushes, and contour details. An automatic semantic attention map spends the final detail budget on perceptually important portrait features such as eyes and mouth while leaving hair interiors and background broadly painted. Watercolor marks have bristle tracks, wet boundaries, pooled edges, mottled pigment density, paper-fiber pinholes, paper-height deflection, delayed expansion, and granulating particles. A seed changes both path planning and pigment behavior.

## Install

```bash
npm install watercolor-timelapse gsap
```

## React

```tsx
import { useRef } from 'react';
import { Watercolor } from 'watercolor-timelapse/react';
import type { WatercolorControls } from 'watercolor-timelapse';

export function Portrait({ src }: { src: string }) {
  const painting = useRef<WatercolorControls>(null);
  return <Watercolor ref={painting} src={src} duration={12} washes={3} bloom={0.75} />;
}
```

## Vue

```vue
<script setup lang="ts">
import { Watercolor } from 'watercolor-timelapse/vue';
</script>
<template>
  <Watercolor :src="photo" :options="{ duration: 12, washes: 3, bloom: .75 }" />
</template>
```

## Vanilla / headless framework use

```ts
import { WatercolorRenderer } from 'watercolor-timelapse';
const painting = new WatercolorRenderer(canvas, { duration: 10 });
await painting.setImage('/portrait.jpg');
painting.play();

// A fresh seed changes brush fronts, water flow, blooms, and granulation.
painting.restart();
// A fixed seed is reproducible.
painting.restart(1842);

// Long, opaque, wet-on-wet impasto strokes.
painting.setOptions({ mode: 'oil' });

// Fast is the lightweight default. Balanced and high restore progressively more
// microscopic bristles, blur, pigment samples, gloss, and output resolution.
painting.setOptions({ renderQuality: 'fast', pixelRatio: 1 });

// Render a separate lossless PNG at export resolution without resizing the visible canvas.
const fullQualityPng = await painting.captureHighQuality(2048);

// Keep the built-in portrait-aware attention, restore uniform detail, or inject
// a custom model/mask with one 0–1 weight per analysis pixel.
painting.setOptions({ detailFocus: 'auto' });
painting.setOptions({
  detailMap: async ({ data, width, height }) => yourModel(data, width, height),
});

// Every dial used by the tuning demo is also a framework-neutral API option.
painting.setOptions({
  strokeEconomy: .8,
  shapeSimplification: .65,
  strokeLength: .7,
  strokeWidth: .55,
  strokeDuration: .16,
  strokeEase: [.22, 1, .36, 1],
  boundaryFidelity: .85,
  strokeCurvature: .3,
  detailBudget: .35,
  detailMultiplier: 10,
  sourceAccuracy: 1,
  detailPrecision: .9,
  detailDelay: .85,
  paintLoad: .7,
  dryBrush: .2,
  bristleStrength: .6,
  gloss: .45,
});
```

The canvas must have a real CSS width and height. Remote images require CORS permission if `capture()` is used. Respect `prefers-reduced-motion` in the host app by setting the result directly with `seek(1)`.

Paper texture photograph by Olga Thelavart (Unsplash), supplied for this project.

## Why this architecture

The engine has two deliberately separate stages:

1. `StrokePlanner` downsamples the source and begins by finding connected color masses. It computes each mass's principal axis and blocks that silhouette with ordered parallel drag strokes. Only afterward does a Sobel structure field add form corrections and contour-following detail at finer scales. A semantic attention map combines portrait-feature estimates with general visual saliency to decide where those scarce finishing strokes belong.
2. `WatercolorRenderer` paints those paths onto a persistent transparent pigment surface over generated paper. Watercolor brushes flow down the paper-height gradient, leave individual hairs and pooled rims, expand while wet, and deposit heavy particles in procedural valleys. Oil keeps a second flat pigment surface for wet pickup, while a separate lit surface represents thickness; this prevents relief lighting from polluting physical color mixing.

GSAP controls playback and seeking. Timeline positions are derived from cumulative source-space brush travel plus brush-lift overhead, rather than fixed guesses for each layer, so playback, scrubbing, and page-scroll drawing share the same reversible measure of real planned work. Each current brush path is progressively painted on a transient live-paint surface with an adjustable cubic Bézier ease, then committed to the persistent pigment surface when the gesture finishes. That separation keeps scrolling and reverse seeking deterministic without making completed paint flicker or rebuilding the full image every frame. React and Vue wrappers only manage lifecycle; the painter itself is framework-neutral. This is a physically inspired renderer rather than a Navier–Stokes fluid solver, keeping it interactive while ensuring the image is genuinely reconstructed from marks rather than revealed through a filter.
