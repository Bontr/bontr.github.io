import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import type { SceneSystem } from '../core/types';
import { FLOWER_CENTER, GALAXY_CENTER } from '../core/config';
import { SCENE_TIMELINE } from '../core/timeline';

const createOrbit = (
  center: THREE.Vector3,
  radiusX: number,
  radiusY: number,
  tiltDeg: number,
  spinDeg: number,
  opacity: number,
) => {
  const positions: number[] = [];
  const tilt = THREE.MathUtils.degToRad(tiltDeg);
  const spin = THREE.MathUtils.degToRad(spinDeg);
  for (let i = 0; i <= 240; i += 1) {
    const theta = (i / 240) * Math.PI * 2;
    const x = Math.cos(theta) * radiusX;
    const y = Math.sin(theta) * radiusY;
    const yt = y * Math.cos(tilt);
    const zt = y * Math.sin(tilt);
    const xs = x * Math.cos(spin) - yt * Math.sin(spin);
    const ys = x * Math.sin(spin) + yt * Math.cos(spin);
    positions.push(center.x + xs, center.y + ys, center.z + zt);
  }
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  const material = new LineMaterial({
    color: 0xf0a064,
    linewidth: 0.72,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const line = new Line2(geometry, material);
  line.computeLineDistances();
  return { line, material, geometry };
};

export const createOrbitSystem = (worldGap: number): SceneSystem => {
  const root = new THREE.Group();
  const galaxyCenter = GALAXY_CENTER.clone().add(new THREE.Vector3(0, -worldGap, 0));
  const flowerA = createOrbit(FLOWER_CENTER, 5.4, 1.3, 62, -6, 0.18);
  const flowerB = createOrbit(FLOWER_CENTER, 4.15, 1.0, -55, 22, 0.08);
  const galaxyA = createOrbit(galaxyCenter, 8.4, 2.5, 53, -7, 0.14);
  const galaxyB = createOrbit(galaxyCenter, 6.35, 1.9, -48, 10, 0.07);
  const all = [flowerA, flowerB, galaxyA, galaxyB];
  all.forEach(({ line }) => root.add(line));

  return {
    root,
    update({ progress }) {
      const flowerExit = 1 - THREE.MathUtils.smoothstep(
        progress,
        SCENE_TIMELINE.flowerExit.start,
        SCENE_TIMELINE.flowerExit.end,
      );
      flowerA.material.opacity = 0.18 * flowerExit;
      flowerB.material.opacity = 0.08 * flowerExit;
      flowerA.line.visible = flowerExit > 0.002;
      flowerB.line.visible = flowerExit > 0.002;
    },
    resize(width, height) {
      all.forEach(({ material }) => material.resolution.set(width, height));
    },
    dispose() {
      all.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
  };
};
