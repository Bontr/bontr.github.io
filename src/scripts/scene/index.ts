import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clamp01, getSceneConfig } from './core/config';
import { createCameraPath } from './core/cameraPath';
import {
  createParticleInteractionUniforms,
  resizeParticleInteraction,
} from './core/particleMaterial';
import type { PointerState, SceneFrame } from './core/types';
import { getFieldSettleStart, SCENE_TIMELINE } from './core/timeline';
import { createSceneSystems } from './systems';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector<HTMLCanvasElement>('[data-scene-canvas]');
const home = document.querySelector<HTMLElement>('.home');
const fieldCopy = document.querySelector<HTMLElement>('.field__copy');
if (!canvas || !home) throw new Error('Bontr scene mount was not found.');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const config = getSceneConfig();
let pixelRatio = Math.min(window.devicePixelRatio || 1, config.pixelRatioCap);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setClearColor(0x020202, 1);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
const camera = new THREE.PerspectiveCamera(
  config.mobile ? 52 : 44,
  window.innerWidth / Math.max(1, window.innerHeight),
  0.1,
  75,
);
const composer = new EffectComposer(renderer);
composer.setPixelRatio(pixelRatio);
composer.setSize(window.innerWidth, window.innerHeight);

const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  config.mobile ? 0.3 : 0.42,
  0.18,
  0.82,
);
const smaaPass = new SMAAPass();
const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(smaaPass);
composer.addPass(outputPass);

const interaction = createParticleInteractionUniforms();
resizeParticleInteraction(interaction, window.innerWidth, window.innerHeight);
const systems = createSceneSystems(config, pixelRatio, interaction);
systems.forEach((system) => scene.add(system.root));

const { cameraCurve, targetCurve } = createCameraPath(config.mobile, config.worldGap);
const cameraTarget = new THREE.Vector3();
const scrollState = { progress: 0 };

const pointer: PointerState = {
  ndc: new THREE.Vector2(0, 0),
  targetNdc: new THREE.Vector2(0, 0),
  active: 0,
  targetActive: 0,
};
let cameraPointerX = 0;
let cameraPointerY = 0;

const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const updateFieldCopy = (progress: number) => {
  if (!fieldCopy) return;
  const start = getFieldSettleStart(config.mobile);
  const settle = smootherstep(
    (progress - start) / Math.max(0.001, SCENE_TIMELINE.fieldSettle.end - start),
  );
  const shortWide = window.innerWidth >= 1400 && window.innerHeight <= 780;
  const offsetVh = config.mobile ? 50 : shortWide ? 18.5 : 20;
  fieldCopy.style.transform = `translate3d(0, ${settle * window.innerHeight * (offsetVh / 100)}px, 0)`;
};

const updatePointer = () => {
  pointer.ndc.lerp(pointer.targetNdc, reduceMotion ? 1 : 0.34);
  const activeEase = pointer.targetActive > pointer.active ? 0.42 : 0.14;
  pointer.active += (pointer.targetActive - pointer.active) * activeEase;
  interaction.uPointer.value.copy(pointer.ndc);
  interaction.uPointerActive.value = reduceMotion ? 0 : pointer.active;
};

const applyScene = (progress: number, time: number) => {
  const p = clamp01(progress);
  const travelPulse = Math.sin(p * Math.PI);
  updatePointer();
  updateFieldCopy(p);

  cameraCurve.getPointAt(p, camera.position);
  targetCurve.getPointAt(p, cameraTarget);
  cameraPointerX += (pointer.targetNdc.x - cameraPointerX) * 0.045;
  cameraPointerY += (pointer.targetNdc.y - cameraPointerY) * 0.045;
  camera.position.x += cameraPointerX * (0.18 - p * 0.07);
  camera.position.y += cameraPointerY * (0.12 - p * 0.04);
  cameraTarget.x += cameraPointerX * 0.08;
  cameraTarget.y += cameraPointerY * 0.055;
  camera.lookAt(cameraTarget);

  const frame: SceneFrame = {
    progress: p,
    time,
    travelPulse,
    pointer,
    viewport: { width: window.innerWidth, height: window.innerHeight, pixelRatio },
  };
  systems.forEach((system) => system.update(frame));

  const baseBloom = config.mobile ? 0.28 : 0.38;
  bloomPass.strength = baseBloom + travelPulse * (config.mobile ? 0.012 : 0.02);
  bloomPass.radius = 0.14 + travelPulse * 0.01;
};

if (reduceMotion) {
  const syncReducedMotion = () => {
    const maxScroll = Math.max(1, home.offsetHeight - window.innerHeight);
    scrollState.progress = clamp01((window.scrollY - home.offsetTop) / maxScroll);
  };
  window.addEventListener('scroll', syncReducedMotion, { passive: true });
  window.addEventListener('resize', syncReducedMotion, { passive: true });
  syncReducedMotion();
} else {
  gsap.to(scrollState, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: home,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

window.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  pointer.targetNdc.set(
    (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2,
    (0.5 - event.clientY / Math.max(1, window.innerHeight)) * 2,
  );
  pointer.targetActive = 1;
}, { passive: true });

const releasePointer = () => {
  pointer.targetActive = 0;
};
document.documentElement.addEventListener('pointerleave', releasePointer, { passive: true });
window.addEventListener('blur', releasePointer, { passive: true });

const resize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const exploreTraveling = document.documentElement.classList.contains('explore-traveling');
  const qualityCap = exploreTraveling ? (width < 720 ? 1 : 1.2) : (width < 720 ? 1.45 : 1.85);
  pixelRatio = Math.min(window.devicePixelRatio || 1, qualityCap);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);
  smaaPass.enabled = !exploreTraveling;
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  resizeParticleInteraction(interaction, width, height);
  systems.forEach((system) => system.resize(width, height, pixelRatio));
};
window.addEventListener('resize', resize, { passive: true });
resize();
ScrollTrigger.refresh();

const startedAt = performance.now();
renderer.setAnimationLoop((timeMs) => {
  const elapsed = reduceMotion ? 0 : (timeMs - startedAt) * 0.001;
  applyScene(scrollState.progress, elapsed);
  composer.render();
});

window.addEventListener('pagehide', () => {
  renderer.setAnimationLoop(null);
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  systems.forEach((system) => system.dispose());
  bloomPass.dispose();
  smaaPass.dispose();
  outputPass.dispose();
  composer.dispose();
  renderer.dispose();
});
