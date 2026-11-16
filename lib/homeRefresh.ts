/**
 * Tapping Community Home's icon or the logo refreshes the feed, as on X: a new arrangement, back at the top. A refresh of
 * the browser does the same; coming back by any other link (or the back button) keeps the feed you were reading.
 */
export const HOME_REFRESH = "ak:home-refresh";
let pending = false;

export function refreshHome() {
  pending = true;
  window.dispatchEvent(new Event(HOME_REFRESH));
}

/** True once after a Home tap, so a Community Home that mounts because of the tap picks a new arrangement. */
export function takeHomeRefresh() {
  const p = pending;
  pending = false;
  return p;
}
