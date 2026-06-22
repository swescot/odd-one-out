// Hidden developer mode, controlled by a URL flag so it can be toggled on any
// build (including a deployed one) without being noticeable to normal players.
//
//   ?dev        → turn it on  (sticks for this browser)
//   ?dev=off    → turn it off
//
// Once turned on the choice is remembered in localStorage, so the flag only has
// to be typed once. A normal player never sets it, so dev controls stay hidden.

const KEY = "ooo:dev";

function compute(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("dev")) {
      const v = params.get("dev");
      const on = v !== "off" && v !== "0" && v !== "false";
      localStorage.setItem(KEY, on ? "1" : "0");
      return on;
    }
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Whether dev tooling (bots, phase skip) should be shown. Resolved once at load. */
export const DEV_MODE = compute();
