import * as THREE from 'three';

export const createCameraPath = (mobile: boolean, worldGap: number) => {
  const cameraCurve = new THREE.CatmullRomCurve3(
    mobile
      ? [
          new THREE.Vector3(0, 0.1, 18),
          new THREE.Vector3(0.04, -worldGap * 0.2, 16.3),
          new THREE.Vector3(0.1, -worldGap * 0.48, 14.9),
          new THREE.Vector3(0.14, -worldGap * 0.76, 14.1),
          new THREE.Vector3(0.18, -worldGap + 0.02, 13.8),
        ]
      : [
          new THREE.Vector3(0, 0, 12.6),
          new THREE.Vector3(0.02, -worldGap * 0.2, 12),
          new THREE.Vector3(0.08, -worldGap * 0.48, 11.45),
          new THREE.Vector3(0.05, -worldGap * 0.76, 11.05),
          new THREE.Vector3(0, -worldGap, 10.9),
        ],
    false,
    'catmullrom',
    0.5,
  );

  const targetCurve = new THREE.CatmullRomCurve3(
    mobile
      ? [
          new THREE.Vector3(2.1, 0.12, -4),
          new THREE.Vector3(2.5, -worldGap * 0.2, -4.9),
          new THREE.Vector3(3.15, -worldGap * 0.48, -6.2),
          new THREE.Vector3(3.9, -worldGap * 0.76, -7.55),
          new THREE.Vector3(4.5, -worldGap - 0.1, -8.6),
        ]
      : [
          new THREE.Vector3(0, 0, -6.2),
          new THREE.Vector3(0.04, -worldGap * 0.2, -6.6),
          new THREE.Vector3(0.12, -worldGap * 0.48, -7.45),
          new THREE.Vector3(0.08, -worldGap * 0.76, -8.65),
          new THREE.Vector3(0, -worldGap, -9.75),
        ],
    false,
    'catmullrom',
    0.5,
  );
  return { cameraCurve, targetCurve };
};
