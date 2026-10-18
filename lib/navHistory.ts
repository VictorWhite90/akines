/**
 * In-app back stack (per tab). AppShell records every route change, so Back buttons can return
 * to the page you actually came from, and fall back to a sensible parent when you landed directly.
 */
const KEY = "ak:nav";

function read(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function recordRoute(path: string) {
  try {
    const stack = read();
    if (stack[stack.length - 1] === path) return;
    // Going back to the previous page pops it, so repeated Back presses walk the real trail.
    if (stack[stack.length - 2] === path) stack.pop();
    else stack.push(path);
    sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-30)));
  } catch {}
}

export function canGoBack(): boolean {
  return read().length > 1;
}
