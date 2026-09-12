import * as THREE from 'three';
import { createTerrainGeometry } from '../core/procedural';
import { SCENE_TIMELINE } from '../core/timeline';
import type { ParticleInteractionUniforms } from '../core/particleMaterial';
import { createPointSystem } from './pointSystem';

export const createTerrainSystem = (
  count: number,
  pixelRatio: number,
  interaction: ParticleInteractionUniforms,
) => createPointSystem({
  geometry: createTerrainGeometry(count),
  interaction,
  pixelRatio,
  opacity: 0.95,
  drift: 0.0035,
  maxPointSize: 7,
  opacityAt: ({ progress }) => 0.95 * (1 - THREE.MathUtils.smoothstep(
    progress,
    SCENE_TIMELINE.landscapeExit.start,
    SCENE_TIMELINE.landscapeExit.end,
  )),
});
