let cachedData: { totalPoints: number } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000;

export async function fetchProfilePoints(): Promise<number | null> {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return cachedData.totalPoints;
  }
  try {
    const res = await fetch("/api/student/profile");
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.totalPoints === "number") {
        cachedData = { totalPoints: data.totalPoints };
        cacheTimestamp = now;
        return data.totalPoints;
      }
    }
  } catch {
    // ignore
  }
  return null;
}