import type { ParticleInteractionUniforms } from '../core/particleMaterial';
import { getSceneConfig } from '../core/config';
import type { SceneSystem } from '../core/types';
import { createFlowerSystem } from './flower';
import { createTerrainSystem } from './terrain';
import { createGalaxySystem } from './galaxy';
import { createStarSystem } from './stars';
import { createOrbitSystem } from './orbits';
import { createPersonSystem } from './person';

type SceneConfig = ReturnType<typeof getSceneConfig>;

export const createSceneSystems = (
  config: SceneConfig,
  pixelRatio: number,
  interaction: ParticleInteractionUniforms,
): SceneSystem[] => [
  createStarSystem(config.starCount, pixelRatio, config.worldGap, interaction),
  createTerrainSystem(config.terrainCount, pixelRatio, interaction),
  createPersonSystem(),
  createFlowerSystem(config.flowerCount, pixelRatio, interaction),
  createGalaxySystem(config.galaxyCount, pixelRatio, config.worldGap, interaction),
  createOrbitSystem(config.worldGap),
];
