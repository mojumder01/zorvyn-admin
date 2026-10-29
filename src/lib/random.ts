/** Small seeded random generator, so the demo data is the same on every reset. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  /** Picks a key by weight, e.g. { cod: 70, bkash: 22 }. */
  const weighted = <K extends string>(weights: Record<K, number>): K => {
    const entries = Object.entries(weights) as [K, number][];
    let roll = next() * entries.reduce((sum, [, w]) => sum + w, 0);
    for (const [key, w] of entries) {
      roll -= w;
      if (roll < 0) return key;
    }
    return entries[entries.length - 1][0];
  };
  return { next, int, pick, weighted };
}
