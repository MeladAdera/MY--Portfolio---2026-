const srgb = (hex) => new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

/* ---------- drawing compositor ---------- */
const NormalIdMaterial = (id) => new THREE.ShaderMaterial({
  uniforms: { id: { value: id } },
  side: THREE.DoubleSide,
  vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float id; varying vec3 vN; void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; gl_FragColor = vec4(n * 0.5 + 0.5, id); }'
});

const DrawShader = {
  uniforms: {
    tTone: { value: null }, tNorm: { value: null }, tDepth: { value: null }, tPhys: { value: null },
    res: { value: new THREE.Vector2(1, 1) }, lw: { value: 1 }, near: { value: 0.1 }, far: { value: 80 },
    dip: { value: 0 }, theme: { value: 0 },
    graphite: { value: srgb('#34312D') }, graphiteDark: { value: srgb('#0E1216') },
    figPaper: { value: srgb('#F4F1EB') }, figPaperDark: { value: srgb('#AEB8C2') }, dipCol: { value: srgb('#EEEAE3') }
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    uniform sampler2D tTone, tNorm, tDepth, tPhys;
    uniform vec2 res; uniform float lw, near, far, dip, theme;
    uniform vec3 graphite, graphiteDark, figPaper, figPaperDark, dipCol;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    float linZ(float d){ float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
    float hatch(vec2 p, vec2 dir, float spacing, float dark, float t0, float t1){
      float c = dot(p, dir) / spacing;
      float d = abs(fract(c) - 0.5) * spacing;
      float w = mix(0.18, 0.8, smoothstep(t0, 1.0, dark)) * lw;
      float line = 1.0 - smoothstep(w - 0.55 * lw, w + 0.55 * lw, d);
      float along = dot(p, vec2(-dir.y, dir.x));
      float brk = smoothstep(0.22, 0.5, noise(vec2(along * 0.045 / lw, floor(c) * 3.17)));
      return line * smoothstep(t0, t1, dark) * brk;
    }
    void main(){
      vec2 px = 1.0 / res;
      vec2 fc = gl_FragCoord.xy;
      vec2 wob = (vec2(noise(fc * 0.018 / lw + 3.1), noise(fc * 0.018 / lw + 7.7)) - 0.5) * 1.4 * lw * px;
      vec2 uv = vUv + wob;
      float zc = linZ(texture2D(tDepth, uv).x);
      vec3 n[9]; float z[9]; float mk = 0.0; float ida[9];
      for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++) {
        vec2 o = vec2(float(i) - 1.0, float(j) - 1.0) * px * lw * 0.8;
        vec4 s = texture2D(tNorm, uv + o);
        n[j * 3 + i] = s.rgb; ida[j * 3 + i] = s.a; mk = max(mk, step(0.3, s.a));
        z[j * 3 + i] = linZ(texture2D(tDepth, uv + o).x);
      }
      vec3 nx = (n[2] + 2.0 * n[5] + n[8]) - (n[0] + 2.0 * n[3] + n[6]);
      vec3 ny = (n[6] + 2.0 * n[7] + n[8]) - (n[0] + 2.0 * n[1] + n[2]);
      float ne = length(nx) + length(ny);
      float iz1 = 1.0 / z[1], iz3 = 1.0 / z[3], iz4 = 1.0 / z[4], iz5 = 1.0 / z[5], iz7 = 1.0 / z[7];
      float de = abs(iz1 + iz3 + iz5 + iz7 - 4.0 * iz4) / iz4;
      float ide = 0.0;
      for (int k = 0; k < 9; k++) ide = max(ide, step(0.1, ida[k] - ida[4]));
      float edge = max(max(smoothstep(0.5, 1.15, ne), smoothstep(0.03, 0.09, de)), ide) * 0.86;
      edge *= mix(1.0, 0.35, smoothstep(5.5, 12.0, zc));
      edge *= 0.82 + 0.18 * noise(fc * 0.07 / lw);

      vec3 lin = texture2D(tTone, vUv).rgb;
      float L = dot(lin, vec3(0.2126, 0.7152, 0.0722));
      float bright = 1.0 - exp(-L * 2.4);
      float dark = clamp(1.0 - bright, 0.0, 1.0);
      float h1 = hatch(fc, vec2(0.7071, 0.7071), 5.6 * lw, dark, 0.38, 0.55);
      float h2 = hatch(fc, vec2(0.866, -0.5), 5.6 * lw, dark, 0.56, 0.74);
      float grain = 0.5 * noise(fc * 0.9 / lw) + 0.5 * noise(fc * 0.23 / lw);
      float smudge = smoothstep(0.12, 0.95, dark) * 0.22;
      float fiber = 0.985 + 0.03 * (noise(fc * 0.5 / lw) - 0.5);
      float id = texture2D(tNorm, vUv).a;
      float figure = step(0.3, id);
      vec3 ink3 = mix(graphite, graphiteDark, theme);
      vec3 base = mix(figPaper, figPaperDark, theme) * fiber;
      float ink = max(edge, max(h1, h2) * 0.62);
      vec3 drawn = mix(base * (1.0 - smudge * (0.75 + 0.25 * grain)), ink3, ink * (0.82 + 0.18 * grain));
      vec3 phys = texture2D(tPhys, vUv).rgb;
      vec3 col = mix(phys, drawn, figure);
      col = mix(col, ink3, edge * mk * (1.0 - figure) * 0.92);
      vec2 dv = (vUv - 0.5) * vec2(1.0, 0.85);
      col *= mix(0.93, 1.0, smoothstep(0.8, 0.25, length(dv)));
      col += (hash(fc) - 0.5) * 0.018;
      col = mix(col, dipCol, dip);
      gl_FragColor = vec4(col, 1.0);
    }
  `
};
