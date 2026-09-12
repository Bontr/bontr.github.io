import * as THREE from 'three';
import { FLOWER_CENTER, GALAXY_CENTER } from './config';

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export const makeRng = (seed = 1337) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const gaussian = (random: () => number) => {
  const u = Math.max(1e-7, random());
  const v = Math.max(1e-7, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
};

const set3 = (array: Float32Array, i: number, x: number, y: number, z: number) => {
  const o = i * 3;
  array[o] = x;
  array[o + 1] = y;
  array[o + 2] = z;
};

const buildGeometry = (
  positions: Float32Array,
  colors: Float32Array,
  sizes: Float32Array,
  seeds: Float32Array,
  glyphs: Float32Array,
) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aGlyph', new THREE.BufferAttribute(glyphs, 1));
  geometry.computeBoundingSphere();
  return geometry;
};

const writeColor = (target: Float32Array, i: number, color: THREE.Color, scale = 1) => {
  set3(target, i, color.r * scale, color.g * scale, color.b * scale);
};

const flowerPetals = [
  { angle: 0, length: 6.65, width: 1.78, tilt: -10, curl: 0.12, bend: 0.18 },
  { angle: 38, length: 6.05, width: 1.72, tilt: 22, curl: 0.24, bend: -0.38 },
  { angle: 84, length: 5.65, width: 1.68, tilt: -20, curl: 0.18, bend: 0.42 },
  { angle: 148, length: 6.05, width: 1.82, tilt: 28, curl: 0.3, bend: -0.48 },
  { angle: -148, length: 5.95, width: 1.72, tilt: -29, curl: 0.28, bend: 0.48 },
  { angle: -56, length: 6.25, width: 1.8, tilt: 24, curl: 0.22, bend: -0.34 },
];

export const createFlowerGeometry = (count: number) => {
  const random = makeRng(481516);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const coreCount = Math.floor(count * 0.105);
  const cool = new THREE.Color(0.74, 0.78, 0.82);
  const warm = new THREE.Color(1.72, 0.58, 0.21);
  const temp = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    if (i < coreCount) {
      const t = Math.sqrt((i + 0.5) / coreCount);
      const theta = i * GOLDEN_ANGLE + (random() - 0.5) * 0.16;
      const x = Math.cos(theta) * t * 1.2;
      const y = Math.sin(theta) * t * 0.8;
      const z = gaussian(random) * 0.2 + (1 - t) * 0.28;
      set3(positions, i, FLOWER_CENTER.x + x, FLOWER_CENTER.y + y, FLOWER_CENTER.z + z);
      temp.copy(cool).lerp(warm, 0.82 + (1 - t) * 0.18);
      writeColor(colors, i, temp, 1.05 + (1 - t) * 0.34);
      sizes[i] = 0.78 + random() * 1.4;
      glyphs[i] = random() < 0.18 ? 1 : 0;
    } else {
      const petal = flowerPetals[Math.floor(random() * flowerPetals.length)];
      const t = Math.pow(random(), 0.88);
      const edge = random() < 0.62;
      const side = edge
        ? (random() < 0.5 ? -1 : 1) * (0.72 + random() * 0.28)
        : random() * 2 - 1;
      const envelope = Math.pow(Math.sin(Math.PI * t), 0.72);
      const axisBend = petal.bend * Math.sin(Math.PI * t) * (0.34 + t * 0.62);
      const lx = side * petal.width * envelope * (0.92 + random() * 0.18) + axisBend;
      const ly = 0.25 + t * petal.length;
      const lz = 0.62 * Math.sin(Math.PI * t) * (1 - side * side) +
        petal.curl * t * t + gaussian(random) * 0.055;
      const tilt = THREE.MathUtils.degToRad(petal.tilt);
      const yt = ly * Math.cos(tilt) - lz * Math.sin(tilt);
      const zt = ly * Math.sin(tilt) + lz * Math.cos(tilt);
      const angle = THREE.MathUtils.degToRad(petal.angle);
      const x = lx * Math.cos(angle) - yt * Math.sin(angle);
      const y = lx * Math.sin(angle) + yt * Math.cos(angle);
      set3(positions, i, FLOWER_CENTER.x + x, FLOWER_CENTER.y + y, FLOWER_CENTER.z + zt);
      const edgeLight = Math.pow(Math.abs(side), 1.6) * 0.6 + (1 - t) * 0.16;
      const warmth = Math.exp(-t * 7.2) * 0.84;
      temp.copy(cool).lerp(warm, warmth);
      writeColor(colors, i, temp, 0.5 + edgeLight * 0.7 + random() * 0.16);
      sizes[i] = 0.58 + random() * 0.9 + edgeLight * 0.5;
      glyphs[i] = random() < 0.025 + edgeLight * 0.035 ? 1 : 0;
    }
    seeds[i] = random();
  }
  return buildGeometry(positions, colors, sizes, seeds, glyphs);
};

export const createGalaxyGeometry = (count: number) => {
  const random = makeRng(902109);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const coreCount = Math.floor(count * 0.085);
  const cool = new THREE.Color(0.78, 0.8, 0.83);
  const warm = new THREE.Color(1.82, 0.69, 0.26);
  const temp = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    let x: number;
    let y: number;
    let z: number;
    let warmth: number;
    let brightness: number;
    if (i < coreCount) {
      const r = Math.pow(random(), 1.7) * 1.7;
      const theta = random() * TAU;
      x = Math.cos(theta) * r;
      y = Math.sin(theta) * r * 0.82;
      z = gaussian(random) * (0.14 + (1 - r / 1.7) * 0.2);
      warmth = 1;
      brightness = 1.08 + random() * 0.26;
    } else {
      const diffuse = random() < 0.18;
      const radius = 0.55 + Math.pow(random(), diffuse ? 0.86 : 0.68) * (diffuse ? 9.25 : 8.45);
      if (diffuse) {
        const theta = random() * TAU;
        x = Math.cos(theta) * radius;
        y = Math.sin(theta) * radius;
        brightness = 0.08 + random() * 0.2;
      } else {
        const arm = Math.floor(random() * 4);
        const armOffset = arm * (TAU / 4) + (arm % 2 === 0 ? 0.05 : -0.04);
        const spread = 0.055 + radius * 0.014;
        const theta = armOffset + radius * 0.31 + gaussian(random) * spread;
        const radialJitter = gaussian(random) * (0.06 + radius * 0.012);
        x = Math.cos(theta) * (radius + radialJitter);
        y = Math.sin(theta) * (radius + radialJitter);
        brightness = 0.72 - radius * 0.028 + random() * 0.46;
      }
      z = gaussian(random) * (0.07 + (1 - Math.min(1, radius / 8.6)) * 0.17);
      warmth = Math.max(0, 1 - radius / 5.8) * 0.72 + (random() < 0.06 ? 0.2 : 0);
    }

    const tilt = THREE.MathUtils.degToRad(59);
    const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
    const zt = y * Math.sin(tilt) + z * Math.cos(tilt);
    const spin = THREE.MathUtils.degToRad(-7);
    const xs = x * Math.cos(spin) - yt * Math.sin(spin);
    const ys = x * Math.sin(spin) + yt * Math.cos(spin);
    set3(positions, i, GALAXY_CENTER.x + xs, GALAXY_CENTER.y + ys, GALAXY_CENTER.z + zt);
    temp.copy(cool).lerp(warm, Math.min(1, warmth));
    writeColor(colors, i, temp, brightness * 1.38);
    sizes[i] = 0.68 + random() * 1.08 + brightness * 0.38;
    glyphs[i] = random() < 0.012 ? 1 : 0;
    seeds[i] = random();
  }
  return buildGeometry(positions, colors, sizes, seeds, glyphs);
};

export const terrainHeight = (x: number, z: number) =>
  -2.72 - x * 0.018 - x * x * 0.0027 +
  Math.sin((x - 0.7) * 0.21) * 0.42 +
  Math.cos(z * 0.29) * 0.17 +
  Math.sin((x + z) * 0.14) * 0.17 +
  Math.sin(z * 0.5 + x * 0.08) * 0.22 +
  Math.cos((x - z) * 0.18) * 0.14 +
  Math.exp(-((z - 1.6) ** 2) / 8) * 0.22;

export const createTerrainGeometry = (count: number) => {
  const random = makeRng(271828);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const columns = Math.max(1, Math.floor(Math.sqrt(count * 1.85)));
  const rows = Math.ceil(count / columns);
  const dark = new THREE.Color(0.24, 0.27, 0.3);
  const silver = new THREE.Color(0.72, 0.72, 0.7);
  const amber = new THREE.Color(1.38, 0.54, 0.22);
  const temp = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const cx = i % columns;
    const cz = Math.floor(i / columns);
    const x = -15 + (cx / Math.max(1, columns - 1)) * 30 + (random() - 0.5) * 0.12;
    const z = -8.5 + (cz / Math.max(1, rows - 1)) * 18 + (random() - 0.5) * 0.11;
    const y = terrainHeight(x, z) + (random() - 0.5) * 0.028;
    set3(positions, i, x, y, z);
    const ridge = Math.exp(-((z - 1.55) ** 2) / 0.55) * Math.exp(-(x * x) / 88);
    const depth = THREE.MathUtils.clamp((z + 8.5) / 18, 0, 1);
    temp.copy(dark).lerp(silver, 0.2 + depth * 0.34 + ridge * 0.48);
    temp.lerp(amber, ridge * 0.68);
    writeColor(colors, i, temp, 0.94 + random() * 0.5 + ridge * 1.85);
    sizes[i] = 0.64 + random() * 1.0 + ridge * 0.5;
    glyphs[i] = random() < 0.012 ? 1 : 0;
    seeds[i] = random();
  }
  return buildGeometry(positions, colors, sizes, seeds, glyphs);
};

export const createStarGeometry = (count: number, centerY: number, halfSpanY: number) => {
  const random = makeRng(20260912);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const glyphs = new Float32Array(count);
  const cool = new THREE.Color(0.64, 0.72, 0.8);
  const warm = new THREE.Color(1.55, 0.62, 0.25);
  const temp = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const x = (random() * 2 - 1) * 19;
    const y = centerY + (random() * 2 - 1) * halfSpanY;
    const z = -7 - random() * 20;
    set3(positions, i, x, y, z);
    const warmth = random() < 0.075 ? 0.55 + random() * 0.45 : 0;
    temp.copy(cool).lerp(warm, warmth);
    writeColor(colors, i, temp, 0.48 + random() * 0.72);
    sizes[i] = 0.48 + random() * 1.06 + (random() < 0.018 ? 1.45 : 0);
    glyphs[i] = random() < 0.015 ? 1 : 0;
    seeds[i] = random();
  }
  return buildGeometry(positions, colors, sizes, seeds, glyphs);
};
