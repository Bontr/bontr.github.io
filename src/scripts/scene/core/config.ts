import * as THREE from 'three';

export const FLOWER_CENTER = new THREE.Vector3(4.9, 0.55, -6.2);
export const GALAXY_CENTER = new THREE.Vector3(5.35, -0.15, -9.75);

export const getSceneConfig = () => {
  const mobile = window.innerWidth < 720;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const constrained = mobile || cores <= 4 || memory <= 4;
  return {
    mobile,
    worldGap: mobile ? 15 : 12.4,
    flowerCount: constrained ? 52000 : 98000,
    terrainCount: constrained ? 28000 : 62000,
    galaxyCount: constrained ? 62000 : 118000,
    starCount: constrained ? 6200 : 13000,
    pixelRatioCap: mobile ? 1.45 : 1.85,
  };
};

export const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);
