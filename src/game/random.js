// Small seeded PRNG (mulberry32) so Daily Lock can pick a stable answer per day
// without any shared answer ordering.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// YYYYMMDD for the given local date.
export function dateSeed(date = new Date()) {
  return (
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  );
}
