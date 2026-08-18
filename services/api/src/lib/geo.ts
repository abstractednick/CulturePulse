/** Haversine distance in kilometers. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function fuzzyCoordinate(
  lat: number,
  lng: number,
  radiusMeters: number,
  seed: string
): { lat: number; lng: number } {
  if (radiusMeters <= 0) return { lat, lng };
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const angle = (h % 360) * (Math.PI / 180);
  const dist = ((h % 1000) / 1000) * radiusMeters;
  const dLat = (dist / 111_320) * Math.cos(angle);
  const dLng = (dist / (111_320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng };
}
