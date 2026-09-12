import * as THREE from 'three';
import { createFlowerGeometry } from '../core/procedural';
import { SCENE_TIMELINE } from '../core/timeline';
import type { ParticleInteractionUniforms } from '../core/particleMaterial';
import { createPointSystem } from './pointSystem';

export const createFlowerSystem = (
  count: number,
  pixelRatio: number,
  interaction: ParticleInteractionUniforms,
) => createPointSystem({
  geometry: createFlowerGeometry(count),
  interaction,
  pixelRatio,
  opacity: 0.98,
  drift: 0.014,
  maxPointSize: 8.8,
  blending: THREE.AdditiveBlending,
  opacityAt: ({ progress }) => 0.98 * (1 - THREE.MathUtils.smoothstep(
    progress,
    SCENE_TIMELINE.flowerExit.start,
    SCENE_TIMELINE.flowerExit.end,
  )),
});
