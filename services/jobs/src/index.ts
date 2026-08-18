/**
 * CulturePulse background jobs.
 * Tick pulse status (live → finished), send 2-hour reminders,
 * and keep suggestion feeds warm. Designed to run beside the API.
 */
const API = process.env.JOBS_API_URL ?? "http://localhost:4000";

async function post(path: string) {
  try {
    const res = await fetch(`${API}${path}`, { method: "POST" });
    const body = await res.json();
    console.log(`[jobs] ${path}`, body);
  } catch (err) {
    console.warn(`[jobs] ${path} skipped — API not ready yet.`, (err as Error).message);
  }
}

async function tick() {
  await post("/internal/jobs/expire");
  await post("/internal/jobs/reminders");
}

console.log(`CulturePulse jobs watching ${API}`);
tick();
setInterval(tick, 30_000);
