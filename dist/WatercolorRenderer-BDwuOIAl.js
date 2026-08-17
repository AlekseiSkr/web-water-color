import Yt from "gsap";
const St = (d, t = 0, n = 1) => Math.max(t, Math.min(n, d));
function jt(d, t) {
  const n = d[t], i = d[t + 1], e = d[t + 2], s = Math.max(n, i, e), l = Math.min(n, i, e), r = 128 - 0.168736 * n - 0.331264 * i + 0.5 * e, o = 128 + 0.5 * n - 0.418688 * i - 0.081312 * e;
  return n < 48 || s - l < 12 || o < 128 || o > 181 || r < 72 || r > 137 ? 0 : St((n - i + 18) / 70) * St((o - 128) / 24) * St((137 - r) / 28);
}
function st(d, t, n, i, e, s, l, r) {
  const o = Math.max(0, Math.floor(i - s * 2.5)), a = Math.min(t - 1, Math.ceil(i + s * 2.5)), m = Math.max(0, Math.floor(e - l * 2.5)), c = Math.min(n - 1, Math.ceil(e + l * 2.5));
  for (let h = m; h <= c; h++) for (let k = o; k <= a; k++) {
    const y = (k - i) / s, g = (h - e) / l, p = r * Math.exp(-(y * y + g * g) * 0.5), M = h * t + k;
    d[M] = Math.max(d[M], p);
  }
}
function Gt(d, t, n) {
  const i = Math.max(2, Math.round(Math.min(t, n) / 150)), e = Math.ceil(t / i), s = Math.ceil(n / i), l = new Uint8Array(e * s), r = new Uint8Array(e * s);
  for (let u = 0; u < s; u++) for (let x = 0; x < e; x++) {
    const S = Math.min(t - 1, Math.round((x + 0.5) * i)), b = Math.min(n - 1, Math.round((u + 0.5) * i));
    l[u * e + x] = jt(d, (b * t + S) * 4) > 0.17 ? 1 : 0;
  }
  let o = [];
  for (let u = 0; u < l.length; u++) {
    if (r[u] || !l[u]) continue;
    const x = [], S = [u];
    for (r[u] = 1; S.length; ) {
      const b = S.pop(), v = b % e;
      x.push(b);
      for (const w of [b - 1, b + 1, b - e, b + e])
        w < 0 || w >= l.length || r[w] || !l[w] || Math.abs(w % e - v) > 1 || (r[w] = 1, S.push(w));
    }
    x.length > o.length && (o = x);
  }
  if (o.length < Math.max(18, l.length * 0.012)) return;
  let a = e, m = s, c = 0, h = 0;
  for (const u of o) {
    const x = u % e, S = Math.floor(u / e);
    a = Math.min(a, x), c = Math.max(c, x), m = Math.min(m, S), h = Math.max(h, S);
  }
  let k = a * i, y = Math.min(t, (c + 1) * i), g = m * i, p = Math.min(n, (h + 1) * i), M = y - k, f = p - g;
  if (f > M * 1.48 && (p = Math.min(p, g + M * 1.48)), f = p - g, !(M < t * 0.12 || f < n * 0.12))
    return k = Math.max(0, k - M * 0.13), y = Math.min(t, y + M * 0.13), g = Math.max(0, g - f * 0.18), p = Math.min(n, p + f * 0.08), { left: k, right: y, top: g, bottom: p, width: y - k, height: p - g };
}
function Et(d, t, n, i, e, s, l, r, o) {
  const a = [], m = Math.max(2, Math.round((e - i) * 0.055));
  for (let k = Math.max(m, Math.round(s)); k < Math.min(n - m, Math.round(l)); k += 2) for (let y = Math.max(m, Math.round(i)); y < Math.min(t - m, Math.round(e)); y += 2) {
    const g = (k * t + y) * 4, p = d[g] * 0.2126 + d[g + 1] * 0.7152 + d[g + 2] * 0.0722;
    let M = 0, f = 0;
    for (const [x, S] of [[-m, 0], [m, 0], [0, -m], [0, m]]) {
      const b = ((k + S) * t + y + x) * 4;
      M += d[b] * 0.2126 + d[b + 1] * 0.7152 + d[b + 2] * 0.0722, f++;
    }
    const u = M / f - p;
    u > 5 && a.push({ x: y, y: k, score: u });
  }
  a.sort((k, y) => y.score - k.score);
  const c = a.slice(0, Math.max(4, Math.ceil(a.length * 0.04)));
  if (!c.length) return { x: r, y: o };
  const h = c.reduce((k, y) => k + y.score, 0);
  return { x: c.reduce((k, y) => k + y.x * y.score, 0) / h, y: c.reduce((k, y) => k + y.y * y.score, 0) / h };
}
function Nt(d, t, n, i = "auto") {
  const e = new Float32Array(t * n);
  if (i === "uniform")
    return e.fill(1), e;
  const s = new Float32Array(t * n);
  for (let M = 0; M < s.length; M++) {
    const f = M * 4;
    s[M] = d[f] * 0.2126 + d[f + 1] * 0.7152 + d[f + 2] * 0.0722;
  }
  for (let M = 1; M < n - 1; M++) for (let f = 1; f < t - 1; f++) {
    const u = M * t + f, x = u * 4, S = Math.hypot(s[u + 1] - s[u - 1], s[u + t] - s[u - t]) / 255, b = (Math.max(d[x], d[x + 1], d[x + 2]) - Math.min(d[x], d[x + 1], d[x + 2])) / 255;
    e[u] = St(0.08 + S * 1.45 + b * 0.1, 0, 0.48);
  }
  const l = Gt(d, t, n);
  if (!l) return e;
  const { left: r, right: o, top: a, bottom: m } = l, c = l.width, h = l.height, k = (r + o) * 0.5;
  st(e, t, n, k, a + h * 0.5, c * 0.48, h * 0.5, 0.58);
  const y = Et(d, t, n, r + c * 0.1, k - c * 0.03, a + h * 0.25, a + h * 0.53, r + c * 0.32, a + h * 0.4), g = Et(d, t, n, k + c * 0.03, o - c * 0.1, a + h * 0.25, a + h * 0.53, r + c * 0.68, a + h * 0.4);
  st(e, t, n, y.x, y.y, c * 0.105, h * 0.065, 1), st(e, t, n, g.x, g.y, c * 0.105, h * 0.065, 1), st(e, t, n, y.x, y.y - h * 0.09, c * 0.14, h * 0.045, 0.82), st(e, t, n, g.x, g.y - h * 0.09, c * 0.14, h * 0.045, 0.82), st(e, t, n, k, a + h * 0.59, c * 0.1, h * 0.16, 0.72);
  const p = Et(d, t, n, r + c * 0.25, o - c * 0.25, a + h * 0.62, a + h * 0.86, k, a + h * 0.75);
  return st(e, t, n, p.x, p.y, c * 0.18, h * 0.072, 0.96), st(e, t, n, k, a + h * 0.51, c * 0.55, h * 0.55, 0.62), e;
}
let Jt = class {
  constructor(t) {
    this.state = t, this.state = t * 1000003 | 0 || 1;
  }
  state;
  next() {
    let t = this.state;
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, this.state = t | 0, (t >>> 0) / 4294967296;
  }
  between(t, n) {
    return t + (n - t) * this.next();
  }
};
async function Vt(d) {
  if (typeof d != "string") return d;
  const t = new Image();
  return t.crossOrigin = "anonymous", t.src = d, await t.decode(), t;
}
function Lt(d, t, n, i, e) {
  i = Math.max(0, Math.min(t - 1, Math.round(i))), e = Math.max(0, Math.min(n - 1, Math.round(e)));
  const s = (e * t + i) * 4;
  return [d[s] / 255, d[s + 1] / 255, d[s + 2] / 255];
}
function dt(d, t, n, i, e) {
  let s = 1, l = 1;
  return e === "cover" ? n > i ? s = n / i : l = i / n : n > i ? l = i / n : s = n / i, [(d - 0.5) * s + 0.5, (t - 0.5) * l + 0.5];
}
function vt(d, t, n, i) {
  if (i <= 0) return new Uint8ClampedArray(d);
  const e = new Float32Array(d.length), s = new Uint8ClampedArray(d.length), l = i * 2 + 1;
  for (let r = 0; r < n; r++) for (let o = 0; o < 4; o++) {
    let a = 0;
    for (let m = -i; m <= i; m++) a += d[(r * t + Math.max(0, Math.min(t - 1, m))) * 4 + o];
    for (let m = 0; m < t; m++)
      e[(r * t + m) * 4 + o] = a / l, a -= d[(r * t + Math.max(0, m - i)) * 4 + o], a += d[(r * t + Math.min(t - 1, m + i + 1)) * 4 + o];
  }
  for (let r = 0; r < t; r++) for (let o = 0; o < 4; o++) {
    let a = 0;
    for (let m = -i; m <= i; m++) a += e[(Math.max(0, Math.min(n - 1, m)) * t + r) * 4 + o];
    for (let m = 0; m < n; m++)
      s[(m * t + r) * 4 + o] = a / l, a -= e[(Math.max(0, m - i) * t + r) * 4 + o], a += e[(Math.min(n - 1, m + i + 1) * t + r) * 4 + o];
  }
  return s;
}
function It(d, t, n) {
  const i = t * n, e = new Float32Array(i), s = new Float32Array(i), l = new Float32Array(i);
  for (let r = 0; r < i; r++) {
    const o = r * 4;
    e[r] = d[o] * 8337e-7 + d[o + 1] * 2805e-6 + d[o + 2] * 283e-6;
  }
  for (let r = 1; r < n - 1; r++) for (let o = 1; o < t - 1; o++) {
    const a = r * t + o;
    s[a] = -e[a - t - 1] - 2 * e[a - 1] - e[a + t - 1] + e[a - t + 1] + 2 * e[a + 1] + e[a + t + 1], l[a] = -e[a - t - 1] - 2 * e[a - t] - e[a - t + 1] + e[a + t - 1] + 2 * e[a + t] + e[a + t + 1];
  }
  return { luma: e, gx: s, gy: l };
}
function Kt(d, t, n, i, e, s, l, r) {
  const o = Math.ceil(t / i), a = Math.ceil(n / i), m = o * a, c = new Int16Array(m), h = new Uint8Array(m);
  for (let g = 0; g < a; g++) for (let p = 0; p < o; p++) {
    const M = Math.min(t - 1, Math.round((p + 0.5) * i)), f = Math.min(n - 1, Math.round((g + 0.5) * i)), u = (f * t + M) * 4, x = Math.min(e - 1, Math.floor(d[u] / 256 * e)), S = Math.min(e - 1, Math.floor(d[u + 1] / 256 * e)), b = Math.min(e - 1, Math.floor(d[u + 2] / 256 * e));
    c[g * o + p] = x + S * e + b * e * e;
  }
  const k = [];
  for (let g = 0; g < m; g++) {
    if (h[g]) continue;
    const p = c[g], M = [g], f = [];
    h[g] = 1;
    let u = 0, x = 0, S = 0;
    for (; M.length; ) {
      const b = M.pop(), v = b % o, w = Math.floor(b / o), T = Math.min(t - 1, Math.round((v + 0.5) * i)), D = Math.min(n - 1, Math.round((w + 0.5) * i)), W = (D * t + T) * 4;
      f.push(b), u += d[W], x += d[W + 1], S += d[W + 2];
      for (const R of [b - 1, b + 1, b - o, b + o]) {
        if (R < 0 || R >= m || h[R] || c[R] !== p) continue;
        const $ = R % o;
        Math.abs($ - v) > 1 || (h[R] = 1, M.push(R));
      }
    }
    if (f.length >= l) {
      const b = [u / f.length / 255, x / f.length / 255, S / f.length / 255], v = Math.max(...b), w = Math.min(...b);
      b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722 > 0.88 && v - w < 0.1 || k.push({ cells: f, color: b });
    }
  }
  k.sort((g, p) => p.cells.length - g.cells.length);
  const y = [];
  for (const g of k) {
    let p = 0, M = 0;
    const f = g.cells.map(($) => {
      const O = [($ % o + 0.5) * i, (Math.floor($ / o) + 0.5) * i];
      return p += O[0], M += O[1], O;
    });
    p /= f.length, M /= f.length;
    let u = 0, x = 0, S = 0;
    for (const $ of f) {
      const O = $[0] - p, P = $[1] - M;
      u += O * O, x += P * P, S += O * P;
    }
    const b = 0.5 * Math.atan2(2 * S, u - x), v = Math.cos(b), w = Math.sin(b), T = -w, D = v, W = /* @__PURE__ */ new Map(), R = Math.max(i, s * 1.22);
    for (const $ of f) {
      const O = $[0] - p, P = $[1] - M, A = O * v + P * w, U = O * T + P * D, X = Math.round(U / R), q = W.get(X);
      q ? (q.min = Math.min(q.min, A), q.max = Math.max(q.max, A), q.v += U, q.count++) : W.set(X, { min: A, max: A, v: U, count: 1 });
    }
    for (const $ of [...W.values()].sort((O, P) => O.v / O.count - P.v / P.count)) {
      let O = $.min + s * 0.65, P = $.max - s * 0.65;
      if ($.count < 2 || P - O < s * 1.65) continue;
      const A = $.v / $.count, U = r.between(-0.1, 0.1) * s, X = [];
      for (let B = 0; B <= 6; B++) {
        const pt = B / 6, at = O + (P - O) * pt, wt = Math.sin(Math.PI * pt) * U, lt = p + v * at + T * (A + wt), ct = M + w * at + D * (A + wt);
        X.push([lt, ct]);
      }
      const q = s * 1.1;
      X.some((B) => B[0] < q || B[0] > t - q || B[1] < q || B[1] > n - q) || y.push({ points: X, color: g.color });
    }
  }
  return y;
}
async function Zt(d, t, n, i = 420, e = "cover", s = "watercolor", l = "auto", r, o = {}) {
  const a = await Vt(d), m = Math.min(1, i / Math.max(a.width, a.height)), c = Math.max(24, Math.round(a.width * m)), h = Math.max(24, Math.round(a.height * m)), k = document.createElement("canvas");
  k.width = c, k.height = h;
  const y = k.getContext("2d", { willReadFrequently: !0 });
  y.drawImage(a, 0, 0, c, h);
  const g = y.getImageData(0, 0, c, h).data, p = { strokeEconomy: 0.72, shapeSimplification: 0.62, strokeLength: 0.58, strokeWidth: 0.58, boundaryFidelity: 0.72, detailBudget: 0.42, detailMultiplier: 1, sourceAccuracy: 0.65, detailPrecision: 0.78, strokeCurvature: 0.34, ...o }, M = 0.48 + p.strokeEconomy * 0.72, f = 1.55 - p.strokeEconomy * 0.77, u = 1.7 - p.strokeEconomy * 0.97, x = 0.65 + p.strokeLength * 0.6, S = 0.65 + p.strokeWidth * 0.6, b = Math.max(1, Math.min(10, p.detailMultiplier)), v = Math.max(0, Math.min(1, p.sourceAccuracy)), w = r ? await r({ data: new Uint8ClampedArray(g), width: c, height: h }) : Nt(g, c, h, l);
  if (w.length !== c * h) throw new Error(`detailMap returned ${w.length} weights; expected ${c * h}.`);
  const T = 1 - v * 0.52, D = vt(g, c, h, Math.round((6 + p.shapeSimplification * 7) * T)), W = vt(g, c, h, Math.round((3 + p.shapeSimplification * 5) * T)), R = vt(g, c, h, Math.round((2 + p.shapeSimplification * 2) * T)), $ = v > 0.86 ? new Uint8ClampedArray(g) : vt(g, c, h, 1), O = [It(R, c, h), It($, c, h), It(g, c, h)], P = new Jt(t), A = a.width / a.height, U = [], X = [], q = Math.min(c, h), B = Math.max(c, h) / 360;
  let pt = 0;
  const at = (E, V, ot, K, ft, Q, yt, Pt) => {
    const mt = Kt(V, c, h, ot * B, K, ft * B, Q, P);
    for (const rt of mt) {
      const I = pt++, Y = ft * B / q * P.between(0.92, 1.08);
      for (let Z = 1; Z < rt.points.length; Z++) {
        const H = rt.points[Z - 1], L = rt.points[Z];
        U.push({
          start: dt(H[0] / c, H[1] / h, A, n, e),
          end: dt(L[0] / c, L[1] / h, A, n, e),
          color: rt.color,
          radius: Y,
          opacity: yt * P.between(0.94, 1.06),
          water: Pt * P.between(0.92, 1.08),
          layer: E,
          strokeId: I
        });
      }
    }
    X.push(U.length);
  };
  s === "oil" ? (at(0, D, 9 * M, 3, 23 * S, 3, 0.68, 0), at(1, W, 6 * M, Math.round(5 - p.shapeSimplification), 15 * S, 4, 0.76, 0)) : (at(0, D, 9 * M, 3, 24 * S, 3, 0.027, 0.94), at(1, W, 6 * M, Math.round(5 - p.shapeSimplification), 15 * S, 4, 0.038, 0.78)), (s === "oil" ? [
    { data: R, field: 0, spacing: 21, radius: 8.6, length: 80, opacity: 0.8, water: 0, chance: 0.66, edgeOnly: !1 },
    { data: R, field: 0, spacing: 15, radius: 5.7, length: 58, opacity: 0.85, water: 0, chance: 0.58, edgeOnly: !1 },
    { data: $, field: 1, spacing: 10, radius: 3.3, length: 38, opacity: 0.9, water: 0, chance: 0.48, edgeOnly: !1 },
    { data: g, field: 2, spacing: 7, radius: 1.48, length: 16, opacity: 0.94, water: 0, chance: 0.98, edgeOnly: !0 }
  ] : [
    { data: R, field: 0, spacing: 20, radius: 8, length: 74, opacity: 0.052, water: 0.55, chance: 0.68, edgeOnly: !1 },
    { data: R, field: 0, spacing: 14, radius: 5.1, length: 52, opacity: 0.058, water: 0.43, chance: 0.6, edgeOnly: !1 },
    { data: $, field: 1, spacing: 9, radius: 2.8, length: 32, opacity: 0.063, water: 0.29, chance: 0.5, edgeOnly: !1 },
    { data: g, field: 2, spacing: 7, radius: 1.08, length: 13, opacity: 0.064, water: 0.14, chance: 0.98, edgeOnly: !0 }
  ]).forEach((E, V) => {
    const ot = V + 2, K = [], ft = V === 1 ? 1 + (b - 1) * 0.2 : V >= 2 ? b : 1, Q = E.spacing * B * M / Math.sqrt(ft), yt = E.radius * B * S / Math.pow(ft, 0.1), Pt = E.length * B * x, mt = P.between(0, Q), rt = /* @__PURE__ */ new Set();
    if (E.edgeOnly) {
      const I = [];
      for (let H = 0, L = mt; L < h; H++, L += Q) for (let et = 0, j = mt; j < c; et++, j += Q) {
        const G = Math.max(1, Math.min(c - 2, Math.round(j))), _ = Math.max(1, Math.min(h - 2, Math.round(L))), kt = O[E.field], it = Math.hypot(kt.gx[_ * c + G], kt.gy[_ * c + G]), gt = Math.max(0, Math.min(1, w[_ * c + G]));
        it > 0.08 && gt > 0.25 + p.detailPrecision * 0.22 && I.push({ key: H * 1e5 + et, score: Math.pow(gt, 2 + p.detailPrecision * 4) * (0.22 + Math.min(0.8, it)) });
      }
      I.sort((H, L) => L.score - H.score);
      const Y = s === "oil" ? 36 : 44, Z = Math.round(Y * (0.25 + p.detailBudget * 1.8) * u * b);
      I.slice(0, Z).forEach((H) => rt.add(H.key));
    }
    for (let I = 0, Y = mt; Y < h; I++, Y += Q) for (let Z = 0, H = mt; H < c; Z++, H += Q) {
      if (E.edgeOnly && !rt.has(I * 1e5 + Z)) continue;
      const L = H + P.between(-Q * 0.46, Q * 0.46), et = Y + P.between(-Q * 0.46, Q * 0.46), j = Math.max(1, Math.min(c - 2, Math.round(L))), G = Math.max(1, Math.min(h - 2, Math.round(et))), _ = Math.max(0, Math.min(1, w[G * c + j])), kt = V < 2 ? 0.7 + _ * 0.32 : V === 2 ? 0.58 + _ * 0.5 : 0.15 + _ * 1.35;
      if (P.next() > Math.min(1, E.chance * f * kt)) continue;
      const it = O[E.field], gt = Math.hypot(it.gx[G * c + j], it.gy[G * c + j]);
      if (E.edgeOnly && (gt < 0.15 || P.next() > Math.min(1, gt * 2.1)) || s === "oil" && it.luma[G * c + j] > 0.76 && gt < 0.07 && ot < 5) continue;
      let N = -it.gy[G * c + j], J = it.gx[G * c + j];
      const Ct = Math.hypot(N, J);
      if (Ct < 0.015) {
        const C = s === "oil" ? 0.1 + Math.sin(L * 0.018 + t) * 0.2 + Math.cos(et * 0.016 - t * 0.7) * 0.16 : P.next() * Math.PI;
        N = Math.cos(C), J = Math.sin(C);
      } else
        N /= Ct, J /= Ct;
      if (s === "oil") {
        const C = [0.08, -0.38, 0.1, -0.18, 0.22, 0, 0], tt = [0.76, 0.56, 0.48, 0.38, 0.24, 0.08, 0], z = tt[ot], nt = C[ot];
        N = N * (1 - z) + Math.cos(nt) * z, J = J * (1 - z) + Math.sin(nt) * z;
        const ut = Math.max(1e-3, Math.hypot(N, J));
        N /= ut, J /= ut;
      }
      const Ft = V >= 3 ? 1.16 - _ * 0.38 : 1, Tt = Pt * Ft * P.between(s === "oil" ? 0.84 : 0.72, s === "oil" ? 1.18 : 1.28), $t = ot >= 5 ? 2 : s === "oil" ? 6 : 5, ht = [], Mt = Lt(E.data, c, h, L, et), zt = [0.3, 0.26, 0.2, 0.14, 0.1][V] * (1.3 - p.boundaryFidelity * 0.55) * (1.22 - v * 0.42), At = (C) => {
        let tt = 0, z = 0;
        for (let nt = 3; nt <= Tt * 0.5; nt += 3) {
          const ut = L + N * nt * C, Wt = et + J * nt * C;
          if (ut < 1 || ut >= c - 1 || Wt < 1 || Wt >= h - 1) break;
          const Rt = Lt(E.data, c, h, ut, Wt);
          if (Math.hypot(Rt[0] - Mt[0], Rt[1] - Mt[1], Rt[2] - Mt[2]) > zt) {
            if (++z >= 2) break;
          } else
            tt = nt, z = 0;
        }
        return tt;
      }, xt = At(-1), Ot = At(1);
      if (xt + Ot < Math.max(E.radius * 2.4, Tt * 0.28)) continue;
      const qt = (s === "oil" ? 0.055 : 0.12) * (0.35 + p.strokeCurvature * 1.9), Ut = P.between(-qt, qt);
      for (let C = 0; C <= $t; C++) {
        const tt = -xt + (xt + Ot) * C / $t, z = Math.sin(C / $t * Math.PI) * Ut * (xt + Ot);
        ht.push([L + N * tt - J * z, et + J * tt + N * z]);
      }
      const bt = yt * Ft * (s === "oil" ? 3.2 : 1.45);
      if (ht.some((C) => C[0] < bt || C[0] > c - bt || C[1] < bt || C[1] > h - bt)) continue;
      const Qt = E.edgeOnly ? Mt.map((C) => C * 0.8) : Mt, Bt = [], Xt = pt++;
      for (let C = 1; C < ht.length; C++) {
        const tt = dt(ht[C - 1][0] / c, ht[C - 1][1] / h, A, n, e), z = dt(ht[C][0] / c, ht[C][1] / h, A, n, e);
        Bt.push({ start: tt, end: z, color: Qt, radius: yt * Ft / q * P.between(0.88, 1.12), opacity: E.opacity * (0.88 + _ * 0.18) * P.between(0.9, 1.1), water: E.water * P.between(0.85, 1.15), layer: ot, strokeId: Xt });
      }
      K.push(Bt);
    }
    for (let I = K.length - 1; I > 0; I--) {
      const Y = Math.floor(P.next() * (I + 1));
      [K[I], K[Y]] = [K[Y], K[I]];
    }
    K.forEach((I) => U.push(...I)), X.push(U.length);
  });
  const lt = dt(0, 0, A, n, e), ct = dt(1, 1, A, n, e);
  return { segments: U, sourceAspect: A, layerEnds: X, bounds: [Math.min(lt[0], ct[0]), Math.min(lt[1], ct[1]), Math.max(lt[0], ct[0]), Math.max(lt[1], ct[1])] };
}
const _t = {
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
  detailMultiplier: 1,
  sourceAccuracy: 0.65,
  detailPrecision: 0.78,
  detailDelay: 0.82,
  strokeCurvature: 0.34,
  paintLoad: 0.7,
  dryBrush: 0.2,
  bristleStrength: 0.58,
  gloss: 0.48
}, F = (d, t = 0, n = 1) => Math.min(n, Math.max(t, d)), Dt = () => Math.random() * 1e4, te = (d, [t, n, i, e]) => {
  const s = (a, m, c) => 3 * (1 - a) * (1 - a) * a * m + 3 * (1 - a) * a * a * c + a * a * a, l = (a, m, c) => 3 * (1 - a) * (1 - a) * m + 6 * (1 - a) * a * (c - m) + 3 * a * a * (1 - c), r = F(d);
  let o = r;
  for (let a = 0; a < 5; a++) {
    const m = l(o, t, i);
    if (Math.abs(m) < 1e-5) break;
    o = F(o - (s(o, t, i) - r) / m);
  }
  return F(s(o, n, e));
};
class Ht {
  constructor(t) {
    this.state = t, this.state = t * 1000003 | 0 || 1;
  }
  state;
  next() {
    let t = this.state;
    return t ^= t << 13, t ^= t >>> 17, t ^= t << 5, this.state = t | 0, (t >>> 0) / 4294967296;
  }
}
class se {
  constructor(t, n = {}) {
    this.canvas = t;
    const i = t.getContext("2d", { alpha: !1 });
    if (!i) throw new Error("watercolor-timelapse requires a 2D canvas context.");
    this.context = i, this.options = { ..._t, ...n }, this.seed = n.seed ?? Dt(), this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(t), this.resize();
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
  timelineWork = new Float64Array([0]);
  imageRequest = 0;
  async setImage(t) {
    const n = ++this.imageRequest;
    this.source = t, this.stopTimeline(), this.cancelCompletion(), this.cancelScrub(), this.progressState.progress = 0, this.resetPainting(), this.options.onProgress?.(0), this.setPhase("analyzing");
    const i = 1 + (Math.sqrt(F(this.options.detailMultiplier, 1, 10)) - 1) * (0.35 + F(this.options.sourceAccuracy) * 0.65), e = Math.min(720, Math.round(this.options.analysisResolution * i)), s = await Zt(t, this.seed, this.canvasAspect(), e, this.options.imageFit, this.options.mode, this.options.detailFocus, this.options.detailMap, {
      strokeEconomy: this.options.strokeEconomy,
      shapeSimplification: this.options.shapeSimplification,
      strokeLength: this.options.strokeLength,
      strokeWidth: this.options.strokeWidth,
      boundaryFidelity: this.options.boundaryFidelity,
      detailBudget: this.options.detailBudget,
      detailMultiplier: this.options.detailMultiplier,
      sourceAccuracy: this.options.sourceAccuracy,
      detailPrecision: this.options.detailPrecision,
      strokeCurvature: this.options.strokeCurvature
    });
    this.destroyed || n !== this.imageRequest || (this.plan = s, this.buildTimelineWork(), this.canvas.dataset.watercolorSegments = String(this.plan.segments.length), this.canvas.dataset.watercolorLayerEnds = this.plan.layerEnds.join(","), this.clearCheckpoints(), this.resetPainting(), this.setPhase("painting"));
  }
  play() {
    if (!this.plan || this.timeline?.isActive()) return;
    if (this.progressState.progress >= 1) {
      this.restart();
      return;
    }
    this.stopTimeline(), this.cancelCompletion(), this.cancelScrub();
    const t = 1 - this.progressState.progress;
    this.timeline = Yt.to(this.progressState, {
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
  restart(t = Dt()) {
    if (this.stopTimeline(), this.cancelCompletion(), this.cancelScrub(), this.seed = t, this.progressState.progress = 0, this.resetPainting(), this.options.onProgress?.(0), this.source) {
      const n = this.setImage(this.source), i = this.imageRequest;
      n.then(() => {
        i === this.imageRequest && (this.stopTimeline(), this.play());
      });
    }
  }
  seek(t) {
    this.stopTimeline(), this.cancelCompletion(), this.progressState.progress = F(t), this.scrubTarget = this.targetSegment(this.progressState.progress), this.scheduleScrub(), this.options.onProgress?.(this.progressState.progress);
  }
  setOptions(t) {
    const n = t.mode !== void 0 && t.mode !== this.options.mode, i = t.detailFocus !== void 0 && t.detailFocus !== this.options.detailFocus || t.detailMap !== void 0 && t.detailMap !== this.options.detailMap, e = n || i || ["analysisResolution", "strokeEconomy", "shapeSimplification", "strokeLength", "strokeWidth", "boundaryFidelity", "detailBudget", "detailMultiplier", "sourceAccuracy", "detailPrecision", "strokeCurvature"].some((o) => t[o] !== void 0), s = t.paperColor !== void 0 || t.paperRoughness !== void 0 || t.granulation !== void 0 || t.bloom !== void 0 || t.transparency !== void 0 || t.paintLoad !== void 0 || t.dryBrush !== void 0 || t.bristleStrength !== void 0 || t.gloss !== void 0 || t.renderQuality !== void 0, l = this.progressState.progress, r = !!this.timeline?.isActive();
    if (Object.assign(this.options, t), t.seed !== void 0) {
      this.restart(t.seed);
      return;
    }
    if (e && this.source) {
      const o = this.setImage(this.source), a = this.imageRequest;
      o.then(() => {
        a === this.imageRequest && (this.seek(l), r && this.play());
      });
      return;
    }
    if (t.pixelRatio !== void 0) {
      this.resize();
      return;
    }
    s ? (this.createPaper(), this.rebuildToAsync(this.targetSegment(this.progressState.progress))) : this.compose();
  }
  capture(t = "image/png", n = 0.92) {
    return this.canvas.toDataURL(t, n);
  }
  updatePainting() {
    const t = this.targetSegment(this.progressState.progress);
    t > this.drawnSegments && this.depositBudget(t, !0), this.advanceWetMarks(), this.compose(), this.setPhase(this.progressState.progress > 0.94 ? "drying" : "painting"), this.options.onProgress?.(this.progressState.progress);
  }
  targetSegment(t) {
    if (!this.plan || t <= 0) return 0;
    if (t >= 1) return this.plan.segments.length;
    const n = this.timelineWork[this.timelineWork.length - 1], i = n * F(t);
    let e = 1, s = this.timelineWork.length - 1;
    for (; e < s; ) {
      const o = e + s >>> 1;
      this.timelineWork[o] < i ? e = o + 1 : s = o;
    }
    const l = this.timelineWork[e - 1], r = Math.max(1e-9, this.timelineWork[e] - l);
    return e - 1 + (i - l) / r;
  }
  buildTimelineWork() {
    if (!this.plan) {
      this.timelineWork = new Float64Array([0]);
      return;
    }
    const t = this.plan.segments, n = new Float64Array(t.length + 1);
    let i = -1;
    for (let e = 0; e < t.length; e++) {
      const s = t[e], l = Math.hypot(s.end[0] - s.start[0], s.end[1] - s.start[1]), r = s.strokeId === i ? 0 : this.options.mode === "oil" ? 65e-4 : 5e-3;
      n[e + 1] = n[e] + Math.max(4e-4, l) + r, i = s.strokeId;
    }
    this.timelineWork = n, this.canvas.dataset.watercolorTimelineWork = n[n.length - 1].toFixed(3);
  }
  strokeEnd(t) {
    if (!this.plan || t >= this.plan.segments.length) return t;
    const n = this.plan.segments[t].strokeId;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === n; ) t++;
    return t;
  }
  partialStroke(t, n) {
    const i = F(n) * t.length, e = Math.floor(i), s = i - e, l = t.slice(0, e);
    if (s > 0 && e < t.length) {
      const r = t[e];
      l.push({ ...r, end: [r.start[0] + (r.end[0] - r.start[0]) * s, r.start[1] + (r.end[1] - r.start[1]) * s] });
    }
    return l;
  }
  strokeRevealSpan(t) {
    if (!this.plan) return t;
    const n = this.plan.segments.length / Math.max(0.1, this.options.duration) * Math.max(0.1, this.options.speed);
    return Math.max(t, n * Math.max(0.025, this.options.strokeDuration));
  }
  paintNextStroke(t, n = !1, i = this.pigmentContext, e = 1) {
    if (!this.plan) return t;
    const s = this.plan.segments[t].strokeId, l = t;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === s; ) t++;
    const r = this.plan.segments.slice(l, t), o = e >= 1 ? r : this.partialStroke(r, e);
    return this.options.mode === "oil" ? this.paintOilStroke(o, s, i) : (this.paintWatercolorStroke(o, s, 0, i), e >= 1 && i === this.pigmentContext && n && s % 3 === 0 && this.wetMarks.push({ segments: r, strokeId: s, age: 0 })), t;
  }
  renderLiveStrokes(t) {
    if (this.livePaintContext.clearRect(0, 0, this.width, this.height), !this.plan) return;
    let n = this.drawnSegments, i = 0, e = 0, s = 0;
    const l = Math.max(4, Math.min(18, Math.round(this.options.strokesPerFrame * 0.65)));
    for (; n < this.plan.segments.length && i < l && e < 64; ) {
      const r = this.strokeEnd(n), o = this.strokeRevealSpan(r - n), a = (t - (r - o)) / o;
      if (a > 0) {
        const m = te(F(a), this.options.strokeEase);
        s = m, this.paintNextStroke(n, !1, this.livePaintContext, m), i++;
      }
      n = r, e++;
    }
    this.canvas.dataset.watercolorActiveStrokes = String(i), this.canvas.dataset.watercolorStrokeProgress = s.toFixed(3);
  }
  depositBudget(t, n = !1, i = this.options.mode === "oil" ? 7 : 8) {
    const e = performance.now(), s = Math.max(1, Math.round(this.options.strokesPerFrame));
    let l = 0, r = this.drawnSegments;
    for (this.canvas.dataset.watercolorTargetSegment = t.toFixed(2); this.plan && r < this.plan.segments.length && this.strokeEnd(r) <= t && l < s && (l === 0 || performance.now() - e < i); )
      r = this.paintNextStroke(r, n), l++;
    return this.drawnSegments = r, this.renderLiveStrokes(t), n || this.maybeCheckpoint(), this.cpuPaintMs += performance.now() - e, this.plan && r >= this.plan.segments.length && (this.canvas.dataset.watercolorCpuMs = this.cpuPaintMs.toFixed(1)), !this.plan || r >= this.plan.segments.length || this.strokeEnd(r) > t;
  }
  cancelCompletion() {
    this.timelineFinished = !1, this.completionFrame && (cancelAnimationFrame(this.completionFrame), this.completionFrame = 0);
  }
  stopTimeline() {
    this.timeline?.kill(), this.timeline = void 0;
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
  paintOilStroke(t, n, i = this.pigmentContext) {
    if (!t.length) return;
    const e = new Ht(this.seed + n * 31.77), s = t[0], l = this.qualityFactor(), r = [s.start, ...t.map((v) => v.end)].map((v) => [v[0] * this.width, v[1] * this.height]);
    let o = this.smoothPath(r, 5);
    const a = e.next();
    let m = "loaded";
    const c = F(this.options.dryBrush);
    if (s.layer >= 6 ? m = a < 0.45 + c * 0.4 ? "tap" : "dry" : s.layer === 5 ? m = a < 0.12 + c * 0.42 ? "tap" : a < 0.24 + c * 0.52 ? "dry" : "loaded" : (s.layer === 4 && a < 0.05 + c * 0.35 || a < 0.02 + c * 0.25) && (m = "dry"), m === "tap") {
      const v = Math.floor(o.length * 0.34), w = Math.ceil(o.length * 0.66);
      o = o.slice(v, w);
    }
    const h = Math.max(0.7, s.radius * this.height), k = s.color.map((v) => Math.round(F(v) * 255)), y = this.mixProfile(o, k), g = this.averageColors(y), p = F(s.opacity) * (0.55 + this.options.paintLoad * 0.65) * (m === "dry" ? 0.62 : 1), M = 0.45 + this.options.granulation * 0.85, f = g.map((v) => Math.round(v * 0.55)), u = g.map((v) => Math.round(v + (255 - v) * 0.42));
    if (i.save(), i.lineCap = "round", i.lineJoin = "round", this.plan) {
      const [v, w, T, D] = this.plan.bounds;
      i.beginPath(), i.rect(v * this.width, w * this.height, (T - v) * this.width, (D - w) * this.height), i.clip();
    }
    i.globalCompositeOperation = "source-over", i.fillStyle = `rgba(${f[0]},${f[1]},${f[2]},${0.1 * p * M})`, i.filter = l < 0.5 ? "none" : `blur(${Math.min(2.2, h * 0.055)}px)`, this.fillOilBody(i, this.offsetPath(o, h * 0.14 * M, h * 0.16 * M), h * (1 + 0.07 * M), m, e.next() * 9), i.fill(), i.filter = "none";
    const x = this.oilGradient(i, o, y, 0.36 * p);
    i.fillStyle = x, i.filter = l < 0.5 ? "none" : `blur(${Math.min(1.35, h * 0.035)}px)`, this.fillOilBody(i, o, h * 1.035, m, e.next() * 9), i.fill(), i.filter = "none", i.fillStyle = this.oilGradient(i, o, y, (m === "dry" ? 0.58 : 0.9) * p), this.fillOilBody(i, o, h * 0.92, m, e.next() * 9), i.fill();
    const S = F(this.options.bristleStrength), b = Math.max(2, Math.min(m === "dry" ? 18 : 14, Math.round(h * (m === "dry" ? 0.82 : 0.52) * (0.25 + S) * l)));
    for (let v = 0; v < b; v++) {
      const w = (v / (b - 1) - 0.5) * h * 1.72 + (e.next() - 0.5) * h * 0.1;
      if (m === "dry" && e.next() < 0.28) continue;
      const T = y[Math.min(y.length - 1, Math.floor(e.next() * y.length))], D = (v / (b - 1) - 0.5) * 0.16 + (e.next() - 0.5) * 0.06, W = T.map((R) => Math.round(F(R / 255 + D) * 255));
      i.strokeStyle = `rgba(${W[0]},${W[1]},${W[2]},${(0.06 + e.next() * 0.22) * S})`, i.lineWidth = Math.max(0.3, h * (0.022 + e.next() * 0.052)), this.strokePath(i, this.offsetPath(o, w, 0)), i.stroke();
    }
    i.globalCompositeOperation = "screen", i.strokeStyle = `rgba(${u[0]},${u[1]},${u[2]},${0.28 * p * M * this.options.gloss})`, i.lineWidth = Math.max(0.45, h * 0.13 * M), this.strokePath(i, this.offsetPath(o, -h * 0.58 * M, -h * 0.05 * M)), i.stroke(), i.globalCompositeOperation = "multiply", i.strokeStyle = `rgba(${f[0]},${f[1]},${f[2]},${0.12 * p * M})`, i.lineWidth = Math.max(0.4, h * 0.1 * M), this.strokePath(i, this.offsetPath(o, h * 0.62 * M, h * 0.04 * M)), i.stroke(), this.paintOilSurface(i, o, h, y, e, M, p), i.globalCompositeOperation = "source-over", m === "loaded" && e.next() < 0.12 + this.options.paintLoad * 0.34 && this.paintOilTrails(i, o, h, g, e, p), i.restore();
  }
  mixProfile(t, n) {
    return (this.options.renderQuality === "fast" ? [0, 0.5, 1] : this.options.renderQuality === "balanced" ? [0, 0.33, 0.67, 1] : [0, 0.25, 0.5, 0.75, 1]).map((e) => {
      const s = Math.min(t.length - 1, Math.round((t.length - 1) * e)), l = t[s], r = this.pigmentContext.getImageData(F(Math.round(l[0]), 0, this.width - 1), F(Math.round(l[1]), 0, this.height - 1), 1, 1).data;
      if (r[3] <= 18) return n;
      const o = F(r[3] / 255 * (0.12 + this.options.bloom * 0.4), 0.06, 0.46);
      return n.map((a, m) => Math.round(Math.exp(Math.log(Math.max(1, a)) * (1 - o) + Math.log(Math.max(1, r[m])) * o)));
    });
  }
  averageColors(t) {
    return [0, 1, 2].map((n) => Math.round(t.reduce((i, e) => i + e[n], 0) / t.length));
  }
  oilGradient(t, n, i, e) {
    const s = n[0], l = n[n.length - 1], r = t.createLinearGradient(s[0], s[1], l[0], l[1]);
    return i.forEach((o, a) => r.addColorStop(a / (i.length - 1), `rgba(${o[0]},${o[1]},${o[2]},${e})`)), r;
  }
  paintOilTrails(t, n, i, e, s, l) {
    if (n.length < 2) return;
    const r = n[n.length - 1], o = n[n.length - 2], a = r[0] - o[0], m = r[1] - o[1], c = Math.max(1, Math.hypot(a, m)), h = a / c, k = m / c, y = -k, g = h, p = s.next() < 0.7 ? 1 : 2;
    for (let M = 0; M < p; M++) {
      const f = M === 0 ? -1 : 1, u = f * i * (0.65 + s.next() * 0.24), x = i * (0.45 + s.next() * 0.85);
      t.strokeStyle = `rgba(${e[0]},${e[1]},${e[2]},${l * (0.2 + s.next() * 0.22)})`, t.lineWidth = Math.max(0.35, i * (0.045 + s.next() * 0.08)), this.strokePath(t, [[o[0] + y * u, o[1] + g * u], [r[0] + y * u, r[1] + g * u], [r[0] + y * u + h * x, r[1] + g * u + k * x]]), t.stroke();
    }
  }
  offsetPath(t, n, i) {
    return t.map((e, s) => {
      const l = t[Math.max(0, s - 1)], r = t[Math.min(t.length - 1, s + 1)], o = r[0] - l[0], a = r[1] - l[1], m = Math.max(1, Math.hypot(o, a));
      return [e[0] - a / m * n, e[1] + o / m * n + i];
    });
  }
  smoothPath(t, n) {
    if (t.length < 3) return t;
    const i = [];
    for (let e = 0; e < t.length - 1; e++) {
      const s = t[Math.max(0, e - 1)], l = t[e], r = t[e + 1], o = t[Math.min(t.length - 1, e + 2)];
      for (let a = 0; a < n; a++) {
        const m = a / n, c = m * m, h = c * m;
        i.push([
          0.5 * (2 * l[0] + (-s[0] + r[0]) * m + (2 * s[0] - 5 * l[0] + 4 * r[0] - o[0]) * c + (-s[0] + 3 * l[0] - 3 * r[0] + o[0]) * h),
          0.5 * (2 * l[1] + (-s[1] + r[1]) * m + (2 * s[1] - 5 * l[1] + 4 * r[1] - o[1]) * c + (-s[1] + 3 * l[1] - 3 * r[1] + o[1]) * h)
        ]);
      }
    }
    return i.push(t[t.length - 1]), i;
  }
  strokePath(t, n) {
    if (!(n.length < 2)) {
      t.beginPath(), t.moveTo(n[0][0], n[0][1]);
      for (let i = 1; i < n.length - 1; i++) {
        const e = [(n[i][0] + n[i + 1][0]) * 0.5, (n[i][1] + n[i + 1][1]) * 0.5];
        t.quadraticCurveTo(n[i][0], n[i][1], e[0], e[1]);
      }
      t.lineTo(n[n.length - 1][0], n[n.length - 1][1]);
    }
  }
  fillOilBody(t, n, i, e, s) {
    if (n.length < 2) return;
    const l = [], r = [];
    n.forEach((o, a) => {
      const m = n[Math.max(0, a - 1)], c = n[Math.min(n.length - 1, a + 1)], h = c[0] - m[0], k = c[1] - m[1], y = Math.max(1, Math.hypot(h, k)), g = a / (n.length - 1), p = Math.pow(Math.max(0, Math.sin(Math.PI * g)), e === "tap" ? 0.25 : 0.48), M = e === "dry" ? 0.12 : e === "tap" ? 0.3 : 0.24, f = (M + (1 - M) * p) * (1 + 0.065 * Math.sin(g * Math.PI * 5 + s) + 0.035 * Math.sin(g * Math.PI * 11 - s * 0.7)), u = -k / y * i * f, x = h / y * i * f;
      l.push([o[0] + u, o[1] + x]), r.push([o[0] - u, o[1] - x]);
    }), t.beginPath(), t.moveTo(l[0][0], l[0][1]);
    for (let o = 1; o < l.length; o++) t.lineTo(l[o][0], l[o][1]);
    for (let o = r.length - 1; o >= 0; o--) t.lineTo(r[o][0], r[o][1]);
    t.closePath();
  }
  paintOilSurface(t, n, i, e, s, l, r) {
    const o = this.qualityFactor(), a = Math.max(2, Math.min(30, Math.round(i * 0.48 * o)));
    t.globalCompositeOperation = "multiply";
    for (let m = 0; m < a; m++) {
      const c = Math.min(n.length - 2, Math.floor(s.next() * (n.length - 1))), h = n[c], k = n[c + 1], y = Math.atan2(k[1] - h[1], k[0] - h[0]), g = e[Math.floor(s.next() * e.length)];
      t.save(), t.translate(h[0] + (s.next() - 0.5) * i, h[1] + (s.next() - 0.5) * i), t.rotate(y), t.fillStyle = `rgba(${Math.round(g[0] * 0.62)},${Math.round(g[1] * 0.62)},${Math.round(g[2] * 0.62)},${0.025 * l * r})`, t.beginPath(), t.ellipse(0, 0, Math.max(0.4, i * (0.04 + s.next() * 0.12)), Math.max(0.3, i * (0.025 + s.next() * 0.06)), 0, 0, Math.PI * 2), t.fill(), t.restore();
    }
    t.globalCompositeOperation = "screen";
    for (let m = 0; m < Math.ceil(a * (0.1 + this.options.gloss * 0.55)); m++) {
      const c = Math.min(n.length - 2, Math.floor(s.next() * (n.length - 1))), h = n[c], k = n[c + 1], y = k[0] - h[0], g = k[1] - h[1], p = Math.max(1, Math.hypot(y, g)), M = -g / p, f = y / p, u = e[Math.floor(s.next() * e.length)], x = -i * (0.15 + s.next() * 0.45);
      t.strokeStyle = `rgba(${Math.round(u[0] + (255 - u[0]) * 0.72)},${Math.round(u[1] + (255 - u[1]) * 0.72)},${Math.round(u[2] + (255 - u[2]) * 0.72)},${0.085 * l * r * this.options.gloss})`, t.lineWidth = Math.max(0.35, i * 0.035), t.beginPath(), t.moveTo(h[0] + M * x, h[1] + f * x), t.lineTo(h[0] + M * x + y * 0.65, h[1] + f * x + g * 0.65), t.stroke();
    }
  }
  paintWatercolorStroke(t, n, i = 0, e = this.pigmentContext) {
    if (!t.length) return;
    const s = t[0], l = new Ht(this.seed + n * 19.41 + i * 997), r = this.qualityFactor(), o = [s.start, ...t.map((f) => f.end)].map((f) => this.flowPoint(f, s.radius, l)), a = this.smoothPath(o, 4), m = Math.max(0.45, s.radius * this.height), c = s.color.map((f) => Math.round(F(f) * 255)), h = s.opacity * (1 - this.options.transparency * 0.55) * (0.55 + this.options.paintLoad * 0.7), k = 1 + i * this.options.bloom * 0.34;
    if (e.save(), this.plan) {
      const [f, u, x, S] = this.plan.bounds;
      e.beginPath(), e.rect(f * this.width, u * this.height, (x - f) * this.width, (S - u) * this.height), e.clip();
    }
    const y = 0.92 - this.options.edgeDarkening * 0.2;
    e.fillStyle = `rgba(${Math.round(c[0] * y)},${Math.round(c[1] * y)},${Math.round(c[2] * y)},${h * (0.2 + this.options.edgeDarkening * 0.16 + i * 0.05)})`, e.filter = r < 0.5 ? "none" : `blur(${Math.min(3.2, m * 0.12)}px)`, this.fillOilBody(e, a, m * 1.2 * k, "loaded", l.next() * 8), e.fill(), e.filter = "none", e.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${h * 3.05})`, this.fillOilBody(e, a, m * 0.86, "loaded", l.next() * 8), e.fill();
    const g = F(this.options.bristleStrength), p = Math.max(1, Math.min(10, Math.round(m * 0.42 * (0.3 + g) * r)));
    for (let f = 0; f < p; f++) {
      if (l.next() < 0.18) continue;
      const u = (f / Math.max(1, p - 1) - 0.5) * m * 1.5 + (l.next() - 0.5) * m * 0.12;
      e.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${h * (0.2 + l.next() * 0.6) * g})`, e.lineWidth = Math.max(0.28, m * (0.025 + l.next() * 0.07)), this.strokePath(e, this.offsetPath(a, u, 0)), e.stroke();
    }
    const M = Math.max(1, Math.min(9, Math.round(a.length * 0.24 * r)));
    for (let f = 0; f < M; f++) {
      const u = Math.min(a.length - 2, Math.floor(l.next() * (a.length - 1))), x = a[u], S = a[u + 1], b = S[0] - x[0], v = S[1] - x[1], w = Math.max(1, Math.hypot(b, v)), T = -v / w, D = b / w, W = (l.next() - 0.5) * m * 1.35;
      this.paperHeight(x[0], x[1]) < 0.5 && (e.fillStyle = `rgba(${Math.round(c[0] * 0.64)},${Math.round(c[1] * 0.64)},${Math.round(c[2] * 0.64)},${h * (0.18 + l.next() * 0.25)})`, e.beginPath(), e.arc(x[0] + T * W, x[1] + D * W, Math.max(0.3, m * (0.025 + l.next() * 0.07)), 0, Math.PI * 2), e.fill());
    }
    e.globalCompositeOperation = "destination-out", e.fillStyle = `rgba(0,0,0,${0.02 + 0.035 * this.options.paperRoughness})`;
    for (let f = 0; f < Math.min(6, M); f++) {
      const u = a[Math.floor(l.next() * a.length)];
      this.paperHeight(u[0], u[1]) > 0.56 && (e.beginPath(), e.arc(u[0] + (l.next() - 0.5) * m, u[1] + (l.next() - 0.5) * m, Math.max(0.25, m * (0.018 + l.next() * 0.045)), 0, Math.PI * 2), e.fill());
    }
    e.restore();
  }
  flowPoint(t, n, i) {
    const e = t[0] * this.width, s = t[1] * this.height, l = 2, r = this.paperHeight(e + l, s) - this.paperHeight(e - l, s), o = this.paperHeight(e, s + l) - this.paperHeight(e, s - l), a = this.options.bloom * n * this.height * 1.8;
    return [e - r * a + (i.next() - 0.5) * a * 0.08, s - o * a + (i.next() - 0.5) * a * 0.08];
  }
  paperHeight(t, n) {
    const i = this.seed * 0.013;
    return 0.5 + 0.22 * Math.sin(t * 0.021 + i) * Math.sin(n * 0.027 - i * 0.7) + 0.16 * Math.sin(t * 0.083 + n * 0.017 + i * 2.1) + 0.1 * Math.cos(n * 0.14 - t * 0.031 - i);
  }
  advanceWetMarks() {
    const t = [];
    for (const n of this.wetMarks)
      n.age++, (n.age === 2 || n.age === 5) && this.paintWatercolorStroke(n.segments, n.strokeId, n.age / 5), n.age < 6 && t.push(n);
    this.wetMarks = t;
  }
  compose() {
    this.context.save(), this.context.globalCompositeOperation = "source-over", this.context.drawImage(this.paper, 0, 0), this.context.globalCompositeOperation = this.options.mode === "oil" ? "source-over" : "multiply", this.context.globalAlpha = this.options.mode === "oil" ? 1 : 0.96, this.context.drawImage(this.pigment, 0, 0), this.context.drawImage(this.livePaint, 0, 0), this.context.restore();
  }
  createPaper() {
    this.paper.width = this.width, this.paper.height = this.height;
    const t = this.hex(this.options.paperColor), n = this.paperContext.createImageData(this.width, this.height), i = n.data;
    for (let e = 0; e < this.height; e++) for (let s = 0; s < this.width; s++) {
      const l = (e * this.width + s) * 4, r = this.paperHeight(s, e) - 0.5, o = Math.sin(e * 0.72 + s * 0.035 + this.seed) * 0.5, a = (r * 0.085 + o * 0.012) * this.options.paperRoughness;
      i[l] = F(t[0] / 255 + a) * 255, i[l + 1] = F(t[1] / 255 + a) * 255, i[l + 2] = F(t[2] / 255 + a) * 255, i[l + 3] = 255;
    }
    this.paperContext.putImageData(n, 0, 0), this.compose();
  }
  qualityFactor() {
    return this.options.renderQuality === "fast" ? 0.38 : this.options.renderQuality === "balanced" ? 0.68 : 1;
  }
  clearCheckpoints() {
    this.checkpoints = [];
  }
  maybeCheckpoint() {
    if (!this.plan || this.drawnSegments >= this.plan.segments.length) return;
    const t = Math.max(1, Math.ceil(this.plan.segments.length / 6)), n = this.checkpoints[this.checkpoints.length - 1];
    if (this.drawnSegments - (n?.segment ?? 0) < t) return;
    const i = document.createElement("canvas");
    i.width = this.width, i.height = this.height, i.getContext("2d").drawImage(this.pigment, 0, 0), this.checkpoints.push({ segment: this.drawnSegments, surface: i });
  }
  restoreCheckpoint(t) {
    for (let n = this.checkpoints.length - 1; n >= 0; n--) {
      const i = this.checkpoints[n];
      if (!(i.segment > t))
        return this.pigmentContext.clearRect(0, 0, this.width, this.height), this.pigmentContext.drawImage(i.surface, 0, 0), this.drawnSegments = i.segment, this.wetMarks = [], !0;
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
    const t = Math.max(1, this.canvas.clientWidth || this.canvas.width), n = Math.max(1, this.canvas.clientHeight || this.canvas.height), i = Math.min(window.devicePixelRatio || 1, this.options.pixelRatio), e = Math.min(1400, Math.round(t * i)), s = Math.min(1400, Math.round(n * i));
    e === this.width && s === this.height || (this.width = e, this.height = s, this.canvas.width = e, this.canvas.height = s, this.pigment.width = e, this.pigment.height = s, this.livePaint.width = e, this.livePaint.height = s, this.clearCheckpoints(), this.createPaper(), this.plan && this.rebuildToAsync(this.targetSegment(this.progressState.progress)));
  }
  hex(t) {
    const n = t.replace("#", ""), i = n.length === 3 ? n.split("").map((s) => s + s).join("") : n, e = parseInt(i, 16);
    return [e >> 16 & 255, e >> 8 & 255, e & 255];
  }
  canvasAspect() {
    return Math.max(1, this.canvas.clientWidth || this.canvas.width) / Math.max(1, this.canvas.clientHeight || this.canvas.height);
  }
  setPhase(t) {
    this.phase !== t && (this.phase = t, this.options.onPhaseChange?.(t));
  }
  destroy() {
    this.destroyed = !0, this.imageRequest++, this.stopTimeline(), this.cancelCompletion(), this.cancelScrub(), this.clearCheckpoints(), this.resizeObserver.disconnect(), delete this.canvas.dataset.watercolorSegments, delete this.canvas.dataset.watercolorLayerEnds, delete this.canvas.dataset.watercolorTargetSegment, delete this.canvas.dataset.watercolorCpuMs, delete this.canvas.dataset.watercolorActiveStrokes, delete this.canvas.dataset.watercolorStrokeProgress, delete this.canvas.dataset.watercolorTimelineWork;
  }
}
export {
  se as W
};
