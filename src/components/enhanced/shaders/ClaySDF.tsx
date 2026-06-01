// Clay SDF Material for React Three Fiber
// Uses raymarching with signed distance fields for organic clay shapes
// Subsurface scattering for realistic light penetration

export const clayVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const clayFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uRoughness;
  uniform float uSubsurface;
  uniform vec3 uLightPosition;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  // Noise functions for organic displacement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // SDF Primitives
  float sdSphere(vec3 p, float s) {
    return length(p) - s;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
  }

  float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
  }

  // Smooth minimum for organic blending
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Clay SDF - organic blob shape
  float sdClay(vec3 p) {
    float t = uTime * 0.5;

    // Base shape: rounded box with noise displacement
    float noise1 = snoise(p * 2.0 + t) * 0.1;
    float noise2 = snoise(p * 4.0 - t * 0.7) * 0.05;

    vec3 displaced = p + vec3(noise1, noise2, noise1 * 0.5);

    float d1 = sdRoundBox(displaced, vec3(0.8, 0.6, 0.4), 0.3);
    float d2 = sdSphere(p + vec3(0.2, 0.1, 0.0), 0.5);

    // Blend shapes for organic feel
    float d = smin(d1, d2, 0.3);

    // Add surface detail
    float detail = snoise(p * 8.0 + t * 0.3) * 0.02;
    d += detail;

    return d;
  }

  // Raymarching
  float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      float d = sdClay(p);
      if (d < 0.001 || t > 10.0) break;
      t += d * 0.8;
    }
    return t;
  }

  // Normal calculation
  vec3 calcNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
      sdClay(p + vec3(eps, 0, 0)) - sdClay(p - vec3(eps, 0, 0)),
      sdClay(p + vec3(0, eps, 0)) - sdClay(p - vec3(0, eps, 0)),
      sdClay(p + vec3(0, 0, eps)) - sdClay(p - vec3(0, 0, eps))
    ));
  }

  // Subsurface scattering approximation
  vec3 subsurface(vec3 p, vec3 n, vec3 l, vec3 v) {
    float thickness = 0.3;
    vec3 transmission = uColor * exp(-thickness * vec3(1.0, 0.8, 0.6));
    float wrap = max(dot(n, l) * 0.5 + 0.5, 0.0);
    return transmission * wrap * uSubsurface;
  }

  void main() {
    vec3 ro = vPosition;
    vec3 rd = normalize(uLightPosition - ro);

    float t = raymarch(ro, rd);

    if (t > 10.0) {
      discard;
    }

    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 l = normalize(uLightPosition - p);
    vec3 v = normalize(-rd);

    // Lighting
    float diff = max(dot(n, l), 0.0);
    vec3 h = normalize(l + v);
    float spec = pow(max(dot(n, h), 0.0), 32.0 * (1.0 - uRoughness));

    // Fresnel
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);

    // Combine
    vec3 ambient = uColor * 0.3;
    vec3 diffuse = uColor * diff * 0.7;
    vec3 specular = vec3(1.0) * spec * 0.3;
    vec3 subsurf = subsurface(p, n, l, v);
    vec3 rim = uColor * fresnel * 0.2;

    vec3 color = ambient + diffuse + specular + subsurf + rim;

    // Soft shadow
    float shadow = 1.0;
    float t2 = 0.01;
    for (int i = 0; i < 20; i++) {
      vec3 sp = p + l * t2;
      float d = sdClay(sp);
      if (d < 0.001) { shadow = 0.0; break; }
      shadow = min(shadow, 10.0 * d / t2);
      t2 += d;
      if (t2 > 5.0) break;
    }

    color *= 0.5 + 0.5 * shadow;

    // Tone mapping
    color = color / (1.0 + color);
    color = pow(color, vec3(0.4545));

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Uniforms configuration
export const clayUniforms = {
  uTime: { value: 0 },
  uColor: { value: [0.64, 0.9, 0.21] }, // Mint green
  uRoughness: { value: 0.4 },
  uSubsurface: { value: 0.6 },
  uLightPosition: { value: [5, 5, 5] },
};
