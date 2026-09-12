import * as THREE from 'three';

export type ParticleInteractionUniforms = {
  uPointer: { value: THREE.Vector2 };
  uPointerAspect: { value: number };
  uPointerRadius: { value: number };
  uPointerClearRadius: { value: number };
  uPointerActive: { value: number };
  uPointerStrength: { value: number };
};

export const createParticleInteractionUniforms = (): ParticleInteractionUniforms => ({
  uPointer: { value: new THREE.Vector2(4, 4) },
  uPointerAspect: { value: window.innerWidth / Math.max(1, window.innerHeight) },
  uPointerRadius: { value: 0.3 },
  uPointerClearRadius: { value: 0.075 },
  uPointerActive: { value: 0 },
  uPointerStrength: { value: 1 },
});

export type ParticleMaterialOptions = {
  opacity?: number;
  drift?: number;
  maxPointSize?: number;
  blending?: THREE.Blending;
};

const particleVertex = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uMaxPointSize;
uniform float uDrift;
uniform vec2 uPointer;
uniform float uPointerAspect;
uniform float uPointerRadius;
uniform float uPointerClearRadius;
uniform float uPointerActive;
uniform float uPointerStrength;
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
attribute float aGlyph;
varying vec3 vColor;
varying float vSeed;
varying float vGlyph;

void main() {
  vec3 p = position;
  float phase = aSeed * 73.173;
  p += vec3(sin(phase + uTime * 0.31), cos(phase * 1.37 + uTime * 0.27),
    sin(phase * 0.73 + uTime * 0.23)) * uDrift;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  if (uPointerActive > 0.001 && clip.w > 0.0) {
    vec2 ndc = clip.xy / clip.w;
    vec2 delta = ndc - uPointer;
    vec2 metric = vec2(delta.x * uPointerAspect, delta.y);
    float d = length(metric);
    if (d < uPointerRadius) {
      vec2 fallback = vec2(cos(phase), sin(phase));
      vec2 radial = d > 0.0001 ? metric / d : fallback;
      vec2 tangent = vec2(-radial.y, radial.x);
      float influence = 1.0 - smoothstep(0.0, uPointerRadius, d);
      float corePush = max(0.0, uPointerClearRadius - d);
      float fieldPush = pow(influence, 1.42) * uPointerRadius * 0.30;
      float curl = sin(phase * 0.63 + uTime * 1.1) * influence * uPointerRadius * 0.03;
      vec2 warped = metric + radial * (corePush + fieldPush) * uPointerStrength * uPointerActive;
      warped += tangent * curl * uPointerStrength * uPointerActive;
      vec2 warpedNdc = uPointer + vec2(warped.x / uPointerAspect, warped.y);
      clip.xy = warpedNdc * clip.w;
    }
  }

  float distanceScale = clamp(10.5 / max(1.0, -mv.z), 0.42, 2.2);
  gl_PointSize = clamp(aSize * uPixelRatio * distanceScale, 1.0, uMaxPointSize * uPixelRatio);
  gl_Position = clip;
  vColor = aColor;
  vSeed = aSeed;
  vGlyph = aGlyph;
}
`;

const particleFragment = `
uniform float uOpacity;
uniform float uTime;
varying vec3 vColor;
varying float vSeed;
varying float vGlyph;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float radius = length(uv);
  float aa = max(0.008, fwidth(radius) * 1.25);
  float disc = 1.0 - smoothstep(0.44 - aa, 0.5, radius);
  float horizontal = (1.0 - smoothstep(0.055, 0.12, abs(uv.y))) *
    (1.0 - smoothstep(0.25, 0.48, abs(uv.x)));
  float vertical = (1.0 - smoothstep(0.055, 0.12, abs(uv.x))) *
    (1.0 - smoothstep(0.25, 0.48, abs(uv.y)));
  float crossShape = max(horizontal, vertical);
  float shape = mix(disc, crossShape, step(0.5, vGlyph));
  float core = 1.0 - smoothstep(0.0, 0.38, radius);
  float shimmer = 0.88 + 0.12 * sin(vSeed * 91.7 + uTime * 0.72);
  float alpha = shape * uOpacity * shimmer;
  if (alpha < 0.008) discard;
  vec3 color = vColor * (1.0 + core * 0.24);
  gl_FragColor = vec4(color, alpha);
}
`;

export const createParticleMaterial = (
  pixelRatio: number,
  interaction: ParticleInteractionUniforms,
  options: ParticleMaterialOptions = {},
) => new THREE.ShaderMaterial({
  uniforms: {
    ...interaction,
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uMaxPointSize: { value: options.maxPointSize ?? 8.5 },
    uOpacity: { value: options.opacity ?? 1 },
    uDrift: { value: options.drift ?? 0.012 },
  },
  vertexShader: particleVertex,
  fragmentShader: particleFragment,
  transparent: true,
  depthWrite: false,
  depthTest: true,
  blending: options.blending ?? THREE.NormalBlending,
});

export const resizeParticleInteraction = (
  interaction: ParticleInteractionUniforms,
  width: number,
  height: number,
) => {
  interaction.uPointerAspect.value = width / Math.max(1, height);
  interaction.uPointerRadius.value = THREE.MathUtils.clamp((2 * 130) / Math.max(1, height), 0.18, 0.44);
  interaction.uPointerClearRadius.value = THREE.MathUtils.clamp((2 * 38) / Math.max(1, height), 0.06, 0.15);
};
