import * as THREE from 'three';
import { createGalaxyGeometry } from '../core/procedural';
import type { ParticleInteractionUniforms } from '../core/particleMaterial';
import { createPointSystem } from './pointSystem';

export const createGalaxySystem = (
  count: number,
  pixelRatio: number,
  worldGap: number,
  interaction: ParticleInteractionUniforms,
) => createPointSystem({
  geometry: createGalaxyGeometry(count),
  interaction,
  pixelRatio,
  position: new THREE.Vector3(0, -worldGap, 0),
  opacity: 0.98,
  drift: 0.009,
  maxPointSize: 9.2,
  blending: THREE.AdditiveBlending,
});
