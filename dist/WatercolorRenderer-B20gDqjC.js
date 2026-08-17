import Ht from "gsap";
const xt = (d, t = 0, e = 1) => Math.max(t, Math.min(e, d));
function zt(d, t) {
  const e = d[t], n = d[t + 1], i = d[t + 2], s = Math.max(e, n, i), h = Math.min(e, n, i), a = 128 - 0.168736 * e - 0.331264 * n + 0.5 * i, c = 128 + 0.5 * e - 0.418688 * n - 0.081312 * i;
  return e < 48 || s - h < 12 || c < 128 || c > 181 || a < 72 || a > 137 ? 0 : xt((e - n + 18) / 70) * xt((c - 128) / 24) * xt((137 - a) / 28);
}
function st(d, t, e, n, i, s, h, a) {
  const c = Math.max(0, Math.floor(n - s * 2.5)), r = Math.min(t - 1, Math.ceil(n + s * 2.5)), m = Math.max(0, Math.floor(i - h * 2.5)), o = Math.min(e - 1, Math.ceil(i + h * 2.5));
  for (let g = m; g <= o; g++) for (let y = c; y <= r; y++) {
    const x = (y - n) / s, l = (g - i) / h, M = a * Math.exp(-(x * x + l * l) * 0.5), f = g * t + y;
    d[f] = Math.max(d[f], M);
  }
}
function Ut(d, t, e) {
  const n = Math.max(2, Math.round(Math.min(t, e) / 150)), i = Math.ceil(t / n), s = Math.ceil(e / n), h = new Uint8Array(i * s), a = new Uint8Array(i * s);
  for (let u = 0; u < s; u++) for (let b = 0; b < i; b++) {
    const v = Math.min(t - 1, Math.round((b + 0.5) * n)), k = Math.min(e - 1, Math.round((u + 0.5) * n));
    h[u * i + b] = zt(d, (k * t + v) * 4) > 0.17 ? 1 : 0;
  }
  let c = [];
  for (let u = 0; u < h.length; u++) {
    if (a[u] || !h[u]) continue;
    const b = [], v = [u];
    for (a[u] = 1; v.length; ) {
      const k = v.pop(), S = k % i;
      b.push(k);
      for (const w of [k - 1, k + 1, k - i, k + i])
        w < 0 || w >= h.length || a[w] || !h[w] || Math.abs(w % i - S) > 1 || (a[w] = 1, v.push(w));
    }
    b.length > c.length && (c = b);
  }
  if (c.length < Math.max(18, h.length * 0.012)) return;
  let r = i, m = s, o = 0, g = 0;
  for (const u of c) {
    const b = u % i, v = Math.floor(u / i);
    r = Math.min(r, b), o = Math.max(o, b), m = Math.min(m, v), g = Math.max(g, v);
  }
  let y = r * n, x = Math.min(t, (o + 1) * n), l = m * n, M = Math.min(e, (g + 1) * n), f = x - y, p = M - l;
  if (p > f * 1.48 && (M = Math.min(M, l + f * 1.48)), p = M - l, !(f < t * 0.12 || p < e * 0.12))
    return y = Math.max(0, y - f * 0.13), x = Math.min(t, x + f * 0.13), l = Math.max(0, l - p * 0.18), M = Math.min(e, M + p * 0.08), { left: y, right: x, top: l, bottom: M, width: x - y, height: M - l };
}
function $t(d, t, e, n, i, s, h, a, c) {
  const r = [], m = Math.max(2, Math.round((i - n) * 0.055));
  for (let y = Math.max(m, Math.round(s)); y < Math.min(e - m, Math.round(h)); y += 2) for (let x = Math.max(m, Math.round(n)); x < Math.min(t - m, Math.round(i)); x += 2) {
    const l = (y * t + x) * 4, M = d[l] * 0.2126 + d[l + 1] * 0.7152 + d[l + 2] * 0.0722;
    let f = 0, p = 0;
    for (const [b, v] of [[-m, 0], [m, 0], [0, -m], [0, m]]) {
      const k = ((y + v) * t + x + b) * 4;
      f += d[k] * 0.2126 + d[k + 1] * 0.7152 + d[k + 2] * 0.0722, p++;
    }
    const u = f / p - M;
    u > 5 && r.push({ x, y, score: u });
  }
  r.sort((y, x) => x.score - y.score);
  const o = r.slice(0, Math.max(4, Math.ceil(r.length * 0.04)));
  if (!o.length) return { x: a, y: c };
  const g = o.reduce((y, x) => y + x.score, 0);
  return { x: o.reduce((y, x) => y + x.x * x.score, 0) / g, y: o.reduce((y, x) => y + x.y * x.score, 0) / g };
}
function Qt(d, t, e, n = "auto") {
  const i = new Float32Array(t * e);
  if (n === "uniform")
    return i.fill(1), i;
  const s = new Float32Array(t * e);
  for (let f = 0; f < s.length; f++) {
    const p = f * 4;
    s[f] = d[p] * 0.2126 + d[p + 1] * 0.7152 + d[p + 2] * 0.0722;
  }
  for (let f = 1; f < e - 1; f++) for (let p = 1; p < t - 1; p++) {
    const u = f * t + p, b = u * 4, v = Math.hypot(s[u + 1] - s[u - 1], s[u + t] - s[u - t]) / 255, k = (Math.max(d[b], d[b + 1], d[b + 2]) - Math.min(d[b], d[b + 1], d[b + 2])) / 255;
    i[u] = xt(0.08 + v * 1.45 + k * 0.1, 0, 0.48);
  }
  const h = Ut(d, t, e);
  if (!h) return i;
  const { left: a, right: c, top: r, bottom: m } = h, o = h.width, g = h.height, y = (a + c) * 0.5;
  st(i, t, e, y, r + g * 0.5, o * 0.48, g * 0.5, 0.58);
  const x = $t(d, t, e, a + o * 0.1, y - o * 0.03, r + g * 0.25, r + g * 0.53, a + o * 0.32, r + g * 0.4), l = $t(d, t, e, y + o * 0.03, c - o * 0.1, r + g * 0.25, r + g * 0.53, a + o * 0.68, r + g * 0.4);
  st(i, t, e, x.x, x.y, o * 0.105, g * 0.065, 1), st(i, t, e, l.x, l.y, o * 0.105, g * 0.065, 1), st(i, t, e, x.x, x.y - g * 0.09, o * 0.14, g * 0.045, 0.82), st(i, t, e, l.x, l.y - g * 0.09, o * 0.14, g * 0.045, 0.82), st(i, t, e, y, r + g * 0.59, o * 0.1, g * 0.16, 0.72);
  const M = $t(d, t, e, a + o * 0.25, c - o * 0.25, r + g * 0.62, r + g * 0.86, y, r + g * 0.75);
  return st(i, t, e, M.x, M.y, o * 0.18, g * 0.072, 0.96), st(i, t, e, y, r + g * 0.51, o * 0.55, g * 0.55, 0.62), i;
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
  between(t, e) {
    return t + (e - t) * this.next();
  }
};
async function Yt(d) {
  if (typeof d != "string") return d;
  const t = new Image();
  return t.crossOrigin = "anonymous", t.src = d, await t.decode(), t;
}
function Rt(d, t, e, n, i) {
  n = Math.max(0, Math.min(t - 1, Math.round(n))), i = Math.max(0, Math.min(e - 1, Math.round(i)));
  const s = (i * t + n) * 4;
  return [d[s] / 255, d[s + 1] / 255, d[s + 2] / 255];
}
function gt(d, t, e, n, i) {
  let s = 1, h = 1;
  return i === "cover" ? e > n ? s = e / n : h = n / e : e > n ? h = n / e : s = e / n, [(d - 0.5) * s + 0.5, (t - 0.5) * h + 0.5];
}
function yt(d, t, e, n) {
  if (n <= 0) return new Uint8ClampedArray(d);
  const i = new Float32Array(d.length), s = new Uint8ClampedArray(d.length), h = n * 2 + 1;
  for (let a = 0; a < e; a++) for (let c = 0; c < 4; c++) {
    let r = 0;
    for (let m = -n; m <= n; m++) r += d[(a * t + Math.max(0, Math.min(t - 1, m))) * 4 + c];
    for (let m = 0; m < t; m++)
      i[(a * t + m) * 4 + c] = r / h, r -= d[(a * t + Math.max(0, m - n)) * 4 + c], r += d[(a * t + Math.min(t - 1, m + n + 1)) * 4 + c];
  }
  for (let a = 0; a < t; a++) for (let c = 0; c < 4; c++) {
    let r = 0;
    for (let m = -n; m <= n; m++) r += i[(Math.max(0, Math.min(e - 1, m)) * t + a) * 4 + c];
    for (let m = 0; m < e; m++)
      s[(m * t + a) * 4 + c] = r / h, r -= i[(Math.max(0, m - n) * t + a) * 4 + c], r += i[(Math.min(e - 1, m + n + 1) * t + a) * 4 + c];
  }
  return s;
}
function Ft(d, t, e) {
  const n = t * e, i = new Float32Array(n), s = new Float32Array(n), h = new Float32Array(n);
  for (let a = 0; a < n; a++) {
    const c = a * 4;
    i[a] = d[c] * 8337e-7 + d[c + 1] * 2805e-6 + d[c + 2] * 283e-6;
  }
  for (let a = 1; a < e - 1; a++) for (let c = 1; c < t - 1; c++) {
    const r = a * t + c;
    s[r] = -i[r - t - 1] - 2 * i[r - 1] - i[r + t - 1] + i[r - t + 1] + 2 * i[r + 1] + i[r + t + 1], h[r] = -i[r - t - 1] - 2 * i[r - t] - i[r - t + 1] + i[r + t - 1] + 2 * i[r + t] + i[r + t + 1];
  }
  return { luma: i, gx: s, gy: h };
}
function Gt(d, t, e, n, i, s, h, a) {
  const c = Math.ceil(t / n), r = Math.ceil(e / n), m = c * r, o = new Int16Array(m), g = new Uint8Array(m);
  for (let l = 0; l < r; l++) for (let M = 0; M < c; M++) {
    const f = Math.min(t - 1, Math.round((M + 0.5) * n)), p = Math.min(e - 1, Math.round((l + 0.5) * n)), u = (p * t + f) * 4, b = Math.min(i - 1, Math.floor(d[u] / 256 * i)), v = Math.min(i - 1, Math.floor(d[u + 1] / 256 * i)), k = Math.min(i - 1, Math.floor(d[u + 2] / 256 * i));
    o[l * c + M] = b + v * i + k * i * i;
  }
  const y = [];
  for (let l = 0; l < m; l++) {
    if (g[l]) continue;
    const M = o[l], f = [l], p = [];
    g[l] = 1;
    let u = 0, b = 0, v = 0;
    for (; f.length; ) {
      const k = f.pop(), S = k % c, w = Math.floor(k / c), W = Math.min(t - 1, Math.round((S + 0.5) * n)), q = Math.min(e - 1, Math.round((w + 0.5) * n)), E = (q * t + W) * 4;
      p.push(k), u += d[E], b += d[E + 1], v += d[E + 2];
      for (const P of [k - 1, k + 1, k - c, k + c]) {
        if (P < 0 || P >= m || g[P] || o[P] !== M) continue;
        const $ = P % c;
        Math.abs($ - S) > 1 || (g[P] = 1, f.push(P));
      }
    }
    if (p.length >= h) {
      const k = [u / p.length / 255, b / p.length / 255, v / p.length / 255], S = Math.max(...k), w = Math.min(...k);
      k[0] * 0.2126 + k[1] * 0.7152 + k[2] * 0.0722 > 0.88 && S - w < 0.1 || y.push({ cells: p, color: k });
    }
  }
  y.sort((l, M) => M.cells.length - l.cells.length);
  const x = [];
  for (const l of y) {
    let M = 0, f = 0;
    const p = l.cells.map(($) => {
      const F = [($ % c + 0.5) * n, (Math.floor($ / c) + 0.5) * n];
      return M += F[0], f += F[1], F;
    });
    M /= p.length, f /= p.length;
    let u = 0, b = 0, v = 0;
    for (const $ of p) {
      const F = $[0] - M, B = $[1] - f;
      u += F * F, b += B * B, v += F * B;
    }
    const k = 0.5 * Math.atan2(2 * v, u - b), S = Math.cos(k), w = Math.sin(k), W = -w, q = S, E = /* @__PURE__ */ new Map(), P = Math.max(n, s * 1.22);
    for (const $ of p) {
      const F = $[0] - M, B = $[1] - f, Y = F * S + B * w, et = F * W + B * q, U = Math.round(et / P), D = E.get(U);
      D ? (D.min = Math.min(D.min, Y), D.max = Math.max(D.max, Y), D.v += et, D.count++) : E.set(U, { min: Y, max: Y, v: et, count: 1 });
    }
    for (const $ of [...E.values()].sort((F, B) => F.v / F.count - B.v / B.count)) {
      let F = $.min + s * 0.65, B = $.max - s * 0.65;
      if ($.count < 2 || B - F < s * 1.65) continue;
      const Y = $.v / $.count, et = a.between(-0.1, 0.1) * s, U = [];
      for (let L = 0; L <= 6; L++) {
        const at = L / 6, O = F + (B - F) * at, G = Math.sin(Math.PI * at) * et, Z = M + S * O + W * (Y + G), Q = f + w * O + q * (Y + G);
        U.push([Z, Q]);
      }
      const D = s * 1.1;
      U.some((L) => L[0] < D || L[0] > t - D || L[1] < D || L[1] > e - D) || x.push({ points: U, color: l.color });
    }
  }
  return x;
}
async function jt(d, t, e, n = 420, i = "cover", s = "watercolor", h = "auto", a, c = {}) {
  const r = await Yt(d), m = Math.min(1, n / Math.max(r.width, r.height)), o = Math.max(24, Math.round(r.width * m)), g = Math.max(24, Math.round(r.height * m)), y = document.createElement("canvas");
  y.width = o, y.height = g;
  const x = y.getContext("2d", { willReadFrequently: !0 });
  x.drawImage(r, 0, 0, o, g);
  const l = x.getImageData(0, 0, o, g).data, M = { strokeEconomy: 0.72, shapeSimplification: 0.62, strokeLength: 0.58, strokeWidth: 0.58, boundaryFidelity: 0.72, detailBudget: 0.42, detailPrecision: 0.78, strokeCurvature: 0.34, ...c }, f = 0.48 + M.strokeEconomy * 0.72, p = 1.55 - M.strokeEconomy * 0.77, u = 1.7 - M.strokeEconomy * 0.97, b = 0.65 + M.strokeLength * 0.6, v = 0.65 + M.strokeWidth * 0.6, k = a ? await a({ data: new Uint8ClampedArray(l), width: o, height: g }) : Qt(l, o, g, h);
  if (k.length !== o * g) throw new Error(`detailMap returned ${k.length} weights; expected ${o * g}.`);
  const S = yt(l, o, g, Math.round(6 + M.shapeSimplification * 7)), w = yt(l, o, g, Math.round(3 + M.shapeSimplification * 5)), W = yt(l, o, g, Math.round(2 + M.shapeSimplification * 2)), q = yt(l, o, g, 1), E = [Ft(W, o, g), Ft(q, o, g), Ft(l, o, g)], P = new Xt(t), $ = r.width / r.height, F = [], B = [], Y = Math.min(o, g);
  let et = 0;
  const U = (O, G, Z, Q, H, ut, bt, rt) => {
    const dt = Gt(G, o, g, Z, Q, H, ut, P);
    for (const I of dt) {
      const j = et++, ht = H / Y * P.between(0.92, 1.08);
      for (let T = 1; T < I.points.length; T++) {
        const A = I.points[T - 1], X = I.points[T];
        F.push({
          start: gt(A[0] / o, A[1] / g, $, e, i),
          end: gt(X[0] / o, X[1] / g, $, e, i),
          color: I.color,
          radius: ht,
          opacity: bt * P.between(0.94, 1.06),
          water: rt * P.between(0.92, 1.08),
          layer: O,
          strokeId: j
        });
      }
    }
    B.push(F.length);
  };
  s === "oil" ? (U(0, S, 9 * f, 3, 23 * v, 3, 0.68, 0), U(1, w, 6 * f, Math.round(5 - M.shapeSimplification), 15 * v, 4, 0.76, 0)) : (U(0, S, 9 * f, 3, 24 * v, 3, 0.027, 0.94), U(1, w, 6 * f, Math.round(5 - M.shapeSimplification), 15 * v, 4, 0.038, 0.78)), (s === "oil" ? [
    { data: W, field: 0, spacing: 21, radius: 8.6, length: 80, opacity: 0.8, water: 0, chance: 0.66, edgeOnly: !1 },
    { data: W, field: 0, spacing: 15, radius: 5.7, length: 58, opacity: 0.85, water: 0, chance: 0.58, edgeOnly: !1 },
    { data: q, field: 1, spacing: 10, radius: 3.3, length: 38, opacity: 0.9, water: 0, chance: 0.48, edgeOnly: !1 },
    { data: l, field: 2, spacing: 7, radius: 1.48, length: 16, opacity: 0.94, water: 0, chance: 0.98, edgeOnly: !0 }
  ] : [
    { data: W, field: 0, spacing: 20, radius: 8, length: 74, opacity: 0.052, water: 0.55, chance: 0.68, edgeOnly: !1 },
    { data: W, field: 0, spacing: 14, radius: 5.1, length: 52, opacity: 0.058, water: 0.43, chance: 0.6, edgeOnly: !1 },
    { data: q, field: 1, spacing: 9, radius: 2.8, length: 32, opacity: 0.063, water: 0.29, chance: 0.5, edgeOnly: !1 },
    { data: l, field: 2, spacing: 7, radius: 1.08, length: 13, opacity: 0.064, water: 0.14, chance: 0.98, edgeOnly: !0 }
  ]).forEach((O, G) => {
    const Z = G + 2, Q = [], H = O.spacing * f, ut = O.radius * v, bt = O.length * b, rt = P.between(0, H), dt = /* @__PURE__ */ new Set();
    if (O.edgeOnly) {
      const I = [];
      for (let T = 0, A = rt; A < g; T++, A += H) for (let X = 0, N = rt; N < o; X++, N += H) {
        const J = Math.max(1, Math.min(o - 2, Math.round(N))), _ = Math.max(1, Math.min(g - 2, Math.round(A))), pt = E[O.field], nt = Math.hypot(pt.gx[_ * o + J], pt.gy[_ * o + J]), lt = Math.max(0, Math.min(1, k[_ * o + J]));
        nt > 0.08 && lt > 0.25 + M.detailPrecision * 0.22 && I.push({ key: T * 1e5 + X, score: Math.pow(lt, 2 + M.detailPrecision * 4) * (0.22 + Math.min(0.8, nt)) });
      }
      I.sort((T, A) => A.score - T.score);
      const j = s === "oil" ? 36 : 44, ht = Math.round(j * (0.25 + M.detailBudget * 1.8) * u);
      I.slice(0, ht).forEach((T) => dt.add(T.key));
    }
    for (let I = 0, j = rt; j < g; I++, j += H) for (let ht = 0, T = rt; T < o; ht++, T += H) {
      if (O.edgeOnly && !dt.has(I * 1e5 + ht)) continue;
      const A = T + P.between(-H * 0.46, H * 0.46), X = j + P.between(-H * 0.46, H * 0.46), N = Math.max(1, Math.min(o - 2, Math.round(A))), J = Math.max(1, Math.min(g - 2, Math.round(X))), _ = Math.max(0, Math.min(1, k[J * o + N])), pt = G < 2 ? 0.7 + _ * 0.32 : G === 2 ? 0.58 + _ * 0.5 : 0.15 + _ * 1.35;
      if (P.next() > Math.min(1, O.chance * p * pt)) continue;
      const nt = E[O.field], lt = Math.hypot(nt.gx[J * o + N], nt.gy[J * o + N]);
      if (O.edgeOnly && (lt < 0.15 || P.next() > Math.min(1, lt * 2.1)) || s === "oil" && nt.luma[J * o + N] > 0.76 && lt < 0.07 && Z < 5) continue;
      let V = -nt.gy[J * o + N], K = nt.gx[J * o + N];
      const kt = Math.hypot(V, K);
      if (kt < 0.015) {
        const C = s === "oil" ? 0.1 + Math.sin(A * 0.018 + t) * 0.2 + Math.cos(X * 0.016 - t * 0.7) * 0.16 : P.next() * Math.PI;
        V = Math.cos(C), K = Math.sin(C);
      } else
        V /= kt, K /= kt;
      if (s === "oil") {
        const C = [0.08, -0.38, 0.1, -0.18, 0.22, 0, 0], tt = [0.76, 0.56, 0.48, 0.38, 0.24, 0.08, 0], z = tt[Z], it = C[Z];
        V = V * (1 - z) + Math.cos(it) * z, K = K * (1 - z) + Math.sin(it) * z;
        const ct = Math.max(1e-3, Math.hypot(V, K));
        V /= ct, K /= ct;
      }
      const St = G >= 3 ? 1.16 - _ * 0.38 : 1, Ot = bt * St * P.between(s === "oil" ? 0.84 : 0.72, s === "oil" ? 1.18 : 1.28), vt = Z >= 5 ? 2 : s === "oil" ? 6 : 5, ot = [], mt = Rt(O.data, o, g, A, X), qt = [0.3, 0.26, 0.2, 0.14, 0.1][G] * (1.3 - M.boundaryFidelity * 0.55), It = (C) => {
        let tt = 0, z = 0;
        for (let it = 3; it <= Ot * 0.5; it += 3) {
          const ct = A + V * it * C, Pt = X + K * it * C;
          if (ct < 1 || ct >= o - 1 || Pt < 1 || Pt >= g - 1) break;
          const Ct = Rt(O.data, o, g, ct, Pt);
          if (Math.hypot(Ct[0] - mt[0], Ct[1] - mt[1], Ct[2] - mt[2]) > qt) {
            if (++z >= 2) break;
          } else
            tt = it, z = 0;
        }
        return tt;
      }, ft = It(-1), wt = It(1);
      if (ft + wt < Math.max(O.radius * 2.4, Ot * 0.28)) continue;
      const Wt = (s === "oil" ? 0.055 : 0.12) * (0.35 + M.strokeCurvature * 1.9), At = P.between(-Wt, Wt);
      for (let C = 0; C <= vt; C++) {
        const tt = -ft + (ft + wt) * C / vt, z = Math.sin(C / vt * Math.PI) * At * (ft + wt);
        ot.push([A + V * tt - K * z, X + K * tt + V * z]);
      }
      const Mt = ut * St * (s === "oil" ? 3.2 : 1.45);
      if (ot.some((C) => C[0] < Mt || C[0] > o - Mt || C[1] < Mt || C[1] > g - Mt)) continue;
      const Dt = O.edgeOnly ? mt.map((C) => C * 0.8) : mt, Et = [], Lt = et++;
      for (let C = 1; C < ot.length; C++) {
        const tt = gt(ot[C - 1][0] / o, ot[C - 1][1] / g, $, e, i), z = gt(ot[C][0] / o, ot[C][1] / g, $, e, i);
        Et.push({ start: tt, end: z, color: Dt, radius: ut * St / Y * P.between(0.88, 1.12), opacity: O.opacity * (0.88 + _ * 0.18) * P.between(0.9, 1.1), water: O.water * P.between(0.85, 1.15), layer: Z, strokeId: Lt });
      }
      Q.push(Et);
    }
    for (let I = Q.length - 1; I > 0; I--) {
      const j = Math.floor(P.next() * (I + 1));
      [Q[I], Q[j]] = [Q[j], Q[I]];
    }
    Q.forEach((I) => F.push(...I)), B.push(F.length);
  });
  const L = gt(0, 0, $, e, i), at = gt(1, 1, $, e, i);
  return { segments: F, sourceAspect: $, layerEnds: B, bounds: [Math.min(L[0], at[0]), Math.min(L[1], at[1]), Math.max(L[0], at[0]), Math.max(L[1], at[1])] };
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
}, R = (d, t = 0, e = 1) => Math.min(e, Math.max(t, d)), Bt = () => Math.random() * 1e4;
class Tt {
  constructor(t) {
    this.state = t, this.state = t * 1000003 | 0 || 1;
  }
  state;
  next() {
    let t = this.state;
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, this.state = t | 0, (t >>> 0) / 4294967296;
  }
}
class Zt {
  constructor(t, e = {}) {
    this.canvas = t;
    const n = t.getContext("2d", { alpha: !1 });
    if (!n) throw new Error("watercolor-timelapse requires a 2D canvas context.");
    this.context = n, this.options = { ...Nt, ...e }, this.seed = e.seed ?? Bt(), this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(t), this.resize();
  }
  canvas;
  context;
  pigment = document.createElement("canvas");
  pigmentContext = this.pigment.getContext("2d");
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
    this.timeline = Ht.to(this.progressState, {
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
    this.timeline?.kill(), this.cancelCompletion(), this.progressState.progress = R(t), this.scrubTarget = this.targetSegment(this.progressState.progress), this.scheduleScrub(), this.options.onProgress?.(this.progressState.progress);
  }
  setOptions(t) {
    const e = t.mode !== void 0 && t.mode !== this.options.mode, n = t.detailFocus !== void 0 && t.detailFocus !== this.options.detailFocus || t.detailMap !== void 0 && t.detailMap !== this.options.detailMap, i = e || n || ["strokeEconomy", "shapeSimplification", "strokeLength", "strokeWidth", "boundaryFidelity", "detailBudget", "detailPrecision", "strokeCurvature"].some((c) => t[c] !== void 0), s = t.paperColor !== void 0 || t.paperRoughness !== void 0 || t.granulation !== void 0 || t.bloom !== void 0 || t.transparency !== void 0 || t.paintLoad !== void 0 || t.dryBrush !== void 0 || t.bristleStrength !== void 0 || t.gloss !== void 0 || t.renderQuality !== void 0, h = this.progressState.progress, a = !!this.timeline?.isActive();
    if (Object.assign(this.options, t), t.seed !== void 0) {
      this.restart(t.seed);
      return;
    }
    if (i && this.source) {
      this.setImage(this.source).then(() => {
        this.seek(h), a && this.play();
      });
      return;
    }
    if (t.pixelRatio !== void 0) {
      this.resize();
      return;
    }
    s ? (this.createPaper(), this.rebuildToAsync(this.targetSegment(this.progressState.progress))) : this.compose();
  }
  capture(t = "image/png", e = 0.92) {
    return this.canvas.toDataURL(t, e);
  }
  updatePainting() {
    const t = this.targetSegment(this.progressState.progress);
    t > this.drawnSegments && this.depositBudget(t, !0), this.advanceWetMarks(), this.compose(), this.setPhase(this.progressState.progress > 0.94 ? "drying" : "painting"), this.options.onProgress?.(this.progressState.progress);
  }
  targetSegment(t) {
    if (!this.plan) return 0;
    const e = 0.94, n = R(t / e), i = 0.8 + R(this.options.detailDelay) * 0.18, s = [0, 0.26, 0.47, 0.65, 0.79, i, 1], h = this.plan.layerEnds;
    for (let a = 0; a < h.length; a++)
      if (n <= s[a + 1]) {
        const c = a === 0 ? 0 : h[a - 1], r = (n - s[a]) / (s[a + 1] - s[a]);
        return Math.round(c + (h[a] - c) * R(r));
      }
    return this.plan.segments.length;
  }
  paintNextStroke(t, e = !1) {
    if (!this.plan) return t;
    const n = this.plan.segments[t].strokeId, i = t;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === n; ) t++;
    const s = this.plan.segments.slice(i, t);
    return this.options.mode === "oil" ? this.paintOilStroke(s, n) : (this.paintWatercolorStroke(s, n), e && n % 3 === 0 && this.wetMarks.push({ segments: s, strokeId: n, age: 0 })), t;
  }
  depositBudget(t, e = !1, n = this.options.mode === "oil" ? 7 : 8) {
    const i = performance.now(), s = Math.max(1, Math.round(this.options.strokesPerFrame));
    let h = 0, a = this.drawnSegments;
    for (; a < t && h < s && (h === 0 || performance.now() - i < n); )
      a = this.paintNextStroke(a, e), h++;
    return this.drawnSegments = a, e || this.maybeCheckpoint(), this.cpuPaintMs += performance.now() - i, this.plan && a >= this.plan.segments.length && (this.canvas.dataset.watercolorCpuMs = this.cpuPaintMs.toFixed(1)), a >= t;
  }
  cancelCompletion() {
    this.timelineFinished = !1, this.completionFrame && (cancelAnimationFrame(this.completionFrame), this.completionFrame = 0);
  }
  cancelScrub() {
    this.scrubFrame && (cancelAnimationFrame(this.scrubFrame), this.scrubFrame = 0);
  }
  scheduleScrub() {
    this.scrubFrame || (this.scrubFrame = requestAnimationFrame(() => {
      this.scrubFrame = 0, !(this.destroyed || !this.plan) && (this.drawnSegments > this.scrubTarget && !this.restoreCheckpoint(this.scrubTarget) && this.resetPainting(), this.drawnSegments < this.scrubTarget && this.depositBudget(this.scrubTarget, !1), this.compose(), this.drawnSegments < this.scrubTarget && this.scheduleScrub());
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
  paintOilStroke(t, e) {
    if (!t.length) return;
    const n = new Tt(this.seed + e * 31.77), i = t[0], s = this.qualityFactor(), h = [i.start, ...t.map((S) => S.end)].map((S) => [S[0] * this.width, S[1] * this.height]);
    let a = this.smoothPath(h, 5);
    const c = n.next();
    let r = "loaded";
    const m = R(this.options.dryBrush);
    if (i.layer >= 6 ? r = c < 0.45 + m * 0.4 ? "tap" : "dry" : i.layer === 5 ? r = c < 0.12 + m * 0.42 ? "tap" : c < 0.24 + m * 0.52 ? "dry" : "loaded" : (i.layer === 4 && c < 0.05 + m * 0.35 || c < 0.02 + m * 0.25) && (r = "dry"), r === "tap") {
      const S = Math.floor(a.length * 0.34), w = Math.ceil(a.length * 0.66);
      a = a.slice(S, w);
    }
    const o = Math.max(0.7, i.radius * this.height), g = i.color.map((S) => Math.round(R(S) * 255)), y = this.mixProfile(a, g), x = this.averageColors(y), l = this.pigmentContext, M = R(i.opacity) * (0.55 + this.options.paintLoad * 0.65) * (r === "dry" ? 0.62 : 1), f = 0.45 + this.options.granulation * 0.85, p = x.map((S) => Math.round(S * 0.55)), u = x.map((S) => Math.round(S + (255 - S) * 0.42));
    if (l.save(), l.lineCap = "round", l.lineJoin = "round", this.plan) {
      const [S, w, W, q] = this.plan.bounds;
      l.beginPath(), l.rect(S * this.width, w * this.height, (W - S) * this.width, (q - w) * this.height), l.clip();
    }
    l.globalCompositeOperation = "source-over", l.fillStyle = `rgba(${p[0]},${p[1]},${p[2]},${0.1 * M * f})`, l.filter = s < 0.5 ? "none" : `blur(${Math.min(2.2, o * 0.055)}px)`, this.fillOilBody(l, this.offsetPath(a, o * 0.14 * f, o * 0.16 * f), o * (1 + 0.07 * f), r, n.next() * 9), l.fill(), l.filter = "none";
    const b = this.oilGradient(l, a, y, 0.36 * M);
    l.fillStyle = b, l.filter = s < 0.5 ? "none" : `blur(${Math.min(1.35, o * 0.035)}px)`, this.fillOilBody(l, a, o * 1.035, r, n.next() * 9), l.fill(), l.filter = "none", l.fillStyle = this.oilGradient(l, a, y, (r === "dry" ? 0.58 : 0.9) * M), this.fillOilBody(l, a, o * 0.92, r, n.next() * 9), l.fill();
    const v = R(this.options.bristleStrength), k = Math.max(2, Math.min(r === "dry" ? 18 : 14, Math.round(o * (r === "dry" ? 0.82 : 0.52) * (0.25 + v) * s)));
    for (let S = 0; S < k; S++) {
      const w = (S / (k - 1) - 0.5) * o * 1.72 + (n.next() - 0.5) * o * 0.1;
      if (r === "dry" && n.next() < 0.28) continue;
      const W = y[Math.min(y.length - 1, Math.floor(n.next() * y.length))], q = (S / (k - 1) - 0.5) * 0.16 + (n.next() - 0.5) * 0.06, E = W.map((P) => Math.round(R(P / 255 + q) * 255));
      l.strokeStyle = `rgba(${E[0]},${E[1]},${E[2]},${(0.06 + n.next() * 0.22) * v})`, l.lineWidth = Math.max(0.3, o * (0.022 + n.next() * 0.052)), this.strokePath(l, this.offsetPath(a, w, 0)), l.stroke();
    }
    l.globalCompositeOperation = "screen", l.strokeStyle = `rgba(${u[0]},${u[1]},${u[2]},${0.28 * M * f * this.options.gloss})`, l.lineWidth = Math.max(0.45, o * 0.13 * f), this.strokePath(l, this.offsetPath(a, -o * 0.58 * f, -o * 0.05 * f)), l.stroke(), l.globalCompositeOperation = "multiply", l.strokeStyle = `rgba(${p[0]},${p[1]},${p[2]},${0.12 * M * f})`, l.lineWidth = Math.max(0.4, o * 0.1 * f), this.strokePath(l, this.offsetPath(a, o * 0.62 * f, o * 0.04 * f)), l.stroke(), this.paintOilSurface(l, a, o, y, n, f, M), l.globalCompositeOperation = "source-over", r === "loaded" && n.next() < 0.12 + this.options.paintLoad * 0.34 && this.paintOilTrails(l, a, o, x, n, M), l.restore();
  }
  mixProfile(t, e) {
    return (this.options.renderQuality === "fast" ? [0, 0.5, 1] : this.options.renderQuality === "balanced" ? [0, 0.33, 0.67, 1] : [0, 0.25, 0.5, 0.75, 1]).map((i) => {
      const s = Math.min(t.length - 1, Math.round((t.length - 1) * i)), h = t[s], a = this.pigmentContext.getImageData(R(Math.round(h[0]), 0, this.width - 1), R(Math.round(h[1]), 0, this.height - 1), 1, 1).data;
      if (a[3] <= 18) return e;
      const c = R(a[3] / 255 * (0.12 + this.options.bloom * 0.4), 0.06, 0.46);
      return e.map((r, m) => Math.round(Math.exp(Math.log(Math.max(1, r)) * (1 - c) + Math.log(Math.max(1, a[m])) * c)));
    });
  }
  averageColors(t) {
    return [0, 1, 2].map((e) => Math.round(t.reduce((n, i) => n + i[e], 0) / t.length));
  }
  oilGradient(t, e, n, i) {
    const s = e[0], h = e[e.length - 1], a = t.createLinearGradient(s[0], s[1], h[0], h[1]);
    return n.forEach((c, r) => a.addColorStop(r / (n.length - 1), `rgba(${c[0]},${c[1]},${c[2]},${i})`)), a;
  }
  paintOilTrails(t, e, n, i, s, h) {
    if (e.length < 2) return;
    const a = e[e.length - 1], c = e[e.length - 2], r = a[0] - c[0], m = a[1] - c[1], o = Math.max(1, Math.hypot(r, m)), g = r / o, y = m / o, x = -y, l = g, M = s.next() < 0.7 ? 1 : 2;
    for (let f = 0; f < M; f++) {
      const p = f === 0 ? -1 : 1, u = p * n * (0.65 + s.next() * 0.24), b = n * (0.45 + s.next() * 0.85);
      t.strokeStyle = `rgba(${i[0]},${i[1]},${i[2]},${h * (0.2 + s.next() * 0.22)})`, t.lineWidth = Math.max(0.35, n * (0.045 + s.next() * 0.08)), this.strokePath(t, [[c[0] + x * u, c[1] + l * u], [a[0] + x * u, a[1] + l * u], [a[0] + x * u + g * b, a[1] + l * u + y * b]]), t.stroke();
    }
  }
  offsetPath(t, e, n) {
    return t.map((i, s) => {
      const h = t[Math.max(0, s - 1)], a = t[Math.min(t.length - 1, s + 1)], c = a[0] - h[0], r = a[1] - h[1], m = Math.max(1, Math.hypot(c, r));
      return [i[0] - r / m * e, i[1] + c / m * e + n];
    });
  }
  smoothPath(t, e) {
    if (t.length < 3) return t;
    const n = [];
    for (let i = 0; i < t.length - 1; i++) {
      const s = t[Math.max(0, i - 1)], h = t[i], a = t[i + 1], c = t[Math.min(t.length - 1, i + 2)];
      for (let r = 0; r < e; r++) {
        const m = r / e, o = m * m, g = o * m;
        n.push([
          0.5 * (2 * h[0] + (-s[0] + a[0]) * m + (2 * s[0] - 5 * h[0] + 4 * a[0] - c[0]) * o + (-s[0] + 3 * h[0] - 3 * a[0] + c[0]) * g),
          0.5 * (2 * h[1] + (-s[1] + a[1]) * m + (2 * s[1] - 5 * h[1] + 4 * a[1] - c[1]) * o + (-s[1] + 3 * h[1] - 3 * a[1] + c[1]) * g)
        ]);
      }
    }
    return n.push(t[t.length - 1]), n;
  }
  strokePath(t, e) {
    if (!(e.length < 2)) {
      t.beginPath(), t.moveTo(e[0][0], e[0][1]);
      for (let n = 1; n < e.length - 1; n++) {
        const i = [(e[n][0] + e[n + 1][0]) * 0.5, (e[n][1] + e[n + 1][1]) * 0.5];
        t.quadraticCurveTo(e[n][0], e[n][1], i[0], i[1]);
      }
      t.lineTo(e[e.length - 1][0], e[e.length - 1][1]);
    }
  }
  fillOilBody(t, e, n, i, s) {
    if (e.length < 2) return;
    const h = [], a = [];
    e.forEach((c, r) => {
      const m = e[Math.max(0, r - 1)], o = e[Math.min(e.length - 1, r + 1)], g = o[0] - m[0], y = o[1] - m[1], x = Math.max(1, Math.hypot(g, y)), l = r / (e.length - 1), M = Math.pow(Math.max(0, Math.sin(Math.PI * l)), i === "tap" ? 0.25 : 0.48), f = i === "dry" ? 0.12 : i === "tap" ? 0.3 : 0.24, p = (f + (1 - f) * M) * (1 + 0.065 * Math.sin(l * Math.PI * 5 + s) + 0.035 * Math.sin(l * Math.PI * 11 - s * 0.7)), u = -y / x * n * p, b = g / x * n * p;
      h.push([c[0] + u, c[1] + b]), a.push([c[0] - u, c[1] - b]);
    }), t.beginPath(), t.moveTo(h[0][0], h[0][1]);
    for (let c = 1; c < h.length; c++) t.lineTo(h[c][0], h[c][1]);
    for (let c = a.length - 1; c >= 0; c--) t.lineTo(a[c][0], a[c][1]);
    t.closePath();
  }
  paintOilSurface(t, e, n, i, s, h, a) {
    const c = this.qualityFactor(), r = Math.max(2, Math.min(30, Math.round(n * 0.48 * c)));
    t.globalCompositeOperation = "multiply";
    for (let m = 0; m < r; m++) {
      const o = Math.min(e.length - 2, Math.floor(s.next() * (e.length - 1))), g = e[o], y = e[o + 1], x = Math.atan2(y[1] - g[1], y[0] - g[0]), l = i[Math.floor(s.next() * i.length)];
      t.save(), t.translate(g[0] + (s.next() - 0.5) * n, g[1] + (s.next() - 0.5) * n), t.rotate(x), t.fillStyle = `rgba(${Math.round(l[0] * 0.62)},${Math.round(l[1] * 0.62)},${Math.round(l[2] * 0.62)},${0.025 * h * a})`, t.beginPath(), t.ellipse(0, 0, Math.max(0.4, n * (0.04 + s.next() * 0.12)), Math.max(0.3, n * (0.025 + s.next() * 0.06)), 0, 0, Math.PI * 2), t.fill(), t.restore();
    }
    t.globalCompositeOperation = "screen";
    for (let m = 0; m < Math.ceil(r * (0.1 + this.options.gloss * 0.55)); m++) {
      const o = Math.min(e.length - 2, Math.floor(s.next() * (e.length - 1))), g = e[o], y = e[o + 1], x = y[0] - g[0], l = y[1] - g[1], M = Math.max(1, Math.hypot(x, l)), f = -l / M, p = x / M, u = i[Math.floor(s.next() * i.length)], b = -n * (0.15 + s.next() * 0.45);
      t.strokeStyle = `rgba(${Math.round(u[0] + (255 - u[0]) * 0.72)},${Math.round(u[1] + (255 - u[1]) * 0.72)},${Math.round(u[2] + (255 - u[2]) * 0.72)},${0.085 * h * a * this.options.gloss})`, t.lineWidth = Math.max(0.35, n * 0.035), t.beginPath(), t.moveTo(g[0] + f * b, g[1] + p * b), t.lineTo(g[0] + f * b + x * 0.65, g[1] + p * b + l * 0.65), t.stroke();
    }
  }
  paintWatercolorStroke(t, e, n = 0) {
    if (!t.length) return;
    const i = t[0], s = new Tt(this.seed + e * 19.41 + n * 997), h = this.pigmentContext, a = this.qualityFactor(), c = [i.start, ...t.map((p) => p.end)].map((p) => this.flowPoint(p, i.radius, s)), r = this.smoothPath(c, 4), m = Math.max(0.45, i.radius * this.height), o = i.color.map((p) => Math.round(R(p) * 255)), g = i.opacity * (1 - this.options.transparency * 0.55) * (0.55 + this.options.paintLoad * 0.7), y = 1 + n * this.options.bloom * 0.34;
    if (h.save(), this.plan) {
      const [p, u, b, v] = this.plan.bounds;
      h.beginPath(), h.rect(p * this.width, u * this.height, (b - p) * this.width, (v - u) * this.height), h.clip();
    }
    const x = 0.92 - this.options.edgeDarkening * 0.2;
    h.fillStyle = `rgba(${Math.round(o[0] * x)},${Math.round(o[1] * x)},${Math.round(o[2] * x)},${g * (0.2 + this.options.edgeDarkening * 0.16 + n * 0.05)})`, h.filter = a < 0.5 ? "none" : `blur(${Math.min(3.2, m * 0.12)}px)`, this.fillOilBody(h, r, m * 1.2 * y, "loaded", s.next() * 8), h.fill(), h.filter = "none", h.fillStyle = `rgba(${o[0]},${o[1]},${o[2]},${g * 3.05})`, this.fillOilBody(h, r, m * 0.86, "loaded", s.next() * 8), h.fill();
    const l = R(this.options.bristleStrength), M = Math.max(1, Math.min(10, Math.round(m * 0.42 * (0.3 + l) * a)));
    for (let p = 0; p < M; p++) {
      if (s.next() < 0.18) continue;
      const u = (p / Math.max(1, M - 1) - 0.5) * m * 1.5 + (s.next() - 0.5) * m * 0.12;
      h.strokeStyle = `rgba(${o[0]},${o[1]},${o[2]},${g * (0.2 + s.next() * 0.6) * l})`, h.lineWidth = Math.max(0.28, m * (0.025 + s.next() * 0.07)), this.strokePath(h, this.offsetPath(r, u, 0)), h.stroke();
    }
    const f = Math.max(1, Math.min(9, Math.round(r.length * 0.24 * a)));
    for (let p = 0; p < f; p++) {
      const u = Math.min(r.length - 2, Math.floor(s.next() * (r.length - 1))), b = r[u], v = r[u + 1], k = v[0] - b[0], S = v[1] - b[1], w = Math.max(1, Math.hypot(k, S)), W = -S / w, q = k / w, E = (s.next() - 0.5) * m * 1.35;
      this.paperHeight(b[0], b[1]) < 0.5 && (h.fillStyle = `rgba(${Math.round(o[0] * 0.64)},${Math.round(o[1] * 0.64)},${Math.round(o[2] * 0.64)},${g * (0.18 + s.next() * 0.25)})`, h.beginPath(), h.arc(b[0] + W * E, b[1] + q * E, Math.max(0.3, m * (0.025 + s.next() * 0.07)), 0, Math.PI * 2), h.fill());
    }
    h.globalCompositeOperation = "destination-out", h.fillStyle = `rgba(0,0,0,${0.02 + 0.035 * this.options.paperRoughness})`;
    for (let p = 0; p < Math.min(6, f); p++) {
      const u = r[Math.floor(s.next() * r.length)];
      this.paperHeight(u[0], u[1]) > 0.56 && (h.beginPath(), h.arc(u[0] + (s.next() - 0.5) * m, u[1] + (s.next() - 0.5) * m, Math.max(0.25, m * (0.018 + s.next() * 0.045)), 0, Math.PI * 2), h.fill());
    }
    h.restore();
  }
  flowPoint(t, e, n) {
    const i = t[0] * this.width, s = t[1] * this.height, h = 2, a = this.paperHeight(i + h, s) - this.paperHeight(i - h, s), c = this.paperHeight(i, s + h) - this.paperHeight(i, s - h), r = this.options.bloom * e * this.height * 1.8;
    return [i - a * r + (n.next() - 0.5) * r * 0.08, s - c * r + (n.next() - 0.5) * r * 0.08];
  }
  paperHeight(t, e) {
    const n = this.seed * 0.013;
    return 0.5 + 0.22 * Math.sin(t * 0.021 + n) * Math.sin(e * 0.027 - n * 0.7) + 0.16 * Math.sin(t * 0.083 + e * 0.017 + n * 2.1) + 0.1 * Math.cos(e * 0.14 - t * 0.031 - n);
  }
  advanceWetMarks() {
    const t = [];
    for (const e of this.wetMarks)
      e.age++, (e.age === 2 || e.age === 5) && this.paintWatercolorStroke(e.segments, e.strokeId, e.age / 5), e.age < 6 && t.push(e);
    this.wetMarks = t;
  }
  compose() {
    this.context.save(), this.context.globalCompositeOperation = "source-over", this.context.drawImage(this.paper, 0, 0), this.context.globalCompositeOperation = this.options.mode === "oil" ? "source-over" : "multiply", this.context.globalAlpha = this.options.mode === "oil" ? 1 : 0.96, this.context.drawImage(this.pigment, 0, 0), this.context.restore();
  }
  createPaper() {
    this.paper.width = this.width, this.paper.height = this.height;
    const t = this.hex(this.options.paperColor), e = this.paperContext.createImageData(this.width, this.height), n = e.data;
    for (let i = 0; i < this.height; i++) for (let s = 0; s < this.width; s++) {
      const h = (i * this.width + s) * 4, a = this.paperHeight(s, i) - 0.5, c = Math.sin(i * 0.72 + s * 0.035 + this.seed) * 0.5, r = (a * 0.085 + c * 0.012) * this.options.paperRoughness;
      n[h] = R(t[0] / 255 + r) * 255, n[h + 1] = R(t[1] / 255 + r) * 255, n[h + 2] = R(t[2] / 255 + r) * 255, n[h + 3] = 255;
    }
    this.paperContext.putImageData(e, 0, 0), this.compose();
  }
  qualityFactor() {
    return this.options.renderQuality === "fast" ? 0.38 : this.options.renderQuality === "balanced" ? 0.68 : 1;
  }
  clearCheckpoints() {
    this.checkpoints = [];
  }
  maybeCheckpoint() {
    if (!this.plan || this.drawnSegments >= this.plan.segments.length) return;
    const t = Math.max(1, Math.ceil(this.plan.segments.length / 6)), e = this.checkpoints[this.checkpoints.length - 1];
    if (this.drawnSegments - (e?.segment ?? 0) < t) return;
    const n = document.createElement("canvas");
    n.width = this.width, n.height = this.height, n.getContext("2d").drawImage(this.pigment, 0, 0), this.checkpoints.push({ segment: this.drawnSegments, surface: n });
  }
  restoreCheckpoint(t) {
    for (let e = this.checkpoints.length - 1; e >= 0; e--) {
      const n = this.checkpoints[e];
      if (!(n.segment > t))
        return this.pigmentContext.clearRect(0, 0, this.width, this.height), this.pigmentContext.drawImage(n.surface, 0, 0), this.drawnSegments = n.segment, this.wetMarks = [], !0;
    }
    return !1;
  }
  resetPainting() {
    this.pigmentContext.clearRect(0, 0, this.width, this.height), this.drawnSegments = 0, this.wetMarks = [], this.cpuPaintMs = 0, this.canvas.dataset.watercolorCpuMs = "0", this.compose();
  }
  rebuildToAsync(t) {
    this.cancelScrub(), this.clearCheckpoints(), this.resetPainting(), this.scrubTarget = t, this.scheduleScrub();
  }
  resize() {
    const t = Math.max(1, this.canvas.clientWidth || this.canvas.width), e = Math.max(1, this.canvas.clientHeight || this.canvas.height), n = Math.min(window.devicePixelRatio || 1, this.options.pixelRatio), i = Math.min(1400, Math.round(t * n)), s = Math.min(1400, Math.round(e * n));
    i === this.width && s === this.height || (this.width = i, this.height = s, this.canvas.width = i, this.canvas.height = s, this.pigment.width = i, this.pigment.height = s, this.clearCheckpoints(), this.createPaper(), this.plan && this.rebuildToAsync(this.targetSegment(this.progressState.progress)));
  }
  hex(t) {
    const e = t.replace("#", ""), n = e.length === 3 ? e.split("").map((s) => s + s).join("") : e, i = parseInt(n, 16);
    return [i >> 16 & 255, i >> 8 & 255, i & 255];
  }
  canvasAspect() {
    return Math.max(1, this.canvas.clientWidth || this.canvas.width) / Math.max(1, this.canvas.clientHeight || this.canvas.height);
  }
  setPhase(t) {
    this.phase !== t && (this.phase = t, this.options.onPhaseChange?.(t));
  }
  destroy() {
    this.destroyed = !0, this.timeline?.kill(), this.cancelCompletion(), this.cancelScrub(), this.clearCheckpoints(), this.resizeObserver.disconnect(), delete this.canvas.dataset.watercolorSegments, delete this.canvas.dataset.watercolorCpuMs;
  }
}
export {
  Zt as W
};
