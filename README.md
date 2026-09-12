# Bontr Website

A static, immersive landing page for Bontr built with Astro, Three.js, and GSAP.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The site is intentionally static so the same codebase can deploy to both Vercel and GitHub Pages.

## Scene architecture

The immersive scene is rendered as real GPU point geometry in Three.js. The approved artwork is used offline to derive reference point-cloud data; the browser never displays those reference images as scene layers.

- `public/data/home-morph.f32` stores the sampled 3D flower and galaxy particle targets.
- `public/data/home-terrain.f32` stores the sampled 3D landscape particles.
- `src/scripts/scene/generators.ts` turns reference data into `BufferGeometry` and creates ambient procedural geometry.
- `src/scripts/scene/materials.ts` owns particle shaders, glow materials, shadows, and cursor displacement.
- `src/scripts/scene/index.ts` composes the scene, camera travel, post-processing, scroll timing, and lifecycle.

The reference data preserves the approved composition while the runtime still owns every particle position, color, size, depth, and interaction state. Geometry generation and GPU materials are kept separate from scene orchestration so additional visual modules can be introduced without changing the reference clouds.
