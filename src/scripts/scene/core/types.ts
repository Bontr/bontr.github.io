import * as THREE from 'three';

export type PointerState = {
  ndc: THREE.Vector2;
  targetNdc: THREE.Vector2;
  active: number;
  targetActive: number;
};

export type SceneFrame = {
  progress: number;
  time: number;
  travelPulse: number;
  pointer: PointerState;
  viewport: { width: number; height: number; pixelRatio: number };
};

export interface SceneSystem {
  root: THREE.Object3D;
  update(frame: SceneFrame): void;
  resize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}
