import zt from "gsap";
const kt = (d, t = 0, i = 1) => Math.max(t, Math.min(i, d));
function Ht(d, t) {
  const i = d[t], n = d[t + 1], e = d[t + 2], s = Math.max(i, n, e), l = Math.min(i, n, e), o = 128 - 0.168736 * i - 0.331264 * n + 0.5 * e, r = 128 + 0.5 * i - 0.418688 * n - 0.081312 * e;
  return i < 48 || s - l < 12 || r < 128 || r > 181 || o < 72 || o > 137 ? 0 : kt((i - n + 18) / 70) * kt((r - 128) / 24) * kt((137 - o) / 28);
}
function st(d, t, i, n, e, s, l, o) {
  const r = Math.max(0, Math.floor(n - s * 2.5)), a = Math.min(t - 1, Math.ceil(n + s * 2.5)), g = Math.max(0, Math.floor(e - l * 2.5)), c = Math.min(i - 1, Math.ceil(e + l * 2.5));
  for (let h = g; h <= c; h++) for (let k = r; k <= a; k++) {
    const y = (k - n) / s, p = (h - e) / l, M = o * Math.exp(-(y * y + p * p) * 0.5), f = h * t + k;
    d[f] = Math.max(d[f], M);
  }
}
function Ut(d, t, i) {
  const n = Math.max(2, Math.round(Math.min(t, i) / 150)), e = Math.ceil(t / n), s = Math.ceil(i / n), l = new Uint8Array(e * s), o = new Uint8Array(e * s);
  for (let m = 0; m < s; m++) for (let x = 0; x < e; x++) {
    const v = Math.min(t - 1, Math.round((x + 0.5) * n)), b = Math.min(i - 1, Math.round((m + 0.5) * n));
    l[m * e + x] = Ht(d, (b * t + v) * 4) > 0.17 ? 1 : 0;
  }
  let r = [];
  for (let m = 0; m < l.length; m++) {
    if (o[m] || !l[m]) continue;
    const x = [], v = [m];
    for (o[m] = 1; v.length; ) {
      const b = v.pop(), S = b % e;
      x.push(b);
      for (const w of [b - 1, b + 1, b - e, b + e])
        w < 0 || w >= l.length || o[w] || !l[w] || Math.abs(w % e - S) > 1 || (o[w] = 1, v.push(w));
    }
    x.length > r.length && (r = x);
  }
  if (r.length < Math.max(18, l.length * 0.012)) return;
  let a = e, g = s, c = 0, h = 0;
  for (const m of r) {
    const x = m % e, v = Math.floor(m / e);
    a = Math.min(a, x), c = Math.max(c, x), g = Math.min(g, v), h = Math.max(h, v);
  }
  let k = a * n, y = Math.min(t, (c + 1) * n), p = g * n, M = Math.min(i, (h + 1) * n), f = y - k, u = M - p;
  if (u > f * 1.48 && (M = Math.min(M, p + f * 1.48)), u = M - p, !(f < t * 0.12 || u < i * 0.12))
    return k = Math.max(0, k - f * 0.13), y = Math.min(t, y + f * 0.13), p = Math.max(0, p - u * 0.18), M = Math.min(i, M + u * 0.08), { left: k, right: y, top: p, bottom: M, width: y - k, height: M - p };
}
function $t(d, t, i, n, e, s, l, o, r) {
  const a = [], g = Math.max(2, Math.round((e - n) * 0.055));
  for (let k = Math.max(g, Math.round(s)); k < Math.min(i - g, Math.round(l)); k += 2) for (let y = Math.max(g, Math.round(n)); y < Math.min(t - g, Math.round(e)); y += 2) {
    const p = (k * t + y) * 4, M = d[p] * 0.2126 + d[p + 1] * 0.7152 + d[p + 2] * 0.0722;
    let f = 0, u = 0;
    for (const [x, v] of [[-g, 0], [g, 0], [0, -g], [0, g]]) {
      const b = ((k + v) * t + y + x) * 4;
      f += d[b] * 0.2126 + d[b + 1] * 0.7152 + d[b + 2] * 0.0722, u++;
    }
    const m = f / u - M;
    m > 5 && a.push({ x: y, y: k, score: m });
  }
  a.sort((k, y) => y.score - k.score);
  const c = a.slice(0, Math.max(4, Math.ceil(a.length * 0.04)));
  if (!c.length) return { x: o, y: r };
  const h = c.reduce((k, y) => k + y.score, 0);
  return { x: c.reduce((k, y) => k + y.x * y.score, 0) / h, y: c.reduce((k, y) => k + y.y * y.score, 0) / h };
}
function Qt(d, t, i, n = "auto") {
  const e = new Float32Array(t * i);
  if (n === "uniform")
    return e.fill(1), e;
  const s = new Float32Array(t * i);
  for (let f = 0; f < s.length; f++) {
    const u = f * 4;
    s[f] = d[u] * 0.2126 + d[u + 1] * 0.7152 + d[u + 2] * 0.0722;
  }
  for (let f = 1; f < i - 1; f++) for (let u = 1; u < t - 1; u++) {
    const m = f * t + u, x = m * 4, v = Math.hypot(s[m + 1] - s[m - 1], s[m + t] - s[m - t]) / 255, b = (Math.max(d[x], d[x + 1], d[x + 2]) - Math.min(d[x], d[x + 1], d[x + 2])) / 255;
    e[m] = kt(0.08 + v * 1.45 + b * 0.1, 0, 0.48);
  }
  const l = Ut(d, t, i);
  if (!l) return e;
  const { left: o, right: r, top: a, bottom: g } = l, c = l.width, h = l.height, k = (o + r) * 0.5;
  st(e, t, i, k, a + h * 0.5, c * 0.48, h * 0.5, 0.58);
  const y = $t(d, t, i, o + c * 0.1, k - c * 0.03, a + h * 0.25, a + h * 0.53, o + c * 0.32, a + h * 0.4), p = $t(d, t, i, k + c * 0.03, r - c * 0.1, a + h * 0.25, a + h * 0.53, o + c * 0.68, a + h * 0.4);
  st(e, t, i, y.x, y.y, c * 0.105, h * 0.065, 1), st(e, t, i, p.x, p.y, c * 0.105, h * 0.065, 1), st(e, t, i, y.x, y.y - h * 0.09, c * 0.14, h * 0.045, 0.82), st(e, t, i, p.x, p.y - h * 0.09, c * 0.14, h * 0.045, 0.82), st(e, t, i, k, a + h * 0.59, c * 0.1, h * 0.16, 0.72);
  const M = $t(d, t, i, o + c * 0.25, r - c * 0.25, a + h * 0.62, a + h * 0.86, k, a + h * 0.75);
  return st(e, t, i, M.x, M.y, c * 0.18, h * 0.072, 0.96), st(e, t, i, k, a + h * 0.51, c * 0.55, h * 0.55, 0.62), e;
}
let Xt = class {
  constructor(t) {
    this.state = t, this.state = t * 1000003 | 0 || 1;
  }
  state;
  next() {
    let t = this.state;
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, this.state = t | 0, (t >>> 0) / 4294967296;
  }
  between(t, i) {
    return t + (i - t) * this.next();
  }
};
async function Yt(d) {
  if (typeof d != "string") return d;
  const t = new Image();
  return t.crossOrigin = "anonymous", t.src = d, await t.decode(), t;
}
function Wt(d, t, i, n, e) {
  n = Math.max(0, Math.min(t - 1, Math.round(n))), e = Math.max(0, Math.min(i - 1, Math.round(e)));
  const s = (e * t + n) * 4;
  return [d[s] / 255, d[s + 1] / 255, d[s + 2] / 255];
}
function gt(d, t, i, n, e) {
  let s = 1, l = 1;
  return e === "cover" ? i > n ? s = i / n : l = n / i : i > n ? l = n / i : s = i / n, [(d - 0.5) * s + 0.5, (t - 0.5) * l + 0.5];
}
function yt(d, t, i, n) {
  if (n <= 0) return new Uint8ClampedArray(d);
  const e = new Float32Array(d.length), s = new Uint8ClampedArray(d.length), l = n * 2 + 1;
  for (let o = 0; o < i; o++) for (let r = 0; r < 4; r++) {
    let a = 0;
    for (let g = -n; g <= n; g++) a += d[(o * t + Math.max(0, Math.min(t - 1, g))) * 4 + r];
    for (let g = 0; g < t; g++)
      e[(o * t + g) * 4 + r] = a / l, a -= d[(o * t + Math.max(0, g - n)) * 4 + r], a += d[(o * t + Math.min(t - 1, g + n + 1)) * 4 + r];
  }
  for (let o = 0; o < t; o++) for (let r = 0; r < 4; r++) {
    let a = 0;
    for (let g = -n; g <= n; g++) a += e[(Math.max(0, Math.min(i - 1, g)) * t + o) * 4 + r];
    for (let g = 0; g < i; g++)
      s[(g * t + o) * 4 + r] = a / l, a -= e[(Math.max(0, g - n) * t + o) * 4 + r], a += e[(Math.min(i - 1, g + n + 1) * t + o) * 4 + r];
  }
  return s;
}
function Ft(d, t, i) {
  const n = t * i, e = new Float32Array(n), s = new Float32Array(n), l = new Float32Array(n);
  for (let o = 0; o < n; o++) {
    const r = o * 4;
    e[o] = d[r] * 8337e-7 + d[r + 1] * 2805e-6 + d[r + 2] * 283e-6;
  }
  for (let o = 1; o < i - 1; o++) for (let r = 1; r < t - 1; r++) {
    const a = o * t + r;
    s[a] = -e[a - t - 1] - 2 * e[a - 1] - e[a + t - 1] + e[a - t + 1] + 2 * e[a + 1] + e[a + t + 1], l[a] = -e[a - t - 1] - 2 * e[a - t] - e[a - t + 1] + e[a + t - 1] + 2 * e[a + t] + e[a + t + 1];
  }
  return { luma: e, gx: s, gy: l };
}
function Gt(d, t, i, n, e, s, l, o) {
  const r = Math.ceil(t / n), a = Math.ceil(i / n), g = r * a, c = new Int16Array(g), h = new Uint8Array(g);
  for (let p = 0; p < a; p++) for (let M = 0; M < r; M++) {
    const f = Math.min(t - 1, Math.round((M + 0.5) * n)), u = Math.min(i - 1, Math.round((p + 0.5) * n)), m = (u * t + f) * 4, x = Math.min(e - 1, Math.floor(d[m] / 256 * e)), v = Math.min(e - 1, Math.floor(d[m + 1] / 256 * e)), b = Math.min(e - 1, Math.floor(d[m + 2] / 256 * e));
    c[p * r + M] = x + v * e + b * e * e;
  }
  const k = [];
  for (let p = 0; p < g; p++) {
    if (h[p]) continue;
    const M = c[p], f = [p], u = [];
    h[p] = 1;
    let m = 0, x = 0, v = 0;
    for (; f.length; ) {
      const b = f.pop(), S = b % r, w = Math.floor(b / r), R = Math.min(t - 1, Math.round((S + 0.5) * n)), L = Math.min(i - 1, Math.round((w + 0.5) * n)), W = (L * t + R) * 4;
      u.push(b), m += d[W], x += d[W + 1], v += d[W + 2];
      for (const P of [b - 1, b + 1, b - r, b + r]) {
        if (P < 0 || P >= g || h[P] || c[P] !== M) continue;
        const $ = P % r;
        Math.abs($ - S) > 1 || (h[P] = 1, f.push(P));
      }
    }
    if (u.length >= l) {
      const b = [m / u.length / 255, x / u.length / 255, v / u.length / 255], S = Math.max(...b), w = Math.min(...b);
      b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722 > 0.88 && S - w < 0.1 || k.push({ cells: u, color: b });
    }
  }
  k.sort((p, M) => M.cells.length - p.cells.length);
  const y = [];
  for (const p of k) {
    let M = 0, f = 0;
    const u = p.cells.map(($) => {
      const F = [($ % r + 0.5) * n, (Math.floor($ / r) + 0.5) * n];
      return M += F[0], f += F[1], F;
    });
    M /= u.length, f /= u.length;
    let m = 0, x = 0, v = 0;
    for (const $ of u) {
      const F = $[0] - M, B = $[1] - f;
      m += F * F, x += B * B, v += F * B;
    }
    const b = 0.5 * Math.atan2(2 * v, m - x), S = Math.cos(b), w = Math.sin(b), R = -w, L = S, W = /* @__PURE__ */ new Map(), P = Math.max(n, s * 1.22);
    for (const $ of u) {
      const F = $[0] - M, B = $[1] - f, Y = F * S + B * w, et = F * R + B * L, U = Math.round(et / P), D = W.get(U);
      D ? (D.min = Math.min(D.min, Y), D.max = Math.max(D.max, Y), D.v += et, D.count++) : W.set(U, { min: Y, max: Y, v: et, count: 1 });
    }
    for (const $ of [...W.values()].sort((F, B) => F.v / F.count - B.v / B.count)) {
      let F = $.min + s * 0.65, B = $.max - s * 0.65;
      if ($.count < 2 || B - F < s * 1.65) continue;
      const Y = $.v / $.count, et = o.between(-0.1, 0.1) * s, U = [];
      for (let q = 0; q <= 6; q++) {
        const at = q / 6, E = F + (B - F) * at, G = Math.sin(Math.PI * at) * et, Z = M + S * E + R * (Y + G), Q = f + w * E + L * (Y + G);
        U.push([Z, Q]);
      }
      const D = s * 1.1;
      U.some((q) => q[0] < D || q[0] > t - D || q[1] < D || q[1] > i - D) || y.push({ points: U, color: p.color });
    }
  }
  return y;
}
async function jt(d, t, i, n = 420, e = "cover", s = "watercolor", l = "auto", o, r = {}) {
  const a = await Yt(d), g = Math.min(1, n / Math.max(a.width, a.height)), c = Math.max(24, Math.round(a.width * g)), h = Math.max(24, Math.round(a.height * g)), k = document.createElement("canvas");
  k.width = c, k.height = h;
  const y = k.getContext("2d", { willReadFrequently: !0 });
  y.drawImage(a, 0, 0, c, h);
  const p = y.getImageData(0, 0, c, h).data, M = { strokeEconomy: 0.72, shapeSimplification: 0.62, strokeLength: 0.58, strokeWidth: 0.58, boundaryFidelity: 0.72, detailBudget: 0.42, detailPrecision: 0.78, strokeCurvature: 0.34, ...r }, f = 0.48 + M.strokeEconomy * 0.72, u = 1.55 - M.strokeEconomy * 0.77, m = 1.7 - M.strokeEconomy * 0.97, x = 0.65 + M.strokeLength * 0.6, v = 0.65 + M.strokeWidth * 0.6, b = o ? await o({ data: new Uint8ClampedArray(p), width: c, height: h }) : Qt(p, c, h, l);
  if (b.length !== c * h) throw new Error(`detailMap returned ${b.length} weights; expected ${c * h}.`);
  const S = yt(p, c, h, Math.round(6 + M.shapeSimplification * 7)), w = yt(p, c, h, Math.round(3 + M.shapeSimplification * 5)), R = yt(p, c, h, Math.round(2 + M.shapeSimplification * 2)), L = yt(p, c, h, 1), W = [Ft(R, c, h), Ft(L, c, h), Ft(p, c, h)], P = new Xt(t), $ = a.width / a.height, F = [], B = [], Y = Math.min(c, h);
  let et = 0;
  const U = (E, G, Z, Q, z, pt, xt, rt) => {
    const dt = Gt(G, c, h, Z, Q, z, pt, P);
    for (const I of dt) {
      const j = et++, ht = z / Y * P.between(0.92, 1.08);
      for (let A = 1; A < I.points.length; A++) {
        const T = I.points[A - 1], X = I.points[A];
        F.push({
          start: gt(T[0] / c, T[1] / h, $, i, e),
          end: gt(X[0] / c, X[1] / h, $, i, e),
          color: I.color,
          radius: ht,
          opacity: xt * P.between(0.94, 1.06),
          water: rt * P.between(0.92, 1.08),
          layer: E,
          strokeId: j
        });
      }
    }
    B.push(F.length);
  };
  s === "oil" ? (U(0, S, 9 * f, 3, 23 * v, 3, 0.68, 0), U(1, w, 6 * f, Math.round(5 - M.shapeSimplification), 15 * v, 4, 0.76, 0)) : (U(0, S, 9 * f, 3, 24 * v, 3, 0.027, 0.94), U(1, w, 6 * f, Math.round(5 - M.shapeSimplification), 15 * v, 4, 0.038, 0.78)), (s === "oil" ? [
    { data: R, field: 0, spacing: 21, radius: 8.6, length: 80, opacity: 0.8, water: 0, chance: 0.66, edgeOnly: !1 },
    { data: R, field: 0, spacing: 15, radius: 5.7, length: 58, opacity: 0.85, water: 0, chance: 0.58, edgeOnly: !1 },
    { data: L, field: 1, spacing: 10, radius: 3.3, length: 38, opacity: 0.9, water: 0, chance: 0.48, edgeOnly: !1 },
    { data: p, field: 2, spacing: 7, radius: 1.48, length: 16, opacity: 0.94, water: 0, chance: 0.98, edgeOnly: !0 }
  ] : [
    { data: R, field: 0, spacing: 20, radius: 8, length: 74, opacity: 0.052, water: 0.55, chance: 0.68, edgeOnly: !1 },
    { data: R, field: 0, spacing: 14, radius: 5.1, length: 52, opacity: 0.058, water: 0.43, chance: 0.6, edgeOnly: !1 },
    { data: L, field: 1, spacing: 9, radius: 2.8, length: 32, opacity: 0.063, water: 0.29, chance: 0.5, edgeOnly: !1 },
    { data: p, field: 2, spacing: 7, radius: 1.08, length: 13, opacity: 0.064, water: 0.14, chance: 0.98, edgeOnly: !0 }
  ]).forEach((E, G) => {
    const Z = G + 2, Q = [], z = E.spacing * f, pt = E.radius * v, xt = E.length * x, rt = P.between(0, z), dt = /* @__PURE__ */ new Set();
    if (E.edgeOnly) {
      const I = [];
      for (let A = 0, T = rt; T < h; A++, T += z) for (let X = 0, N = rt; N < c; X++, N += z) {
        const J = Math.max(1, Math.min(c - 2, Math.round(N))), _ = Math.max(1, Math.min(h - 2, Math.round(T))), ut = W[E.field], nt = Math.hypot(ut.gx[_ * c + J], ut.gy[_ * c + J]), lt = Math.max(0, Math.min(1, b[_ * c + J]));
        nt > 0.08 && lt > 0.25 + M.detailPrecision * 0.22 && I.push({ key: A * 1e5 + X, score: Math.pow(lt, 2 + M.detailPrecision * 4) * (0.22 + Math.min(0.8, nt)) });
      }
      I.sort((A, T) => T.score - A.score);
      const j = s === "oil" ? 36 : 44, ht = Math.round(j * (0.25 + M.detailBudget * 1.8) * m);
      I.slice(0, ht).forEach((A) => dt.add(A.key));
    }
    for (let I = 0, j = rt; j < h; I++, j += z) for (let ht = 0, A = rt; A < c; ht++, A += z) {
      if (E.edgeOnly && !dt.has(I * 1e5 + ht)) continue;
      const T = A + P.between(-z * 0.46, z * 0.46), X = j + P.between(-z * 0.46, z * 0.46), N = Math.max(1, Math.min(c - 2, Math.round(T))), J = Math.max(1, Math.min(h - 2, Math.round(X))), _ = Math.max(0, Math.min(1, b[J * c + N])), ut = G < 2 ? 0.7 + _ * 0.32 : G === 2 ? 0.58 + _ * 0.5 : 0.15 + _ * 1.35;
      if (P.next() > Math.min(1, E.chance * u * ut)) continue;
      const nt = W[E.field], lt = Math.hypot(nt.gx[J * c + N], nt.gy[J * c + N]);
      if (E.edgeOnly && (lt < 0.15 || P.next() > Math.min(1, lt * 2.1)) || s === "oil" && nt.luma[J * c + N] > 0.76 && lt < 0.07 && Z < 5) continue;
      let V = -nt.gy[J * c + N], K = nt.gx[J * c + N];
      const bt = Math.hypot(V, K);
      if (bt < 0.015) {
        const C = s === "oil" ? 0.1 + Math.sin(T * 0.018 + t) * 0.2 + Math.cos(X * 0.016 - t * 0.7) * 0.16 : P.next() * Math.PI;
        V = Math.cos(C), K = Math.sin(C);
      } else
        V /= bt, K /= bt;
      if (s === "oil") {
        const C = [0.08, -0.38, 0.1, -0.18, 0.22, 0, 0], tt = [0.76, 0.56, 0.48, 0.38, 0.24, 0.08, 0], H = tt[Z], it = C[Z];
        V = V * (1 - H) + Math.cos(it) * H, K = K * (1 - H) + Math.sin(it) * H;
        const ct = Math.max(1e-3, Math.hypot(V, K));
        V /= ct, K /= ct;
      }
      const St = G >= 3 ? 1.16 - _ * 0.38 : 1, Ot = xt * St * P.between(s === "oil" ? 0.84 : 0.72, s === "oil" ? 1.18 : 1.28), vt = Z >= 5 ? 2 : s === "oil" ? 6 : 5, ot = [], mt = Wt(E.data, c, h, T, X), Lt = [0.3, 0.26, 0.2, 0.14, 0.1][G] * (1.3 - M.boundaryFidelity * 0.55), Et = (C) => {
        let tt = 0, H = 0;
        for (let it = 3; it <= Ot * 0.5; it += 3) {
          const ct = T + V * it * C, Pt = X + K * it * C;
          if (ct < 1 || ct >= c - 1 || Pt < 1 || Pt >= h - 1) break;
          const Ct = Wt(E.data, c, h, ct, Pt);
          if (Math.hypot(Ct[0] - mt[0], Ct[1] - mt[1], Ct[2] - mt[2]) > Lt) {
            if (++H >= 2) break;
          } else
            tt = it, H = 0;
        }
        return tt;
      }, ft = Et(-1), wt = Et(1);
      if (ft + wt < Math.max(E.radius * 2.4, Ot * 0.28)) continue;
      const It = (s === "oil" ? 0.055 : 0.12) * (0.35 + M.strokeCurvature * 1.9), Tt = P.between(-It, It);
      for (let C = 0; C <= vt; C++) {
        const tt = -ft + (ft + wt) * C / vt, H = Math.sin(C / vt * Math.PI) * Tt * (ft + wt);
        ot.push([T + V * tt - K * H, X + K * tt + V * H]);
      }
      const Mt = pt * St * (s === "oil" ? 3.2 : 1.45);
      if (ot.some((C) => C[0] < Mt || C[0] > c - Mt || C[1] < Mt || C[1] > h - Mt)) continue;
      const Dt = E.edgeOnly ? mt.map((C) => C * 0.8) : mt, Rt = [], qt = et++;
      for (let C = 1; C < ot.length; C++) {
        const tt = gt(ot[C - 1][0] / c, ot[C - 1][1] / h, $, i, e), H = gt(ot[C][0] / c, ot[C][1] / h, $, i, e);
        Rt.push({ start: tt, end: H, color: Dt, radius: pt * St / Y * P.between(0.88, 1.12), opacity: E.opacity * (0.88 + _ * 0.18) * P.between(0.9, 1.1), water: E.water * P.between(0.85, 1.15), layer: Z, strokeId: qt });
      }
      Q.push(Rt);
    }
    for (let I = Q.length - 1; I > 0; I--) {
      const j = Math.floor(P.next() * (I + 1));
      [Q[I], Q[j]] = [Q[j], Q[I]];
    }
    Q.forEach((I) => F.push(...I)), B.push(F.length);
  });
  const q = gt(0, 0, $, i, e), at = gt(1, 1, $, i, e);
  return { segments: F, sourceAspect: $, layerEnds: B, bounds: [Math.min(q[0], at[0]), Math.min(q[1], at[1]), Math.max(q[0], at[0]), Math.max(q[1], at[1])] };
}
const Nt = {
  mode: "watercolor",
  duration: 12,
  paperColor: "#f3eadb",
  paperRoughness: 0.78,
  edgeDarkening: 0.68,
  granulation: 0.72,
  bloom: 0.72,
  transparency: 0.12,
  washes: 4,
  speed: 1,
  pixelRatio: 1,
  renderQuality: "fast",
  analysisResolution: 360,
  strokesPerFrame: 24,
  strokeDuration: 0.16,
  strokeEase: [0.22, 1, 0.36, 1],
  detailFocus: "auto",
  imageFit: "contain",
  strokeEconomy: 0.72,
  shapeSimplification: 0.62,
  strokeLength: 0.58,
  strokeWidth: 0.58,
  boundaryFidelity: 0.72,
  detailBudget: 0.42,
  detailPrecision: 0.78,
  detailDelay: 0.82,
  strokeCurvature: 0.34,
  paintLoad: 0.7,
  dryBrush: 0.2,
  bristleStrength: 0.58,
  gloss: 0.48
}, O = (d, t = 0, i = 1) => Math.min(i, Math.max(t, d)), Bt = () => Math.random() * 1e4, Jt = (d, [t, i, n, e]) => {
  const s = (a, g, c) => 3 * (1 - a) * (1 - a) * a * g + 3 * (1 - a) * a * a * c + a * a * a, l = (a, g, c) => 3 * (1 - a) * (1 - a) * g + 6 * (1 - a) * a * (c - g) + 3 * a * a * (1 - c), o = O(d);
  let r = o;
  for (let a = 0; a < 5; a++) {
    const g = l(r, t, n);
    if (Math.abs(g) < 1e-5) break;
    r = O(r - (s(r, t, n) - o) / g);
  }
  return O(s(r, i, e));
};
class At {
  constructor(t) {
    this.state = t, this.state = t * 1000003 | 0 || 1;
  }
  state;
  next() {
    let t = this.state;
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, this.state = t | 0, (t >>> 0) / 4294967296;
  }
}
class _t {
  constructor(t, i = {}) {
    this.canvas = t;
    const n = t.getContext("2d", { alpha: !1 });
    if (!n) throw new Error("watercolor-timelapse requires a 2D canvas context.");
    this.context = n, this.options = { ...Nt, ...i }, this.seed = i.seed ?? Bt(), this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(t), this.resize();
  }
  canvas;
  context;
  pigment = document.createElement("canvas");
  pigmentContext = this.pigment.getContext("2d");
  livePaint = document.createElement("canvas");
  livePaintContext = this.livePaint.getContext("2d");
  paper = document.createElement("canvas");
  paperContext = this.paper.getContext("2d");
  options;
  source;
  plan;
  timeline;
  resizeObserver;
  progressState = { progress: 0 };
  seed;
  drawnSegments = 0;
  phase = "complete";
  destroyed = !1;
  width = 1;
  height = 1;
  wetMarks = [];
  completionFrame = 0;
  timelineFinished = !1;
  scrubFrame = 0;
  scrubTarget = 0;
  checkpoints = [];
  cpuPaintMs = 0;
  async setImage(t) {
    this.source = t, this.timeline?.kill(), this.cancelCompletion(), this.cancelScrub(), this.progressState.progress = 0, this.setPhase("analyzing"), this.plan = await jt(t, this.seed, this.canvasAspect(), this.options.analysisResolution, this.options.imageFit, this.options.mode, this.options.detailFocus, this.options.detailMap, {
      strokeEconomy: this.options.strokeEconomy,
      shapeSimplification: this.options.shapeSimplification,
      strokeLength: this.options.strokeLength,
      strokeWidth: this.options.strokeWidth,
      boundaryFidelity: this.options.boundaryFidelity,
      detailBudget: this.options.detailBudget,
      detailPrecision: this.options.detailPrecision,
      strokeCurvature: this.options.strokeCurvature
    }), !this.destroyed && (this.canvas.dataset.watercolorSegments = String(this.plan.segments.length), this.clearCheckpoints(), this.resetPainting(), this.setPhase("painting"));
  }
  play() {
    if (!this.plan || this.timeline?.isActive()) return;
    if (this.progressState.progress >= 1) {
      this.restart();
      return;
    }
    this.timeline?.kill(), this.cancelCompletion(), this.cancelScrub();
    const t = 1 - this.progressState.progress;
    this.timeline = zt.to(this.progressState, {
      progress: 1,
      duration: this.options.duration * t,
      ease: "none",
      onUpdate: () => this.updatePainting(),
      onComplete: () => {
        this.timelineFinished = !0, this.scheduleCompletion();
      }
    }), this.timeline.timeScale(this.options.speed);
  }
  pause() {
    this.timeline?.pause();
  }
  restart(t = Bt()) {
    this.timeline?.kill(), this.cancelCompletion(), this.cancelScrub(), this.seed = t, this.progressState.progress = 0, this.source && this.setImage(this.source).then(() => this.play());
  }
  seek(t) {
    this.timeline?.kill(), this.cancelCompletion(), this.progressState.progress = O(t), this.scrubTarget = this.targetSegment(this.progressState.progress), this.scheduleScrub(), this.options.onProgress?.(this.progressState.progress);
  }
  setOptions(t) {
    const i = t.mode !== void 0 && t.mode !== this.options.mode, n = t.detailFocus !== void 0 && t.detailFocus !== this.options.detailFocus || t.detailMap !== void 0 && t.detailMap !== this.options.detailMap, e = i || n || ["strokeEconomy", "shapeSimplification", "strokeLength", "strokeWidth", "boundaryFidelity", "detailBudget", "detailPrecision", "strokeCurvature"].some((r) => t[r] !== void 0), s = t.paperColor !== void 0 || t.paperRoughness !== void 0 || t.granulation !== void 0 || t.bloom !== void 0 || t.transparency !== void 0 || t.paintLoad !== void 0 || t.dryBrush !== void 0 || t.bristleStrength !== void 0 || t.gloss !== void 0 || t.renderQuality !== void 0, l = this.progressState.progress, o = !!this.timeline?.isActive();
    if (Object.assign(this.options, t), t.seed !== void 0) {
      this.restart(t.seed);
      return;
    }
    if (e && this.source) {
      this.setImage(this.source).then(() => {
        this.seek(l), o && this.play();
      });
      return;
    }
    if (t.pixelRatio !== void 0) {
      this.resize();
      return;
    }
    s ? (this.createPaper(), this.rebuildToAsync(this.targetSegment(this.progressState.progress))) : this.compose();
  }
  capture(t = "image/png", i = 0.92) {
    return this.canvas.toDataURL(t, i);
  }
  updatePainting() {
    const t = this.targetSegment(this.progressState.progress);
    t > this.drawnSegments && this.depositBudget(t, !0), this.advanceWetMarks(), this.compose(), this.setPhase(this.progressState.progress > 0.94 ? "drying" : "painting"), this.options.onProgress?.(this.progressState.progress);
  }
  targetSegment(t) {
    if (!this.plan) return 0;
    const i = 0.94, n = O(t / i), e = 0.8 + O(this.options.detailDelay) * 0.18, s = [0, 0.26, 0.47, 0.65, 0.79, e, 1], l = this.plan.layerEnds;
    for (let o = 0; o < l.length; o++)
      if (n <= s[o + 1]) {
        const r = o === 0 ? 0 : l[o - 1], a = (n - s[o]) / (s[o + 1] - s[o]);
        return r + (l[o] - r) * O(a);
      }
    return this.plan.segments.length;
  }
  strokeEnd(t) {
    if (!this.plan || t >= this.plan.segments.length) return t;
    const i = this.plan.segments[t].strokeId;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === i; ) t++;
    return t;
  }
  partialStroke(t, i) {
    const n = O(i) * t.length, e = Math.floor(n), s = n - e, l = t.slice(0, e);
    if (s > 0 && e < t.length) {
      const o = t[e];
      l.push({ ...o, end: [o.start[0] + (o.end[0] - o.start[0]) * s, o.start[1] + (o.end[1] - o.start[1]) * s] });
    }
    return l;
  }
  strokeRevealSpan(t) {
    if (!this.plan) return t;
    const i = this.plan.segments.length / Math.max(0.1, this.options.duration * 0.94) * Math.max(0.1, this.options.speed);
    return Math.max(t, i * Math.max(0.025, this.options.strokeDuration));
  }
  paintNextStroke(t, i = !1, n = this.pigmentContext, e = 1) {
    if (!this.plan) return t;
    const s = this.plan.segments[t].strokeId, l = t;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === s; ) t++;
    const o = this.plan.segments.slice(l, t), r = e >= 1 ? o : this.partialStroke(o, e);
    return this.options.mode === "oil" ? this.paintOilStroke(r, s, n) : (this.paintWatercolorStroke(r, s, 0, n), e >= 1 && n === this.pigmentContext && i && s % 3 === 0 && this.wetMarks.push({ segments: o, strokeId: s, age: 0 })), t;
  }
  renderLiveStrokes(t) {
    if (this.livePaintContext.clearRect(0, 0, this.width, this.height), !this.plan) return;
    let i = this.drawnSegments, n = 0, e = 0, s = 0;
    const l = Math.max(4, Math.min(18, Math.round(this.options.strokesPerFrame * 0.65)));
    for (; i < this.plan.segments.length && n < l && e < 64; ) {
      const o = this.strokeEnd(i), r = this.strokeRevealSpan(o - i), a = (t - (o - r)) / r;
      if (a > 0) {
        const g = Jt(O(a), this.options.strokeEase);
        s = g, this.paintNextStroke(i, !1, this.livePaintContext, g), n++;
      }
      i = o, e++;
    }
    this.canvas.dataset.watercolorActiveStrokes = String(n), this.canvas.dataset.watercolorStrokeProgress = s.toFixed(3);
  }
  depositBudget(t, i = !1, n = this.options.mode === "oil" ? 7 : 8) {
    const e = performance.now(), s = Math.max(1, Math.round(this.options.strokesPerFrame));
    let l = 0, o = this.drawnSegments;
    for (; this.plan && o < this.plan.segments.length && this.strokeEnd(o) <= t && l < s && (l === 0 || performance.now() - e < n); )
      o = this.paintNextStroke(o, i), l++;
    return this.drawnSegments = o, this.renderLiveStrokes(t), i || this.maybeCheckpoint(), this.cpuPaintMs += performance.now() - e, this.plan && o >= this.plan.segments.length && (this.canvas.dataset.watercolorCpuMs = this.cpuPaintMs.toFixed(1)), !this.plan || o >= this.plan.segments.length || this.strokeEnd(o) > t;
  }
  cancelCompletion() {
    this.timelineFinished = !1, this.completionFrame && (cancelAnimationFrame(this.completionFrame), this.completionFrame = 0);
  }
  cancelScrub() {
    this.scrubFrame && (cancelAnimationFrame(this.scrubFrame), this.scrubFrame = 0);
  }
  scheduleScrub() {
    this.scrubFrame || (this.scrubFrame = requestAnimationFrame(() => {
      if (this.scrubFrame = 0, this.destroyed || !this.plan) return;
      this.drawnSegments > this.scrubTarget && !this.restoreCheckpoint(this.scrubTarget) && this.resetPainting();
      const t = this.depositBudget(this.scrubTarget, !1);
      this.compose(), t || this.scheduleScrub();
    }));
  }
  scheduleCompletion() {
    this.completionFrame || !this.timelineFinished || (this.completionFrame = requestAnimationFrame(() => {
      if (this.completionFrame = 0, !(this.destroyed || !this.timelineFinished || !this.plan)) {
        if (this.drawnSegments < this.plan.segments.length && this.depositBudget(this.plan.segments.length, !0), this.advanceWetMarks(), this.compose(), this.drawnSegments < this.plan.segments.length || this.wetMarks.length) {
          this.scheduleCompletion();
          return;
        }
        this.timelineFinished = !1, this.setPhase("complete"), this.options.onComplete?.();
      }
    }));
  }
  paintOilStroke(t, i, n = this.pigmentContext) {
    if (!t.length) return;
    const e = new At(this.seed + i * 31.77), s = t[0], l = this.qualityFactor(), o = [s.start, ...t.map((S) => S.end)].map((S) => [S[0] * this.width, S[1] * this.height]);
    let r = this.smoothPath(o, 5);
    const a = e.next();
    let g = "loaded";
    const c = O(this.options.dryBrush);
    if (s.layer >= 6 ? g = a < 0.45 + c * 0.4 ? "tap" : "dry" : s.layer === 5 ? g = a < 0.12 + c * 0.42 ? "tap" : a < 0.24 + c * 0.52 ? "dry" : "loaded" : (s.layer === 4 && a < 0.05 + c * 0.35 || a < 0.02 + c * 0.25) && (g = "dry"), g === "tap") {
      const S = Math.floor(r.length * 0.34), w = Math.ceil(r.length * 0.66);
      r = r.slice(S, w);
    }
    const h = Math.max(0.7, s.radius * this.height), k = s.color.map((S) => Math.round(O(S) * 255)), y = this.mixProfile(r, k), p = this.averageColors(y), M = O(s.opacity) * (0.55 + this.options.paintLoad * 0.65) * (g === "dry" ? 0.62 : 1), f = 0.45 + this.options.granulation * 0.85, u = p.map((S) => Math.round(S * 0.55)), m = p.map((S) => Math.round(S + (255 - S) * 0.42));
    if (n.save(), n.lineCap = "round", n.lineJoin = "round", this.plan) {
      const [S, w, R, L] = this.plan.bounds;
      n.beginPath(), n.rect(S * this.width, w * this.height, (R - S) * this.width, (L - w) * this.height), n.clip();
    }
    n.globalCompositeOperation = "source-over", n.fillStyle = `rgba(${u[0]},${u[1]},${u[2]},${0.1 * M * f})`, n.filter = l < 0.5 ? "none" : `blur(${Math.min(2.2, h * 0.055)}px)`, this.fillOilBody(n, this.offsetPath(r, h * 0.14 * f, h * 0.16 * f), h * (1 + 0.07 * f), g, e.next() * 9), n.fill(), n.filter = "none";
    const x = this.oilGradient(n, r, y, 0.36 * M);
    n.fillStyle = x, n.filter = l < 0.5 ? "none" : `blur(${Math.min(1.35, h * 0.035)}px)`, this.fillOilBody(n, r, h * 1.035, g, e.next() * 9), n.fill(), n.filter = "none", n.fillStyle = this.oilGradient(n, r, y, (g === "dry" ? 0.58 : 0.9) * M), this.fillOilBody(n, r, h * 0.92, g, e.next() * 9), n.fill();
    const v = O(this.options.bristleStrength), b = Math.max(2, Math.min(g === "dry" ? 18 : 14, Math.round(h * (g === "dry" ? 0.82 : 0.52) * (0.25 + v) * l)));
    for (let S = 0; S < b; S++) {
      const w = (S / (b - 1) - 0.5) * h * 1.72 + (e.next() - 0.5) * h * 0.1;
      if (g === "dry" && e.next() < 0.28) continue;
      const R = y[Math.min(y.length - 1, Math.floor(e.next() * y.length))], L = (S / (b - 1) - 0.5) * 0.16 + (e.next() - 0.5) * 0.06, W = R.map((P) => Math.round(O(P / 255 + L) * 255));
      n.strokeStyle = `rgba(${W[0]},${W[1]},${W[2]},${(0.06 + e.next() * 0.22) * v})`, n.lineWidth = Math.max(0.3, h * (0.022 + e.next() * 0.052)), this.strokePath(n, this.offsetPath(r, w, 0)), n.stroke();
    }
    n.globalCompositeOperation = "screen", n.strokeStyle = `rgba(${m[0]},${m[1]},${m[2]},${0.28 * M * f * this.options.gloss})`, n.lineWidth = Math.max(0.45, h * 0.13 * f), this.strokePath(n, this.offsetPath(r, -h * 0.58 * f, -h * 0.05 * f)), n.stroke(), n.globalCompositeOperation = "multiply", n.strokeStyle = `rgba(${u[0]},${u[1]},${u[2]},${0.12 * M * f})`, n.lineWidth = Math.max(0.4, h * 0.1 * f), this.strokePath(n, this.offsetPath(r, h * 0.62 * f, h * 0.04 * f)), n.stroke(), this.paintOilSurface(n, r, h, y, e, f, M), n.globalCompositeOperation = "source-over", g === "loaded" && e.next() < 0.12 + this.options.paintLoad * 0.34 && this.paintOilTrails(n, r, h, p, e, M), n.restore();
  }
  mixProfile(t, i) {
    return (this.options.renderQuality === "fast" ? [0, 0.5, 1] : this.options.renderQuality === "balanced" ? [0, 0.33, 0.67, 1] : [0, 0.25, 0.5, 0.75, 1]).map((e) => {
      const s = Math.min(t.length - 1, Math.round((t.length - 1) * e)), l = t[s], o = this.pigmentContext.getImageData(O(Math.round(l[0]), 0, this.width - 1), O(Math.round(l[1]), 0, this.height - 1), 1, 1).data;
      if (o[3] <= 18) return i;
      const r = O(o[3] / 255 * (0.12 + this.options.bloom * 0.4), 0.06, 0.46);
      return i.map((a, g) => Math.round(Math.exp(Math.log(Math.max(1, a)) * (1 - r) + Math.log(Math.max(1, o[g])) * r)));
    });
  }
  averageColors(t) {
    return [0, 1, 2].map((i) => Math.round(t.reduce((n, e) => n + e[i], 0) / t.length));
  }
  oilGradient(t, i, n, e) {
    const s = i[0], l = i[i.length - 1], o = t.createLinearGradient(s[0], s[1], l[0], l[1]);
    return n.forEach((r, a) => o.addColorStop(a / (n.length - 1), `rgba(${r[0]},${r[1]},${r[2]},${e})`)), o;
  }
  paintOilTrails(t, i, n, e, s, l) {
    if (i.length < 2) return;
    const o = i[i.length - 1], r = i[i.length - 2], a = o[0] - r[0], g = o[1] - r[1], c = Math.max(1, Math.hypot(a, g)), h = a / c, k = g / c, y = -k, p = h, M = s.next() < 0.7 ? 1 : 2;
    for (let f = 0; f < M; f++) {
      const u = f === 0 ? -1 : 1, m = u * n * (0.65 + s.next() * 0.24), x = n * (0.45 + s.next() * 0.85);
      t.strokeStyle = `rgba(${e[0]},${e[1]},${e[2]},${l * (0.2 + s.next() * 0.22)})`, t.lineWidth = Math.max(0.35, n * (0.045 + s.next() * 0.08)), this.strokePath(t, [[r[0] + y * m, r[1] + p * m], [o[0] + y * m, o[1] + p * m], [o[0] + y * m + h * x, o[1] + p * m + k * x]]), t.stroke();
    }
  }
  offsetPath(t, i, n) {
    return t.map((e, s) => {
      const l = t[Math.max(0, s - 1)], o = t[Math.min(t.length - 1, s + 1)], r = o[0] - l[0], a = o[1] - l[1], g = Math.max(1, Math.hypot(r, a));
      return [e[0] - a / g * i, e[1] + r / g * i + n];
    });
  }
  smoothPath(t, i) {
    if (t.length < 3) return t;
    const n = [];
    for (let e = 0; e < t.length - 1; e++) {
      const s = t[Math.max(0, e - 1)], l = t[e], o = t[e + 1], r = t[Math.min(t.length - 1, e + 2)];
      for (let a = 0; a < i; a++) {
        const g = a / i, c = g * g, h = c * g;
        n.push([
          0.5 * (2 * l[0] + (-s[0] + o[0]) * g + (2 * s[0] - 5 * l[0] + 4 * o[0] - r[0]) * c + (-s[0] + 3 * l[0] - 3 * o[0] + r[0]) * h),
          0.5 * (2 * l[1] + (-s[1] + o[1]) * g + (2 * s[1] - 5 * l[1] + 4 * o[1] - r[1]) * c + (-s[1] + 3 * l[1] - 3 * o[1] + r[1]) * h)
        ]);
      }
    }
    return n.push(t[t.length - 1]), n;
  }
  strokePath(t, i) {
    if (!(i.length < 2)) {
      t.beginPath(), t.moveTo(i[0][0], i[0][1]);
      for (let n = 1; n < i.length - 1; n++) {
        const e = [(i[n][0] + i[n + 1][0]) * 0.5, (i[n][1] + i[n + 1][1]) * 0.5];
        t.quadraticCurveTo(i[n][0], i[n][1], e[0], e[1]);
      }
      t.lineTo(i[i.length - 1][0], i[i.length - 1][1]);
    }
  }
  fillOilBody(t, i, n, e, s) {
    if (i.length < 2) return;
    const l = [], o = [];
    i.forEach((r, a) => {
      const g = i[Math.max(0, a - 1)], c = i[Math.min(i.length - 1, a + 1)], h = c[0] - g[0], k = c[1] - g[1], y = Math.max(1, Math.hypot(h, k)), p = a / (i.length - 1), M = Math.pow(Math.max(0, Math.sin(Math.PI * p)), e === "tap" ? 0.25 : 0.48), f = e === "dry" ? 0.12 : e === "tap" ? 0.3 : 0.24, u = (f + (1 - f) * M) * (1 + 0.065 * Math.sin(p * Math.PI * 5 + s) + 0.035 * Math.sin(p * Math.PI * 11 - s * 0.7)), m = -k / y * n * u, x = h / y * n * u;
      l.push([r[0] + m, r[1] + x]), o.push([r[0] - m, r[1] - x]);
    }), t.beginPath(), t.moveTo(l[0][0], l[0][1]);
    for (let r = 1; r < l.length; r++) t.lineTo(l[r][0], l[r][1]);
    for (let r = o.length - 1; r >= 0; r--) t.lineTo(o[r][0], o[r][1]);
    t.closePath();
  }
  paintOilSurface(t, i, n, e, s, l, o) {
    const r = this.qualityFactor(), a = Math.max(2, Math.min(30, Math.round(n * 0.48 * r)));
    t.globalCompositeOperation = "multiply";
    for (let g = 0; g < a; g++) {
      const c = Math.min(i.length - 2, Math.floor(s.next() * (i.length - 1))), h = i[c], k = i[c + 1], y = Math.atan2(k[1] - h[1], k[0] - h[0]), p = e[Math.floor(s.next() * e.length)];
      t.save(), t.translate(h[0] + (s.next() - 0.5) * n, h[1] + (s.next() - 0.5) * n), t.rotate(y), t.fillStyle = `rgba(${Math.round(p[0] * 0.62)},${Math.round(p[1] * 0.62)},${Math.round(p[2] * 0.62)},${0.025 * l * o})`, t.beginPath(), t.ellipse(0, 0, Math.max(0.4, n * (0.04 + s.next() * 0.12)), Math.max(0.3, n * (0.025 + s.next() * 0.06)), 0, 0, Math.PI * 2), t.fill(), t.restore();
    }
    t.globalCompositeOperation = "screen";
    for (let g = 0; g < Math.ceil(a * (0.1 + this.options.gloss * 0.55)); g++) {
      const c = Math.min(i.length - 2, Math.floor(s.next() * (i.length - 1))), h = i[c], k = i[c + 1], y = k[0] - h[0], p = k[1] - h[1], M = Math.max(1, Math.hypot(y, p)), f = -p / M, u = y / M, m = e[Math.floor(s.next() * e.length)], x = -n * (0.15 + s.next() * 0.45);
      t.strokeStyle = `rgba(${Math.round(m[0] + (255 - m[0]) * 0.72)},${Math.round(m[1] + (255 - m[1]) * 0.72)},${Math.round(m[2] + (255 - m[2]) * 0.72)},${0.085 * l * o * this.options.gloss})`, t.lineWidth = Math.max(0.35, n * 0.035), t.beginPath(), t.moveTo(h[0] + f * x, h[1] + u * x), t.lineTo(h[0] + f * x + y * 0.65, h[1] + u * x + p * 0.65), t.stroke();
    }
  }
  paintWatercolorStroke(t, i, n = 0, e = this.pigmentContext) {
    if (!t.length) return;
    const s = t[0], l = new At(this.seed + i * 19.41 + n * 997), o = this.qualityFactor(), r = [s.start, ...t.map((u) => u.end)].map((u) => this.flowPoint(u, s.radius, l)), a = this.smoothPath(r, 4), g = Math.max(0.45, s.radius * this.height), c = s.color.map((u) => Math.round(O(u) * 255)), h = s.opacity * (1 - this.options.transparency * 0.55) * (0.55 + this.options.paintLoad * 0.7), k = 1 + n * this.options.bloom * 0.34;
    if (e.save(), this.plan) {
      const [u, m, x, v] = this.plan.bounds;
      e.beginPath(), e.rect(u * this.width, m * this.height, (x - u) * this.width, (v - m) * this.height), e.clip();
    }
    const y = 0.92 - this.options.edgeDarkening * 0.2;
    e.fillStyle = `rgba(${Math.round(c[0] * y)},${Math.round(c[1] * y)},${Math.round(c[2] * y)},${h * (0.2 + this.options.edgeDarkening * 0.16 + n * 0.05)})`, e.filter = o < 0.5 ? "none" : `blur(${Math.min(3.2, g * 0.12)}px)`, this.fillOilBody(e, a, g * 1.2 * k, "loaded", l.next() * 8), e.fill(), e.filter = "none", e.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${h * 3.05})`, this.fillOilBody(e, a, g * 0.86, "loaded", l.next() * 8), e.fill();
    const p = O(this.options.bristleStrength), M = Math.max(1, Math.min(10, Math.round(g * 0.42 * (0.3 + p) * o)));
    for (let u = 0; u < M; u++) {
      if (l.next() < 0.18) continue;
      const m = (u / Math.max(1, M - 1) - 0.5) * g * 1.5 + (l.next() - 0.5) * g * 0.12;
      e.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${h * (0.2 + l.next() * 0.6) * p})`, e.lineWidth = Math.max(0.28, g * (0.025 + l.next() * 0.07)), this.strokePath(e, this.offsetPath(a, m, 0)), e.stroke();
    }
    const f = Math.max(1, Math.min(9, Math.round(a.length * 0.24 * o)));
    for (let u = 0; u < f; u++) {
      const m = Math.min(a.length - 2, Math.floor(l.next() * (a.length - 1))), x = a[m], v = a[m + 1], b = v[0] - x[0], S = v[1] - x[1], w = Math.max(1, Math.hypot(b, S)), R = -S / w, L = b / w, W = (l.next() - 0.5) * g * 1.35;
      this.paperHeight(x[0], x[1]) < 0.5 && (e.fillStyle = `rgba(${Math.round(c[0] * 0.64)},${Math.round(c[1] * 0.64)},${Math.round(c[2] * 0.64)},${h * (0.18 + l.next() * 0.25)})`, e.beginPath(), e.arc(x[0] + R * W, x[1] + L * W, Math.max(0.3, g * (0.025 + l.next() * 0.07)), 0, Math.PI * 2), e.fill());
    }
    e.globalCompositeOperation = "destination-out", e.fillStyle = `rgba(0,0,0,${0.02 + 0.035 * this.options.paperRoughness})`;
    for (let u = 0; u < Math.min(6, f); u++) {
      const m = a[Math.floor(l.next() * a.length)];
      this.paperHeight(m[0], m[1]) > 0.56 && (e.beginPath(), e.arc(m[0] + (l.next() - 0.5) * g, m[1] + (l.next() - 0.5) * g, Math.max(0.25, g * (0.018 + l.next() * 0.045)), 0, Math.PI * 2), e.fill());
    }
    e.restore();
  }
  flowPoint(t, i, n) {
    const e = t[0] * this.width, s = t[1] * this.height, l = 2, o = this.paperHeight(e + l, s) - this.paperHeight(e - l, s), r = this.paperHeight(e, s + l) - this.paperHeight(e, s - l), a = this.options.bloom * i * this.height * 1.8;
    return [e - o * a + (n.next() - 0.5) * a * 0.08, s - r * a + (n.next() - 0.5) * a * 0.08];
  }
  paperHeight(t, i) {
    const n = this.seed * 0.013;
    return 0.5 + 0.22 * Math.sin(t * 0.021 + n) * Math.sin(i * 0.027 - n * 0.7) + 0.16 * Math.sin(t * 0.083 + i * 0.017 + n * 2.1) + 0.1 * Math.cos(i * 0.14 - t * 0.031 - n);
  }
  advanceWetMarks() {
    const t = [];
    for (const i of this.wetMarks)
      i.age++, (i.age === 2 || i.age === 5) && this.paintWatercolorStroke(i.segments, i.strokeId, i.age / 5), i.age < 6 && t.push(i);
    this.wetMarks = t;
  }
  compose() {
    this.context.save(), this.context.globalCompositeOperation = "source-over", this.context.drawImage(this.paper, 0, 0), this.context.globalCompositeOperation = this.options.mode === "oil" ? "source-over" : "multiply", this.context.globalAlpha = this.options.mode === "oil" ? 1 : 0.96, this.context.drawImage(this.pigment, 0, 0), this.context.drawImage(this.livePaint, 0, 0), this.context.restore();
  }
  createPaper() {
    this.paper.width = this.width, this.paper.height = this.height;
    const t = this.hex(this.options.paperColor), i = this.paperContext.createImageData(this.width, this.height), n = i.data;
    for (let e = 0; e < this.height; e++) for (let s = 0; s < this.width; s++) {
      const l = (e * this.width + s) * 4, o = this.paperHeight(s, e) - 0.5, r = Math.sin(e * 0.72 + s * 0.035 + this.seed) * 0.5, a = (o * 0.085 + r * 0.012) * this.options.paperRoughness;
      n[l] = O(t[0] / 255 + a) * 255, n[l + 1] = O(t[1] / 255 + a) * 255, n[l + 2] = O(t[2] / 255 + a) * 255, n[l + 3] = 255;
    }
    this.paperContext.putImageData(i, 0, 0), this.compose();
  }
  qualityFactor() {
    return this.options.renderQuality === "fast" ? 0.38 : this.options.renderQuality === "balanced" ? 0.68 : 1;
  }
  clearCheckpoints() {
    this.checkpoints = [];
  }
  maybeCheckpoint() {
    if (!this.plan || this.drawnSegments >= this.plan.segments.length) return;
    const t = Math.max(1, Math.ceil(this.plan.segments.length / 6)), i = this.checkpoints[this.checkpoints.length - 1];
    if (this.drawnSegments - (i?.segment ?? 0) < t) return;
    const n = document.createElement("canvas");
    n.width = this.width, n.height = this.height, n.getContext("2d").drawImage(this.pigment, 0, 0), this.checkpoints.push({ segment: this.drawnSegments, surface: n });
  }
  restoreCheckpoint(t) {
    for (let i = this.checkpoints.length - 1; i >= 0; i--) {
      const n = this.checkpoints[i];
      if (!(n.segment > t))
        return this.pigmentContext.clearRect(0, 0, this.width, this.height), this.pigmentContext.drawImage(n.surface, 0, 0), this.drawnSegments = n.segment, this.wetMarks = [], !0;
    }
    return !1;
  }
  resetPainting() {
    this.pigmentContext.clearRect(0, 0, this.width, this.height), this.livePaintContext.clearRect(0, 0, this.width, this.height), this.drawnSegments = 0, this.wetMarks = [], this.cpuPaintMs = 0, this.canvas.dataset.watercolorCpuMs = "0", this.canvas.dataset.watercolorActiveStrokes = "0", this.canvas.dataset.watercolorStrokeProgress = "0.000", this.compose();
  }
  rebuildToAsync(t) {
    this.cancelScrub(), this.clearCheckpoints(), this.resetPainting(), this.scrubTarget = t, this.scheduleScrub();
  }
  resize() {
    const t = Math.max(1, this.canvas.clientWidth || this.canvas.width), i = Math.max(1, this.canvas.clientHeight || this.canvas.height), n = Math.min(window.devicePixelRatio || 1, this.options.pixelRatio), e = Math.min(1400, Math.round(t * n)), s = Math.min(1400, Math.round(i * n));
    e === this.width && s === this.height || (this.width = e, this.height = s, this.canvas.width = e, this.canvas.height = s, this.pigment.width = e, this.pigment.height = s, this.livePaint.width = e, this.livePaint.height = s, this.clearCheckpoints(), this.createPaper(), this.plan && this.rebuildToAsync(this.targetSegment(this.progressState.progress)));
  }
  hex(t) {
    const i = t.replace("#", ""), n = i.length === 3 ? i.split("").map((s) => s + s).join("") : i, e = parseInt(n, 16);
    return [e >> 16 & 255, e >> 8 & 255, e & 255];
  }
  canvasAspect() {
    return Math.max(1, this.canvas.clientWidth || this.canvas.width) / Math.max(1, this.canvas.clientHeight || this.canvas.height);
  }
  setPhase(t) {
    this.phase !== t && (this.phase = t, this.options.onPhaseChange?.(t));
  }
  destroy() {
    this.destroyed = !0, this.timeline?.kill(), this.cancelCompletion(), this.cancelScrub(), this.clearCheckpoints(), this.resizeObserver.disconnect(), delete this.canvas.dataset.watercolorSegments, delete this.canvas.dataset.watercolorCpuMs, delete this.canvas.dataset.watercolorActiveStrokes, delete this.canvas.dataset.watercolorStrokeProgress;
  }
}
export {
  _t as W
};
