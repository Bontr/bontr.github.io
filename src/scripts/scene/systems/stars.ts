import { createStarGeometry } from '../core/procedural';
import type { ParticleInteractionUniforms } from '../core/particleMaterial';
import { createPointSystem } from './pointSystem';

export const createStarSystem = (
  count: number,
  pixelRatio: number,
  worldGap: number,
  interaction: ParticleInteractionUniforms,
) => createPointSystem({
  geometry: createStarGeometry(count, -worldGap * 0.5, worldGap * 0.58 + 13),
  interaction,
  pixelRatio,
  opacity: 0.46,
  drift: 0.006,
  maxPointSize: 6.5,
  opacityAt: ({ travelPulse }) => 0.42 + travelPulse * 0.18,
});
