import jt from "gsap";
const wt = (u, t = 0, n = 1) => Math.max(t, Math.min(n, u));
function Gt(u, t) {
  const n = u[t], i = u[t + 1], e = u[t + 2], s = Math.max(n, i, e), h = Math.min(n, i, e), a = 128 - 0.168736 * n - 0.331264 * i + 0.5 * e, o = 128 + 0.5 * n - 0.418688 * i - 0.081312 * e;
  return n < 48 || s - h < 12 || o < 128 || o > 181 || a < 72 || a > 137 ? 0 : wt((n - i + 18) / 70) * wt((o - 128) / 24) * wt((137 - a) / 28);
}
function st(u, t, n, i, e, s, h, a) {
  const o = Math.max(0, Math.floor(i - s * 2.5)), r = Math.min(t - 1, Math.ceil(i + s * 2.5)), m = Math.max(0, Math.floor(e - h * 2.5)), c = Math.min(n - 1, Math.ceil(e + h * 2.5));
  for (let l = m; l <= c; l++) for (let k = o; k <= r; k++) {
    const y = (k - i) / s, g = (l - e) / h, p = a * Math.exp(-(y * y + g * g) * 0.5), M = l * t + k;
    u[M] = Math.max(u[M], p);
  }
}
function Nt(u, t, n) {
  const i = Math.max(2, Math.round(Math.min(t, n) / 150)), e = Math.ceil(t / i), s = Math.ceil(n / i), h = new Uint8Array(e * s), a = new Uint8Array(e * s);
  for (let d = 0; d < s; d++) for (let x = 0; x < e; x++) {
    const w = Math.min(t - 1, Math.round((x + 0.5) * i)), b = Math.min(n - 1, Math.round((d + 0.5) * i));
    h[d * e + x] = Gt(u, (b * t + w) * 4) > 0.17 ? 1 : 0;
  }
  let o = [];
  for (let d = 0; d < h.length; d++) {
    if (a[d] || !h[d]) continue;
    const x = [], w = [d];
    for (a[d] = 1; w.length; ) {
      const b = w.pop(), v = b % e;
      x.push(b);
      for (const S of [b - 1, b + 1, b - e, b + e])
        S < 0 || S >= h.length || a[S] || !h[S] || Math.abs(S % e - v) > 1 || (a[S] = 1, w.push(S));
    }
    x.length > o.length && (o = x);
  }
  if (o.length < Math.max(18, h.length * 0.012)) return;
  let r = e, m = s, c = 0, l = 0;
  for (const d of o) {
    const x = d % e, w = Math.floor(d / e);
    r = Math.min(r, x), c = Math.max(c, x), m = Math.min(m, w), l = Math.max(l, w);
  }
  let k = r * i, y = Math.min(t, (c + 1) * i), g = m * i, p = Math.min(n, (l + 1) * i), M = y - k, f = p - g;
  if (f > M * 1.48 && (p = Math.min(p, g + M * 1.48)), f = p - g, !(M < t * 0.12 || f < n * 0.12))
    return k = Math.max(0, k - M * 0.13), y = Math.min(t, y + M * 0.13), g = Math.max(0, g - f * 0.18), p = Math.min(n, p + f * 0.08), { left: k, right: y, top: g, bottom: p, width: y - k, height: p - g };
}
function Et(u, t, n, i, e, s, h, a, o) {
  const r = [], m = Math.max(2, Math.round((e - i) * 0.055));
  for (let k = Math.max(m, Math.round(s)); k < Math.min(n - m, Math.round(h)); k += 2) for (let y = Math.max(m, Math.round(i)); y < Math.min(t - m, Math.round(e)); y += 2) {
    const g = (k * t + y) * 4, p = u[g] * 0.2126 + u[g + 1] * 0.7152 + u[g + 2] * 0.0722;
    let M = 0, f = 0;
    for (const [x, w] of [[-m, 0], [m, 0], [0, -m], [0, m]]) {
      const b = ((k + w) * t + y + x) * 4;
      M += u[b] * 0.2126 + u[b + 1] * 0.7152 + u[b + 2] * 0.0722, f++;
    }
    const d = M / f - p;
    d > 5 && r.push({ x: y, y: k, score: d });
  }
  r.sort((k, y) => y.score - k.score);
  const c = r.slice(0, Math.max(4, Math.ceil(r.length * 0.04)));
  if (!c.length) return { x: a, y: o };
  const l = c.reduce((k, y) => k + y.score, 0);
  return { x: c.reduce((k, y) => k + y.x * y.score, 0) / l, y: c.reduce((k, y) => k + y.y * y.score, 0) / l };
}
function Jt(u, t, n, i = "auto") {
  const e = new Float32Array(t * n);
  if (i === "uniform")
    return e.fill(1), e;
  const s = new Float32Array(t * n);
  for (let M = 0; M < s.length; M++) {
    const f = M * 4;
    s[M] = u[f] * 0.2126 + u[f + 1] * 0.7152 + u[f + 2] * 0.0722;
  }
  for (let M = 1; M < n - 1; M++) for (let f = 1; f < t - 1; f++) {
    const d = M * t + f, x = d * 4, w = Math.hypot(s[d + 1] - s[d - 1], s[d + t] - s[d - t]) / 255, b = (Math.max(u[x], u[x + 1], u[x + 2]) - Math.min(u[x], u[x + 1], u[x + 2])) / 255;
    e[d] = wt(0.08 + w * 1.45 + b * 0.1, 0, 0.48);
  }
  const h = Nt(u, t, n);
  if (!h) return e;
  const { left: a, right: o, top: r, bottom: m } = h, c = h.width, l = h.height, k = (a + o) * 0.5;
  st(e, t, n, k, r + l * 0.5, c * 0.48, l * 0.5, 0.58);
  const y = Et(u, t, n, a + c * 0.1, k - c * 0.03, r + l * 0.25, r + l * 0.53, a + c * 0.32, r + l * 0.4), g = Et(u, t, n, k + c * 0.03, o - c * 0.1, r + l * 0.25, r + l * 0.53, a + c * 0.68, r + l * 0.4);
  st(e, t, n, y.x, y.y, c * 0.105, l * 0.065, 1), st(e, t, n, g.x, g.y, c * 0.105, l * 0.065, 1), st(e, t, n, y.x, y.y - l * 0.09, c * 0.14, l * 0.045, 0.82), st(e, t, n, g.x, g.y - l * 0.09, c * 0.14, l * 0.045, 0.82), st(e, t, n, k, r + l * 0.59, c * 0.1, l * 0.16, 0.72);
  const p = Et(u, t, n, a + c * 0.25, o - c * 0.25, r + l * 0.62, r + l * 0.86, k, r + l * 0.75);
  return st(e, t, n, p.x, p.y, c * 0.18, l * 0.072, 0.96), st(e, t, n, k, r + l * 0.51, c * 0.55, l * 0.55, 0.62), e;
}
let Vt = class {
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
async function Kt(u) {
  if (typeof u != "string") return u;
  const t = new Image();
  return t.crossOrigin = "anonymous", t.src = u, await t.decode(), t;
}
function Lt(u, t, n, i, e) {
  i = Math.max(0, Math.min(t - 1, Math.round(i))), e = Math.max(0, Math.min(n - 1, Math.round(e)));
  const s = (e * t + i) * 4;
  return [u[s] / 255, u[s + 1] / 255, u[s + 2] / 255];
}
function ut(u, t, n, i, e) {
  let s = 1, h = 1;
  return e === "cover" ? n > i ? s = n / i : h = i / n : n > i ? h = i / n : s = n / i, [(u - 0.5) * s + 0.5, (t - 0.5) * h + 0.5];
}
function vt(u, t, n, i) {
  if (i <= 0) return new Uint8ClampedArray(u);
  const e = new Float32Array(u.length), s = new Uint8ClampedArray(u.length), h = i * 2 + 1;
  for (let a = 0; a < n; a++) for (let o = 0; o < 4; o++) {
    let r = 0;
    for (let m = -i; m <= i; m++) r += u[(a * t + Math.max(0, Math.min(t - 1, m))) * 4 + o];
    for (let m = 0; m < t; m++)
      e[(a * t + m) * 4 + o] = r / h, r -= u[(a * t + Math.max(0, m - i)) * 4 + o], r += u[(a * t + Math.min(t - 1, m + i + 1)) * 4 + o];
  }
  for (let a = 0; a < t; a++) for (let o = 0; o < 4; o++) {
    let r = 0;
    for (let m = -i; m <= i; m++) r += e[(Math.max(0, Math.min(n - 1, m)) * t + a) * 4 + o];
    for (let m = 0; m < n; m++)
      s[(m * t + a) * 4 + o] = r / h, r -= e[(Math.max(0, m - i) * t + a) * 4 + o], r += e[(Math.min(n - 1, m + i + 1) * t + a) * 4 + o];
  }
  return s;
}
function It(u, t, n) {
  const i = t * n, e = new Float32Array(i), s = new Float32Array(i), h = new Float32Array(i);
  for (let a = 0; a < i; a++) {
    const o = a * 4;
    e[a] = u[o] * 8337e-7 + u[o + 1] * 2805e-6 + u[o + 2] * 283e-6;
  }
  for (let a = 1; a < n - 1; a++) for (let o = 1; o < t - 1; o++) {
    const r = a * t + o;
    s[r] = -e[r - t - 1] - 2 * e[r - 1] - e[r + t - 1] + e[r - t + 1] + 2 * e[r + 1] + e[r + t + 1], h[r] = -e[r - t - 1] - 2 * e[r - t] - e[r - t + 1] + e[r + t - 1] + 2 * e[r + t] + e[r + t + 1];
  }
  return { luma: e, gx: s, gy: h };
}
function Zt(u, t, n, i, e, s, h, a) {
  const o = Math.ceil(t / i), r = Math.ceil(n / i), m = o * r, c = new Int16Array(m), l = new Uint8Array(m);
  for (let g = 0; g < r; g++) for (let p = 0; p < o; p++) {
    const M = Math.min(t - 1, Math.round((p + 0.5) * i)), f = Math.min(n - 1, Math.round((g + 0.5) * i)), d = (f * t + M) * 4, x = Math.min(e - 1, Math.floor(u[d] / 256 * e)), w = Math.min(e - 1, Math.floor(u[d + 1] / 256 * e)), b = Math.min(e - 1, Math.floor(u[d + 2] / 256 * e));
    c[g * o + p] = x + w * e + b * e * e;
  }
  const k = [];
  for (let g = 0; g < m; g++) {
    if (l[g]) continue;
    const p = c[g], M = [g], f = [];
    l[g] = 1;
    let d = 0, x = 0, w = 0;
    for (; M.length; ) {
      const b = M.pop(), v = b % o, S = Math.floor(b / o), A = Math.min(t - 1, Math.round((v + 0.5) * i)), D = Math.min(n - 1, Math.round((S + 0.5) * i)), R = (D * t + A) * 4;
      f.push(b), d += u[R], x += u[R + 1], w += u[R + 2];
      for (const W of [b - 1, b + 1, b - o, b + o]) {
        if (W < 0 || W >= m || l[W] || c[W] !== p) continue;
        const $ = W % o;
        Math.abs($ - v) > 1 || (l[W] = 1, M.push(W));
      }
    }
    if (f.length >= h) {
      const b = [d / f.length / 255, x / f.length / 255, w / f.length / 255], v = Math.max(...b), S = Math.min(...b);
      b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722 > 0.88 && v - S < 0.1 || k.push({ cells: f, color: b });
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
    let d = 0, x = 0, w = 0;
    for (const $ of f) {
      const O = $[0] - p, P = $[1] - M;
      d += O * O, x += P * P, w += O * P;
    }
    const b = 0.5 * Math.atan2(2 * w, d - x), v = Math.cos(b), S = Math.sin(b), A = -S, D = v, R = /* @__PURE__ */ new Map(), W = Math.max(i, s * 1.22);
    for (const $ of f) {
      const O = $[0] - p, P = $[1] - M, T = O * v + P * S, U = O * A + P * D, X = Math.round(U / W), q = R.get(X);
      q ? (q.min = Math.min(q.min, T), q.max = Math.max(q.max, T), q.v += U, q.count++) : R.set(X, { min: T, max: T, v: U, count: 1 });
    }
    for (const $ of [...R.values()].sort((O, P) => O.v / O.count - P.v / P.count)) {
      let O = $.min + s * 0.65, P = $.max - s * 0.65;
      if ($.count < 2 || P - O < s * 1.65) continue;
      const T = $.v / $.count, U = a.between(-0.1, 0.1) * s, X = [];
      for (let B = 0; B <= 6; B++) {
        const pt = B / 6, at = O + (P - O) * pt, St = Math.sin(Math.PI * pt) * U, lt = p + v * at + A * (T + St), ct = M + S * at + D * (T + St);
        X.push([lt, ct]);
      }
      const q = s * 1.1;
      X.some((B) => B[0] < q || B[0] > t - q || B[1] < q || B[1] > n - q) || y.push({ points: X, color: g.color });
    }
  }
  return y;
}
async function _t(u, t, n, i = 420, e = "cover", s = "watercolor", h = "auto", a, o = {}) {
  const r = await Kt(u), m = Math.min(1, i / Math.max(r.width, r.height)), c = Math.max(24, Math.round(r.width * m)), l = Math.max(24, Math.round(r.height * m)), k = document.createElement("canvas");
  k.width = c, k.height = l;
  const y = k.getContext("2d", { willReadFrequently: !0 });
  y.drawImage(r, 0, 0, c, l);
  const g = y.getImageData(0, 0, c, l).data, p = { strokeEconomy: 0.72, shapeSimplification: 0.62, strokeLength: 0.58, strokeWidth: 0.58, boundaryFidelity: 0.72, detailBudget: 0.42, detailMultiplier: 1, sourceAccuracy: 0.65, detailPrecision: 0.78, strokeCurvature: 0.34, ...o }, M = 0.48 + p.strokeEconomy * 0.72, f = 1.55 - p.strokeEconomy * 0.77, d = 1.7 - p.strokeEconomy * 0.97, x = 0.65 + p.strokeLength * 0.6, w = 0.65 + p.strokeWidth * 0.6, b = Math.max(1, Math.min(10, p.detailMultiplier)), v = Math.max(0, Math.min(1, p.sourceAccuracy)), S = a ? await a({ data: new Uint8ClampedArray(g), width: c, height: l }) : Jt(g, c, l, h);
  if (S.length !== c * l) throw new Error(`detailMap returned ${S.length} weights; expected ${c * l}.`);
  const A = 1 - v * 0.52, D = vt(g, c, l, Math.round((6 + p.shapeSimplification * 7) * A)), R = vt(g, c, l, Math.round((3 + p.shapeSimplification * 5) * A)), W = vt(g, c, l, Math.round((2 + p.shapeSimplification * 2) * A)), $ = v > 0.86 ? new Uint8ClampedArray(g) : vt(g, c, l, 1), O = [It(W, c, l), It($, c, l), It(g, c, l)], P = new Vt(t), T = r.width / r.height, U = [], X = [], q = Math.min(c, l), B = Math.max(c, l) / 360;
  let pt = 0;
  const at = (E, V, ot, K, ft, Q, yt, Pt) => {
    const mt = Zt(V, c, l, ot * B, K, ft * B, Q, P);
    for (const rt of mt) {
      const I = pt++, Y = ft * B / q * P.between(0.92, 1.08);
      for (let Z = 1; Z < rt.points.length; Z++) {
        const H = rt.points[Z - 1], L = rt.points[Z];
        U.push({
          start: ut(H[0] / c, H[1] / l, T, n, e),
          end: ut(L[0] / c, L[1] / l, T, n, e),
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
  s === "oil" ? (at(0, D, 9 * M, 3, 23 * w, 3, 0.68, 0), at(1, R, 6 * M, Math.round(5 - p.shapeSimplification), 15 * w, 4, 0.76, 0)) : (at(0, D, 9 * M, 3, 24 * w, 3, 0.027, 0.94), at(1, R, 6 * M, Math.round(5 - p.shapeSimplification), 15 * w, 4, 0.038, 0.78)), (s === "oil" ? [
    { data: W, field: 0, spacing: 21, radius: 8.6, length: 80, opacity: 0.8, water: 0, chance: 0.66, edgeOnly: !1 },
    { data: W, field: 0, spacing: 15, radius: 5.7, length: 58, opacity: 0.85, water: 0, chance: 0.58, edgeOnly: !1 },
    { data: $, field: 1, spacing: 10, radius: 3.3, length: 38, opacity: 0.9, water: 0, chance: 0.48, edgeOnly: !1 },
    { data: g, field: 2, spacing: 7, radius: 1.48, length: 16, opacity: 0.94, water: 0, chance: 0.98, edgeOnly: !0 }
  ] : [
    { data: W, field: 0, spacing: 20, radius: 8, length: 74, opacity: 0.052, water: 0.55, chance: 0.68, edgeOnly: !1 },
    { data: W, field: 0, spacing: 14, radius: 5.1, length: 52, opacity: 0.058, water: 0.43, chance: 0.6, edgeOnly: !1 },
    { data: $, field: 1, spacing: 9, radius: 2.8, length: 32, opacity: 0.063, water: 0.29, chance: 0.5, edgeOnly: !1 },
    { data: g, field: 2, spacing: 7, radius: 1.08, length: 13, opacity: 0.064, water: 0.14, chance: 0.98, edgeOnly: !0 }
  ]).forEach((E, V) => {
    const ot = V + 2, K = [], ft = V === 1 ? 1 + (b - 1) * 0.2 : V >= 2 ? b : 1, Q = E.spacing * B * M / Math.sqrt(ft), yt = E.radius * B * w / Math.pow(ft, 0.1), Pt = E.length * B * x, mt = P.between(0, Q), rt = /* @__PURE__ */ new Set();
    if (E.edgeOnly) {
      const I = [];
      for (let H = 0, L = mt; L < l; H++, L += Q) for (let et = 0, j = mt; j < c; et++, j += Q) {
        const G = Math.max(1, Math.min(c - 2, Math.round(j))), _ = Math.max(1, Math.min(l - 2, Math.round(L))), kt = O[E.field], it = Math.hypot(kt.gx[_ * c + G], kt.gy[_ * c + G]), gt = Math.max(0, Math.min(1, S[_ * c + G]));
        it > 0.08 && gt > 0.25 + p.detailPrecision * 0.22 && I.push({ key: H * 1e5 + et, score: Math.pow(gt, 2 + p.detailPrecision * 4) * (0.22 + Math.min(0.8, it)) });
      }
      I.sort((H, L) => L.score - H.score);
      const Y = s === "oil" ? 36 : 44, Z = Math.round(Y * (0.25 + p.detailBudget * 1.8) * d * b);
      I.slice(0, Z).forEach((H) => rt.add(H.key));
    }
    for (let I = 0, Y = mt; Y < l; I++, Y += Q) for (let Z = 0, H = mt; H < c; Z++, H += Q) {
      if (E.edgeOnly && !rt.has(I * 1e5 + Z)) continue;
      const L = H + P.between(-Q * 0.46, Q * 0.46), et = Y + P.between(-Q * 0.46, Q * 0.46), j = Math.max(1, Math.min(c - 2, Math.round(L))), G = Math.max(1, Math.min(l - 2, Math.round(et))), _ = Math.max(0, Math.min(1, S[G * c + j])), kt = V < 2 ? 0.7 + _ * 0.32 : V === 2 ? 0.58 + _ * 0.5 : 0.15 + _ * 1.35;
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
        const dt = Math.max(1e-3, Math.hypot(N, J));
        N /= dt, J /= dt;
      }
      const Ft = V >= 3 ? 1.16 - _ * 0.38 : 1, At = Pt * Ft * P.between(s === "oil" ? 0.84 : 0.72, s === "oil" ? 1.18 : 1.28), $t = ot >= 5 ? 2 : s === "oil" ? 6 : 5, ht = [], Mt = Lt(E.data, c, l, L, et), Ut = [0.3, 0.26, 0.2, 0.14, 0.1][V] * (1.3 - p.boundaryFidelity * 0.55) * (1.22 - v * 0.42), Tt = (C) => {
        let tt = 0, z = 0;
        for (let nt = 3; nt <= At * 0.5; nt += 3) {
          const dt = L + N * nt * C, Rt = et + J * nt * C;
          if (dt < 1 || dt >= c - 1 || Rt < 1 || Rt >= l - 1) break;
          const Wt = Lt(E.data, c, l, dt, Rt);
          if (Math.hypot(Wt[0] - Mt[0], Wt[1] - Mt[1], Wt[2] - Mt[2]) > Ut) {
            if (++z >= 2) break;
          } else
            tt = nt, z = 0;
        }
        return tt;
      }, xt = Tt(-1), Ot = Tt(1);
      if (xt + Ot < Math.max(E.radius * 2.4, At * 0.28)) continue;
      const qt = (s === "oil" ? 0.055 : 0.12) * (0.35 + p.strokeCurvature * 1.9), Qt = P.between(-qt, qt);
      for (let C = 0; C <= $t; C++) {
        const tt = -xt + (xt + Ot) * C / $t, z = Math.sin(C / $t * Math.PI) * Qt * (xt + Ot);
        ht.push([L + N * tt - J * z, et + J * tt + N * z]);
      }
      const bt = yt * Ft * (s === "oil" ? 3.2 : 1.45);
      if (ht.some((C) => C[0] < bt || C[0] > c - bt || C[1] < bt || C[1] > l - bt)) continue;
      const Xt = E.edgeOnly ? Mt.map((C) => C * 0.8) : Mt, Bt = [], Yt = pt++;
      for (let C = 1; C < ht.length; C++) {
        const tt = ut(ht[C - 1][0] / c, ht[C - 1][1] / l, T, n, e), z = ut(ht[C][0] / c, ht[C][1] / l, T, n, e);
        Bt.push({ start: tt, end: z, color: Xt, radius: yt * Ft / q * P.between(0.88, 1.12), opacity: E.opacity * (0.88 + _ * 0.18) * P.between(0.9, 1.1), water: E.water * P.between(0.85, 1.15), layer: ot, strokeId: Yt });
      }
      K.push(Bt);
    }
    for (let I = K.length - 1; I > 0; I--) {
      const Y = Math.floor(P.next() * (I + 1));
      [K[I], K[Y]] = [K[Y], K[I]];
    }
    K.forEach((I) => U.push(...I)), X.push(U.length);
  });
  const lt = ut(0, 0, T, n, e), ct = ut(1, 1, T, n, e);
  return { segments: U, sourceAspect: T, layerEnds: X, bounds: [Math.min(lt[0], ct[0]), Math.min(lt[1], ct[1]), Math.max(lt[0], ct[0]), Math.max(lt[1], ct[1])] };
}
const te = {
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
}, F = (u, t = 0, n = 1) => Math.min(n, Math.max(t, u)), Dt = () => Math.random() * 1e4, ee = (u, [t, n, i, e]) => {
  const s = (r, m, c) => 3 * (1 - r) * (1 - r) * r * m + 3 * (1 - r) * r * r * c + r * r * r, h = (r, m, c) => 3 * (1 - r) * (1 - r) * m + 6 * (1 - r) * r * (c - m) + 3 * r * r * (1 - c), a = F(u);
  let o = a;
  for (let r = 0; r < 5; r++) {
    const m = h(o, t, i);
    if (Math.abs(m) < 1e-5) break;
    o = F(o - (s(o, t, i) - a) / m);
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
class zt {
  constructor(t, n = {}) {
    this.canvas = t;
    const i = t.getContext("2d", { alpha: !1 });
    if (!i) throw new Error("watercolor-timelapse requires a 2D canvas context.");
    this.context = i, this.options = { ...te, ...n }, this.seed = n.seed ?? Dt(), this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(t), this.resize();
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
    const i = 1 + (Math.sqrt(F(this.options.detailMultiplier, 1, 10)) - 1) * (0.35 + F(this.options.sourceAccuracy) * 0.65), e = Math.min(720, Math.round(this.options.analysisResolution * i)), s = await _t(t, this.seed, this.canvasAspect(), e, this.options.imageFit, this.options.mode, this.options.detailFocus, this.options.detailMap, {
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
    this.timeline = jt.to(this.progressState, {
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
    const n = t.mode !== void 0 && t.mode !== this.options.mode, i = t.detailFocus !== void 0 && t.detailFocus !== this.options.detailFocus || t.detailMap !== void 0 && t.detailMap !== this.options.detailMap, e = n || i || ["analysisResolution", "strokeEconomy", "shapeSimplification", "strokeLength", "strokeWidth", "boundaryFidelity", "detailBudget", "detailMultiplier", "sourceAccuracy", "detailPrecision", "strokeCurvature"].some((o) => t[o] !== void 0), s = t.paperColor !== void 0 || t.paperRoughness !== void 0 || t.granulation !== void 0 || t.bloom !== void 0 || t.transparency !== void 0 || t.paintLoad !== void 0 || t.dryBrush !== void 0 || t.bristleStrength !== void 0 || t.gloss !== void 0 || t.renderQuality !== void 0, h = this.progressState.progress, a = !!this.timeline?.isActive();
    if (Object.assign(this.options, t), t.seed !== void 0) {
      this.restart(t.seed);
      return;
    }
    if (e && this.source) {
      const o = this.setImage(this.source), r = this.imageRequest;
      o.then(() => {
        r === this.imageRequest && (this.seek(h), a && this.play());
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
  async captureHighQuality(t = 2048) {
    if (!this.source) return null;
    const n = Math.max(512, Math.min(4096, Math.round(t))), i = this.width / Math.max(1, this.height), e = i >= 1 ? n : Math.max(1, Math.round(n * i)), s = i >= 1 ? Math.max(1, Math.round(n / i)) : n, h = document.createElement("canvas");
    h.width = e, h.height = s, h.style.width = `${e}px`, h.style.height = `${s}px`;
    const a = new zt(h, { ...this.options, onProgress: void 0, onComplete: void 0, onPhaseChange: void 0, seed: this.seed, pixelRatio: 1 });
    a.resizeObserver.disconnect(), a.width = e, a.height = s, h.width = e, h.height = s, a.pigment.width = e, a.pigment.height = s, a.livePaint.width = e, a.livePaint.height = s, a.createPaper();
    try {
      return await a.setImage(this.source), a.seek(this.progressState.progress), await new Promise((o) => {
        const r = () => {
          a.scrubFrame ? requestAnimationFrame(r) : o();
        };
        r();
      }), await new Promise((o) => h.toBlob(o, "image/png"));
    } finally {
      a.destroy();
    }
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
    const h = this.timelineWork[e - 1], a = Math.max(1e-9, this.timelineWork[e] - h);
    return e - 1 + (i - h) / a;
  }
  buildTimelineWork() {
    if (!this.plan) {
      this.timelineWork = new Float64Array([0]);
      return;
    }
    const t = this.plan.segments, n = new Float64Array(t.length + 1);
    let i = -1;
    for (let e = 0; e < t.length; e++) {
      const s = t[e], h = Math.hypot(s.end[0] - s.start[0], s.end[1] - s.start[1]), a = s.strokeId === i ? 0 : this.options.mode === "oil" ? 65e-4 : 5e-3;
      n[e + 1] = n[e] + Math.max(4e-4, h) + a, i = s.strokeId;
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
    const i = F(n) * t.length, e = Math.floor(i), s = i - e, h = t.slice(0, e);
    if (s > 0 && e < t.length) {
      const a = t[e];
      h.push({ ...a, end: [a.start[0] + (a.end[0] - a.start[0]) * s, a.start[1] + (a.end[1] - a.start[1]) * s] });
    }
    return h;
  }
  strokeRevealSpan(t) {
    if (!this.plan) return t;
    const n = this.plan.segments.length / Math.max(0.1, this.options.duration) * Math.max(0.1, this.options.speed);
    return Math.max(t, n * Math.max(0.025, this.options.strokeDuration));
  }
  paintNextStroke(t, n = !1, i = this.pigmentContext, e = 1) {
    if (!this.plan) return t;
    const s = this.plan.segments[t].strokeId, h = t;
    for (; t < this.plan.segments.length && this.plan.segments[t].strokeId === s; ) t++;
    const a = this.plan.segments.slice(h, t), o = e >= 1 ? a : this.partialStroke(a, e);
    return this.options.mode === "oil" ? this.paintOilStroke(o, s, i) : (this.paintWatercolorStroke(o, s, 0, i), e >= 1 && i === this.pigmentContext && n && s % 3 === 0 && this.wetMarks.push({ segments: a, strokeId: s, age: 0 })), t;
  }
  renderLiveStrokes(t) {
    if (this.livePaintContext.clearRect(0, 0, this.width, this.height), !this.plan) return;
    let n = this.drawnSegments, i = 0, e = 0, s = 0;
    const h = Math.max(4, Math.min(18, Math.round(this.options.strokesPerFrame * 0.65)));
    for (; n < this.plan.segments.length && i < h && e < 64; ) {
      const a = this.strokeEnd(n), o = this.strokeRevealSpan(a - n), r = (t - (a - o)) / o;
      if (r > 0) {
        const m = ee(F(r), this.options.strokeEase);
        s = m, this.paintNextStroke(n, !1, this.livePaintContext, m), i++;
      }
      n = a, e++;
    }
    this.canvas.dataset.watercolorActiveStrokes = String(i), this.canvas.dataset.watercolorStrokeProgress = s.toFixed(3);
  }
  depositBudget(t, n = !1, i = this.options.mode === "oil" ? 7 : 8) {
    const e = performance.now(), s = Math.max(1, Math.round(this.options.strokesPerFrame));
    let h = 0, a = this.drawnSegments;
    for (this.canvas.dataset.watercolorTargetSegment = t.toFixed(2); this.plan && a < this.plan.segments.length && this.strokeEnd(a) <= t && h < s && (h === 0 || performance.now() - e < i); )
      a = this.paintNextStroke(a, n), h++;
    return this.drawnSegments = a, this.renderLiveStrokes(t), n || this.maybeCheckpoint(), this.cpuPaintMs += performance.now() - e, this.plan && a >= this.plan.segments.length && (this.canvas.dataset.watercolorCpuMs = this.cpuPaintMs.toFixed(1)), !this.plan || a >= this.plan.segments.length || this.strokeEnd(a) > t;
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
    const e = new Ht(this.seed + n * 31.77), s = t[0], h = this.qualityFactor(), a = [s.start, ...t.map((v) => v.end)].map((v) => [v[0] * this.width, v[1] * this.height]);
    let o = this.smoothPath(a, 5);
    const r = e.next();
    let m = "loaded";
    const c = F(this.options.dryBrush);
    if (s.layer >= 6 ? m = r < 0.45 + c * 0.4 ? "tap" : "dry" : s.layer === 5 ? m = r < 0.12 + c * 0.42 ? "tap" : r < 0.24 + c * 0.52 ? "dry" : "loaded" : (s.layer === 4 && r < 0.05 + c * 0.35 || r < 0.02 + c * 0.25) && (m = "dry"), m === "tap") {
      const v = Math.floor(o.length * 0.34), S = Math.ceil(o.length * 0.66);
      o = o.slice(v, S);
    }
    const l = Math.max(0.7, s.radius * this.height), k = s.color.map((v) => Math.round(F(v) * 255)), y = this.mixProfile(o, k), g = this.averageColors(y), p = F(s.opacity) * (0.55 + this.options.paintLoad * 0.65) * (m === "dry" ? 0.62 : 1), M = 0.45 + this.options.granulation * 0.85, f = g.map((v) => Math.round(v * 0.55)), d = g.map((v) => Math.round(v + (255 - v) * 0.42));
    if (i.save(), i.lineCap = "round", i.lineJoin = "round", this.plan) {
      const [v, S, A, D] = this.plan.bounds;
      i.beginPath(), i.rect(v * this.width, S * this.height, (A - v) * this.width, (D - S) * this.height), i.clip();
    }
    i.globalCompositeOperation = "source-over", i.fillStyle = `rgba(${f[0]},${f[1]},${f[2]},${0.1 * p * M})`, i.filter = h < 0.5 ? "none" : `blur(${Math.min(2.2, l * 0.055)}px)`, this.fillOilBody(i, this.offsetPath(o, l * 0.14 * M, l * 0.16 * M), l * (1 + 0.07 * M), m, e.next() * 9), i.fill(), i.filter = "none";
    const x = this.oilGradient(i, o, y, 0.36 * p);
    i.fillStyle = x, i.filter = h < 0.5 ? "none" : `blur(${Math.min(1.35, l * 0.035)}px)`, this.fillOilBody(i, o, l * 1.035, m, e.next() * 9), i.fill(), i.filter = "none", i.fillStyle = this.oilGradient(i, o, y, (m === "dry" ? 0.58 : 0.9) * p), this.fillOilBody(i, o, l * 0.92, m, e.next() * 9), i.fill();
    const w = F(this.options.bristleStrength), b = Math.max(2, Math.min(m === "dry" ? 18 : 14, Math.round(l * (m === "dry" ? 0.82 : 0.52) * (0.25 + w) * h)));
    for (let v = 0; v < b; v++) {
      const S = (v / (b - 1) - 0.5) * l * 1.72 + (e.next() - 0.5) * l * 0.1;
      if (m === "dry" && e.next() < 0.28) continue;
      const A = y[Math.min(y.length - 1, Math.floor(e.next() * y.length))], D = (v / (b - 1) - 0.5) * 0.16 + (e.next() - 0.5) * 0.06, R = A.map((W) => Math.round(F(W / 255 + D) * 255));
      i.strokeStyle = `rgba(${R[0]},${R[1]},${R[2]},${(0.06 + e.next() * 0.22) * w})`, i.lineWidth = Math.max(0.3, l * (0.022 + e.next() * 0.052)), this.strokePath(i, this.offsetPath(o, S, 0)), i.stroke();
    }
    i.globalCompositeOperation = "screen", i.strokeStyle = `rgba(${d[0]},${d[1]},${d[2]},${0.28 * p * M * this.options.gloss})`, i.lineWidth = Math.max(0.45, l * 0.13 * M), this.strokePath(i, this.offsetPath(o, -l * 0.58 * M, -l * 0.05 * M)), i.stroke(), i.globalCompositeOperation = "multiply", i.strokeStyle = `rgba(${f[0]},${f[1]},${f[2]},${0.12 * p * M})`, i.lineWidth = Math.max(0.4, l * 0.1 * M), this.strokePath(i, this.offsetPath(o, l * 0.62 * M, l * 0.04 * M)), i.stroke(), this.paintOilSurface(i, o, l, y, e, M, p), i.globalCompositeOperation = "source-over", m === "loaded" && e.next() < 0.12 + this.options.paintLoad * 0.34 && this.paintOilTrails(i, o, l, g, e, p), i.restore();
  }
  mixProfile(t, n) {
    return (this.options.renderQuality === "fast" ? [0, 0.5, 1] : this.options.renderQuality === "balanced" ? [0, 0.33, 0.67, 1] : [0, 0.25, 0.5, 0.75, 1]).map((e) => {
      const s = Math.min(t.length - 1, Math.round((t.length - 1) * e)), h = t[s], a = this.pigmentContext.getImageData(F(Math.round(h[0]), 0, this.width - 1), F(Math.round(h[1]), 0, this.height - 1), 1, 1).data;
      if (a[3] <= 18) return n;
      const o = F(a[3] / 255 * (0.12 + this.options.bloom * 0.4), 0.06, 0.46);
      return n.map((r, m) => Math.round(Math.exp(Math.log(Math.max(1, r)) * (1 - o) + Math.log(Math.max(1, a[m])) * o)));
    });
  }
  averageColors(t) {
    return [0, 1, 2].map((n) => Math.round(t.reduce((i, e) => i + e[n], 0) / t.length));
  }
  oilGradient(t, n, i, e) {
    const s = n[0], h = n[n.length - 1], a = t.createLinearGradient(s[0], s[1], h[0], h[1]);
    return i.forEach((o, r) => a.addColorStop(r / (i.length - 1), `rgba(${o[0]},${o[1]},${o[2]},${e})`)), a;
  }
  paintOilTrails(t, n, i, e, s, h) {
    if (n.length < 2) return;
    const a = n[n.length - 1], o = n[n.length - 2], r = a[0] - o[0], m = a[1] - o[1], c = Math.max(1, Math.hypot(r, m)), l = r / c, k = m / c, y = -k, g = l, p = s.next() < 0.7 ? 1 : 2;
    for (let M = 0; M < p; M++) {
      const f = M === 0 ? -1 : 1, d = f * i * (0.65 + s.next() * 0.24), x = i * (0.45 + s.next() * 0.85);
      t.strokeStyle = `rgba(${e[0]},${e[1]},${e[2]},${h * (0.2 + s.next() * 0.22)})`, t.lineWidth = Math.max(0.35, i * (0.045 + s.next() * 0.08)), this.strokePath(t, [[o[0] + y * d, o[1] + g * d], [a[0] + y * d, a[1] + g * d], [a[0] + y * d + l * x, a[1] + g * d + k * x]]), t.stroke();
    }
  }
  offsetPath(t, n, i) {
    return t.map((e, s) => {
      const h = t[Math.max(0, s - 1)], a = t[Math.min(t.length - 1, s + 1)], o = a[0] - h[0], r = a[1] - h[1], m = Math.max(1, Math.hypot(o, r));
      return [e[0] - r / m * n, e[1] + o / m * n + i];
    });
  }
  smoothPath(t, n) {
    if (t.length < 3) return t;
    const i = [];
    for (let e = 0; e < t.length - 1; e++) {
      const s = t[Math.max(0, e - 1)], h = t[e], a = t[e + 1], o = t[Math.min(t.length - 1, e + 2)];
      for (let r = 0; r < n; r++) {
        const m = r / n, c = m * m, l = c * m;
        i.push([
          0.5 * (2 * h[0] + (-s[0] + a[0]) * m + (2 * s[0] - 5 * h[0] + 4 * a[0] - o[0]) * c + (-s[0] + 3 * h[0] - 3 * a[0] + o[0]) * l),
          0.5 * (2 * h[1] + (-s[1] + a[1]) * m + (2 * s[1] - 5 * h[1] + 4 * a[1] - o[1]) * c + (-s[1] + 3 * h[1] - 3 * a[1] + o[1]) * l)
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
    const h = [], a = [];
    n.forEach((o, r) => {
      const m = n[Math.max(0, r - 1)], c = n[Math.min(n.length - 1, r + 1)], l = c[0] - m[0], k = c[1] - m[1], y = Math.max(1, Math.hypot(l, k)), g = r / (n.length - 1), p = Math.pow(Math.max(0, Math.sin(Math.PI * g)), e === "tap" ? 0.25 : 0.48), M = e === "dry" ? 0.12 : e === "tap" ? 0.3 : 0.24, f = (M + (1 - M) * p) * (1 + 0.065 * Math.sin(g * Math.PI * 5 + s) + 0.035 * Math.sin(g * Math.PI * 11 - s * 0.7)), d = -k / y * i * f, x = l / y * i * f;
      h.push([o[0] + d, o[1] + x]), a.push([o[0] - d, o[1] - x]);
    }), t.beginPath(), t.moveTo(h[0][0], h[0][1]);
    for (let o = 1; o < h.length; o++) t.lineTo(h[o][0], h[o][1]);
    for (let o = a.length - 1; o >= 0; o--) t.lineTo(a[o][0], a[o][1]);
    t.closePath();
  }
  paintOilSurface(t, n, i, e, s, h, a) {
    const o = this.qualityFactor(), r = Math.max(2, Math.min(30, Math.round(i * 0.48 * o)));
    t.globalCompositeOperation = "multiply";
    for (let m = 0; m < r; m++) {
      const c = Math.min(n.length - 2, Math.floor(s.next() * (n.length - 1))), l = n[c], k = n[c + 1], y = Math.atan2(k[1] - l[1], k[0] - l[0]), g = e[Math.floor(s.next() * e.length)];
      t.save(), t.translate(l[0] + (s.next() - 0.5) * i, l[1] + (s.next() - 0.5) * i), t.rotate(y), t.fillStyle = `rgba(${Math.round(g[0] * 0.62)},${Math.round(g[1] * 0.62)},${Math.round(g[2] * 0.62)},${0.025 * h * a})`, t.beginPath(), t.ellipse(0, 0, Math.max(0.4, i * (0.04 + s.next() * 0.12)), Math.max(0.3, i * (0.025 + s.next() * 0.06)), 0, 0, Math.PI * 2), t.fill(), t.restore();
    }
    t.globalCompositeOperation = "screen";
    for (let m = 0; m < Math.ceil(r * (0.1 + this.options.gloss * 0.55)); m++) {
      const c = Math.min(n.length - 2, Math.floor(s.next() * (n.length - 1))), l = n[c], k = n[c + 1], y = k[0] - l[0], g = k[1] - l[1], p = Math.max(1, Math.hypot(y, g)), M = -g / p, f = y / p, d = e[Math.floor(s.next() * e.length)], x = -i * (0.15 + s.next() * 0.45);
      t.strokeStyle = `rgba(${Math.round(d[0] + (255 - d[0]) * 0.72)},${Math.round(d[1] + (255 - d[1]) * 0.72)},${Math.round(d[2] + (255 - d[2]) * 0.72)},${0.085 * h * a * this.options.gloss})`, t.lineWidth = Math.max(0.35, i * 0.035), t.beginPath(), t.moveTo(l[0] + M * x, l[1] + f * x), t.lineTo(l[0] + M * x + y * 0.65, l[1] + f * x + g * 0.65), t.stroke();
    }
  }
  paintWatercolorStroke(t, n, i = 0, e = this.pigmentContext) {
    if (!t.length) return;
    const s = t[0], h = new Ht(this.seed + n * 19.41 + i * 997), a = this.qualityFactor(), o = [s.start, ...t.map((f) => f.end)].map((f) => this.flowPoint(f, s.radius, h)), r = this.smoothPath(o, 4), m = Math.max(0.45, s.radius * this.height), c = s.color.map((f) => Math.round(F(f) * 255)), l = s.opacity * (1 - this.options.transparency * 0.55) * (0.55 + this.options.paintLoad * 0.7), k = 1 + i * this.options.bloom * 0.34;
    if (e.save(), this.plan) {
      const [f, d, x, w] = this.plan.bounds;
      e.beginPath(), e.rect(f * this.width, d * this.height, (x - f) * this.width, (w - d) * this.height), e.clip();
    }
    const y = 0.92 - this.options.edgeDarkening * 0.2;
    e.fillStyle = `rgba(${Math.round(c[0] * y)},${Math.round(c[1] * y)},${Math.round(c[2] * y)},${l * (0.2 + this.options.edgeDarkening * 0.16 + i * 0.05)})`, e.filter = a < 0.5 ? "none" : `blur(${Math.min(3.2, m * 0.12)}px)`, this.fillOilBody(e, r, m * 1.2 * k, "loaded", h.next() * 8), e.fill(), e.filter = "none", e.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${l * 3.05})`, this.fillOilBody(e, r, m * 0.86, "loaded", h.next() * 8), e.fill();
    const g = F(this.options.bristleStrength), p = Math.max(1, Math.min(10, Math.round(m * 0.42 * (0.3 + g) * a)));
    for (let f = 0; f < p; f++) {
      if (h.next() < 0.18) continue;
      const d = (f / Math.max(1, p - 1) - 0.5) * m * 1.5 + (h.next() - 0.5) * m * 0.12;
      e.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${l * (0.2 + h.next() * 0.6) * g})`, e.lineWidth = Math.max(0.28, m * (0.025 + h.next() * 0.07)), this.strokePath(e, this.offsetPath(r, d, 0)), e.stroke();
    }
    const M = Math.max(1, Math.min(9, Math.round(r.length * 0.24 * a)));
    for (let f = 0; f < M; f++) {
      const d = Math.min(r.length - 2, Math.floor(h.next() * (r.length - 1))), x = r[d], w = r[d + 1], b = w[0] - x[0], v = w[1] - x[1], S = Math.max(1, Math.hypot(b, v)), A = -v / S, D = b / S, R = (h.next() - 0.5) * m * 1.35;
      this.paperHeight(x[0], x[1]) < 0.5 && (e.fillStyle = `rgba(${Math.round(c[0] * 0.64)},${Math.round(c[1] * 0.64)},${Math.round(c[2] * 0.64)},${l * (0.18 + h.next() * 0.25)})`, e.beginPath(), e.arc(x[0] + A * R, x[1] + D * R, Math.max(0.3, m * (0.025 + h.next() * 0.07)), 0, Math.PI * 2), e.fill());
    }
    e.globalCompositeOperation = "destination-out", e.fillStyle = `rgba(0,0,0,${0.02 + 0.035 * this.options.paperRoughness})`;
    for (let f = 0; f < Math.min(6, M); f++) {
      const d = r[Math.floor(h.next() * r.length)];
      this.paperHeight(d[0], d[1]) > 0.56 && (e.beginPath(), e.arc(d[0] + (h.next() - 0.5) * m, d[1] + (h.next() - 0.5) * m, Math.max(0.25, m * (0.018 + h.next() * 0.045)), 0, Math.PI * 2), e.fill());
    }
    e.restore();
  }
  flowPoint(t, n, i) {
    const e = t[0] * this.width, s = t[1] * this.height, h = 2, a = this.paperHeight(e + h, s) - this.paperHeight(e - h, s), o = this.paperHeight(e, s + h) - this.paperHeight(e, s - h), r = this.options.bloom * n * this.height * 1.8;
    return [e - a * r + (i.next() - 0.5) * r * 0.08, s - o * r + (i.next() - 0.5) * r * 0.08];
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
      const h = (e * this.width + s) * 4, a = this.paperHeight(s, e) - 0.5, o = Math.sin(e * 0.72 + s * 0.035 + this.seed) * 0.5, r = (a * 0.085 + o * 0.012) * this.options.paperRoughness;
      i[h] = F(t[0] / 255 + r) * 255, i[h + 1] = F(t[1] / 255 + r) * 255, i[h + 2] = F(t[2] / 255 + r) * 255, i[h + 3] = 255;
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
  zt as W
};
