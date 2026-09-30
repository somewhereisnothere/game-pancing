/* ===== UTILS.JS — Helper functions ===== */
/* Proyek: Pancing Rupiah */

/**
 * Kembalikan angka acak antara min dan max (inklusif).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Kembalikan integer acak antara min dan max (inklusif).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Batas angka antara min dan max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t 0..1
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Normalisasi value ke 0..1.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Easing.
 * @param {number} t
 * @returns {number}
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutElastic(t) {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

/**
 * Format angka Rupiah (tanpa desimal).
 * @param {number} n
 * @returns {string}
 */
export function formatRupiah(n) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

/**
 * Shuffle array (Fisher-Yates).
 * @param {Array} array
 * @returns {Array}
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Debounce: jalankan fn setelah delay.
 * @param {Function} fn
 * @param {number} delay
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Bezier kurva sederhana: titik tengah kontrol.
 */
export function pointOnBezier(x1, y1, cx, cy, x2, y2, t) {
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2;
  const y = oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2;
  return { x, y };
}