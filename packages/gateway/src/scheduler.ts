import { cleanExpiredEvents } from "./db/queries";

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startScheduler(): void {
  intervalId = setInterval(
    () => {
      const deleted = cleanExpiredEvents();
      if (deleted > 0) {
        console.log(`Scheduler: cleaned ${deleted} expired webhook events`);
      }
    },
    60 * 60 * 1000,
  );
  console.log("Scheduler started: webhook event cleanup every 1 hour");
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
