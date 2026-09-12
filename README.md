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

The immersive scene is a procedural GPU particle renderer. Runtime graphics do not load the design-reference images or baked point-cloud files.

- `src/scripts/scene/core/procedural.ts` creates deterministic flower, terrain, galaxy, and star geometry.
- `src/scripts/scene/core/particleMaterial.ts` owns the shared particle shader and cursor field interaction.
- `src/scripts/scene/core/timeline.ts` centralizes cross-system scene timing.
- `src/scripts/scene/systems/` contains independent scene systems with update, resize, and disposal lifecycles.
- `src/scripts/scene/systems/index.ts` is the registry for composing visual systems.
- `src/scripts/scene/index.ts` owns camera travel, scroll state, post-processing, and renderer lifecycle.

New visual systems should implement the `SceneSystem` contract in `core/types.ts` and be added to the system registry.
