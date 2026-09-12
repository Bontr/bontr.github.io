import * as THREE from 'three';
import type { SceneFrame, SceneSystem } from '../core/types';
import {
  createParticleMaterial,
  type ParticleInteractionUniforms,
  type ParticleMaterialOptions,
} from '../core/particleMaterial';

type PointSystemOptions = ParticleMaterialOptions & {
  geometry: THREE.BufferGeometry;
  interaction: ParticleInteractionUniforms;
  pixelRatio: number;
  position?: THREE.Vector3;
  opacityAt?: (frame: SceneFrame) => number;
};

export const createPointSystem = (options: PointSystemOptions): SceneSystem => {
  const material = createParticleMaterial(options.pixelRatio, options.interaction, options);
  const points = new THREE.Points(options.geometry, material);
  points.frustumCulled = false;
  if (options.position) points.position.copy(options.position);

  return {
    root: points,
    update(frame) {
      const opacity = options.opacityAt ? options.opacityAt(frame) : (options.opacity ?? 1);
      material.uniforms.uTime.value = frame.time;
      material.uniforms.uOpacity.value = opacity;
      points.visible = opacity > 0.002;
    },
    resize(_width, _height, pixelRatio) {
      material.uniforms.uPixelRatio.value = pixelRatio;
    },
    dispose() {
      options.geometry.dispose();
      material.dispose();
    },
  };
};
