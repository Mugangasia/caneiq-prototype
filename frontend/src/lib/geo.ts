// Deterministic geo helpers — seeded RNG so the belt looks identical every load.

export type LatLng = [number, number];

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const M_PER_DEG_LAT = 111320;

function degPerMeterLng(lat: number) {
  return 1 / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
}

/**
 * Generate an irregular quadrilateral field polygon around `center`,
 * roughly `w` x `h` meters, rotated by `rot` radians, with corner jitter.
 * Returns a closed ring of [lat, lng].
 */
export function makeField(
  center: LatLng,
  w: number,
  h: number,
  rot: number,
  rng: () => number
): LatLng[] {
  const dLng = degPerMeterLng(center[0]);
  const corners: [number, number][] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const ring: LatLng[] = corners.map(([x, y]) => {
    const jx = x * (0.82 + rng() * 0.36);
    const jy = y * (0.82 + rng() * 0.36);
    const rx = jx * cos - jy * sin;
    const ry = jx * sin + jy * cos;
    return [center[0] + ry / M_PER_DEG_LAT, center[1] + rx * dLng];
  });
  ring.push(ring[0]);
  return ring;
}

/** Subdivide a field ring's bounding box into n jittered sub-polygons (for NDVI patches). */
export function makePatches(ring: LatLng[], n: number, rng: () => number): LatLng[][] {
  const lats = ring.map((p) => p[0]);
  const lngs = ring.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const patches: LatLng[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (patches.length >= n) break;
      const lat0 = minLat + ((maxLat - minLat) * r) / rows;
      const lat1 = minLat + ((maxLat - minLat) * (r + 1)) / rows;
      const lng0 = minLng + ((maxLng - minLng) * c) / cols;
      const lng1 = minLng + ((maxLng - minLng) * (c + 1)) / cols;
      const j = () => (rng() - 0.5) * 0.24;
      patches.push([
        [lat0 + (lat1 - lat0) * (0.08 + j() * 0.2), lng0 + (lng1 - lng0) * (0.08 + j() * 0.2)],
        [lat0 + (lat1 - lat0) * (0.08 + j() * 0.2), lng1 - (lng1 - lng0) * (0.08 + j() * 0.2)],
        [lat1 - (lat1 - lat0) * (0.08 + j() * 0.2), lng1 - (lng1 - lng0) * (0.08 + j() * 0.2)],
        [lat1 - (lat1 - lat0) * (0.08 + j() * 0.2), lng0 + (lng1 - lng0) * (0.08 + j() * 0.2)],
      ]);
    }
  }
  return patches;
}

export function centroid(ring: LatLng[]): LatLng {
  let la = 0;
  let ln = 0;
  const pts = ring.slice(0, -1);
  pts.forEach((p) => {
    la += p[0];
    ln += p[1];
  });
  return [la / pts.length, ln / pts.length];
}

/** Rough haversine distance in km. */
export function distKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKES(n: number): string {
  return "KES " + n.toLocaleString("en-KE");
}
