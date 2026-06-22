// Keeps the host's screen awake during a game. If the host's phone sleeps, it
// stops being the authority and the whole game stalls — so we hold a wake lock
// and re-acquire it whenever the page becomes visible again.

let sentinel: WakeLockSentinel | null = null;

export async function acquireWakeLock(): Promise<void> {
  if (!("wakeLock" in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
  } catch {
    // Denied or unsupported — non-fatal, the host just has to keep tapping.
  }
}

export function releaseWakeLock(): void {
  sentinel?.release().catch(() => {});
  sentinel = null;
}

let installed = false;
export function installWakeLockReacquire(): void {
  if (installed) return;
  installed = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && sentinel === null) {
      void acquireWakeLock();
    }
  });
}
