# watercolor-timelapse

A stroke-based watercolor and oil-painting timelapse renderer for image inputs. It analyzes the source into thousands of ordered brush paths, then reconstructs it on a blank surface. The source bitmap is never displayed by the renderer.

**[Try the interactive demo](https://alekseiskr.github.io/web-water-color/)** — choose any local image, switch between oil and watercolor, scrub or scroll through the painting, and tune the brush model. Images are processed locally in the browser and are never uploaded by the demo.

Oil mode renders spline-smoothed paths as layered impasto with changing pressure and loaded, dry, or tap stroke characters. Each new stroke samples wet paint at five positions below it, mixes pigments subtractively along its length, casts a shallow thickness shadow, carries raised matte bristle texture and directional gloss, and occasionally drags paint beyond a loaded edge.

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
  detailPrecision: .9,
  detailDelay: .85,
  paintLoad: .7,
  dryBrush: .2,
  bristleStrength: .6,
  gloss: .45,
});
```

The canvas must have a real CSS width and height. Remote images require CORS permission if `capture()` is used. Respect `prefers-reduced-motion` in the host app by setting the result directly with `seek(1)`.

## Why this architecture

The engine has two deliberately separate stages:

1. `StrokePlanner` downsamples the source and begins by finding connected color masses. It computes each mass's principal axis and blocks that silhouette with ordered parallel drag strokes. Only afterward does a Sobel structure field add form corrections and contour-following detail at finer scales. A semantic attention map combines portrait-feature estimates with general visual saliency to decide where those scarce finishing strokes belong.
2. `WatercolorRenderer` paints those paths onto a persistent transparent pigment surface over generated paper. Brushes flow down the paper-height gradient, leave individual hairs and pooled rims, expand while wet, and deposit heavy particles in procedural valleys.

GSAP controls playback and seeking. Each current brush path is progressively painted on a transient live-paint surface with an adjustable cubic Bézier ease, then committed to the persistent pigment surface when the gesture finishes. That separation keeps scrolling and reverse seeking deterministic without making completed paint flicker or rebuilding the full image every frame. React and Vue wrappers only manage lifecycle; the painter itself is framework-neutral. This is a physically inspired renderer rather than a Navier–Stokes fluid solver, keeping it interactive while ensuring the image is genuinely reconstructed from marks rather than revealed through a filter.
