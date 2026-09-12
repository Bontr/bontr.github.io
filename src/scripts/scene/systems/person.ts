import * as THREE from 'three';
import type { SceneSystem } from '../core/types';
import { terrainHeight } from '../core/procedural';
import { SCENE_TIMELINE } from '../core/timeline';

export const createPersonSystem = (): SceneSystem => {
  const root = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x040404, transparent: true, opacity: 1 });
  const person = new THREE.Group();
  const x = -1.65;
  const z = 1.7;
  const ground = terrainHeight(x, z);
  person.position.set(x, ground + 0.14, z);
  person.scale.setScalar(0.58);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 12), material);
  head.position.y = 0.73;
  person.add(head);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 0.36, 10), material);
  torso.position.y = 0.48;
  person.add(torso);

  const addLimb = (px: number, py: number, rotation: number, length: number, radius: number) => {
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), material);
    limb.position.set(px, py, 0);
    limb.rotation.z = rotation;
    person.add(limb);
  };
  addLimb(-0.08, 0.2, 0.08, 0.42, 0.026);
  addLimb(0.08, 0.2, -0.08, 0.42, 0.026);
  addLimb(-0.1, 0.49, -0.18, 0.34, 0.022);
  addLimb(0.1, 0.49, 0.18, 0.34, 0.022);
  root.add(person);

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const shadowGeometry = new THREE.CircleGeometry(0.5, 40);
  shadowGeometry.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.set(x, ground + 0.022, z + 0.02);
  shadow.scale.set(1.15, 0.42, 1);
  root.add(shadow);

  return {
    root,
    update({ progress }) {
      const visible = 1 - THREE.MathUtils.smoothstep(
        progress,
        SCENE_TIMELINE.landscapeExit.start,
        SCENE_TIMELINE.landscapeExit.end,
      );
      material.opacity = visible;
      shadowMaterial.opacity = 0.42 * visible;
      root.visible = visible > 0.002;
    },
    resize() {},
    dispose() {
      person.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      material.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
    },
  };
};
