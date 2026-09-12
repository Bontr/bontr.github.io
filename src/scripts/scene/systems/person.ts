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
  person.renderOrder = 8;

  const haloMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: 0.22 },
      uColor: { value: new THREE.Color(0xffb878) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv; void main(){ vec2 p=(vUv-0.5)*2.0; float r=dot(p,p); float a=(exp(-r*5.2)+exp(-r*1.45)*0.23)*uOpacity; if(a<0.004) discard; gl_FragColor=vec4(uColor,a); }`,
  });
  const haloGeometry = new THREE.PlaneGeometry(1.72, 0.9);
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.position.set(x, ground + 0.32, z - 0.08);
  halo.renderOrder = 2;
  root.add(halo);

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

  const shadowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: { uOpacity: { value: 0.58 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uOpacity; varying vec2 vUv; void main(){ vec2 p=(vUv-0.5)*2.0; p.x*=0.72; float d=dot(p,p); float a=(1.0-smoothstep(0.08,1.0,d))*uOpacity; if(a<0.004) discard; gl_FragColor=vec4(0.0,0.0,0.0,a); }`,
  });
  const shadowGeometry = new THREE.PlaneGeometry(1, 1);
  shadowGeometry.rotateX(-Math.PI / 2);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.set(x - 0.42, ground + 0.028, z + 0.16);
  shadow.scale.set(1.75, 1, 0.5);
  shadow.rotation.y = -0.12;
  shadow.renderOrder = 20;
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
      haloMaterial.uniforms.uOpacity.value = 0.22 * visible;
      shadowMaterial.uniforms.uOpacity.value = 0.58 * visible;
      root.visible = visible > 0.002;
    },
    resize() {},
    dispose() {
      person.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      material.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
    },
  };
};
