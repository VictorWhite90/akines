/**
 * Browser half of the API layer. Calls our own Next routes (/api/auth/*, /api/v1/*), never Django directly,
 * and unwraps the backend's {success, message, data, error} envelope.
 */

export type ApiResult<T> =
  | { ok: true; data: T; message: string | null }
  | { ok: false; status: number; message: string; field?: string };

async function call<T>(url: string, method: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const r = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
    const env = await r.json().catch(() => null);
    if (r.ok && env?.success !== false) return { ok: true, data: env?.data as T, message: env?.message ?? null };
    // The session is over (signed out from another device, password changed, or expired): back to log in.
    if (r.status === 401 && url.startsWith("/api/v1/") && typeof window !== "undefined") {
      window.location.assign("/login?ended=1");
      return { ok: false, status: 401, message: "Your session has ended. Please log in again." };
    }
    return { ok: false, status: r.status, message: env?.message || "Something went wrong. Please try again.", field: env?.error?.field };
  } catch {
    return { ok: false, status: 0, message: "You seem to be offline. Check your connection and try again." };
  }
}

export const auth = <T = unknown>(action: string, body?: unknown) => call<T>(`/api/auth/${action}`, "POST", body ?? {});

export const api = {
  get: <T>(path: string) => call<T>(`/api/v1/${path.replace(/^\//, "")}`, "GET"),
  post: <T>(path: string, body?: unknown) => call<T>(`/api/v1/${path.replace(/^\//, "")}`, "POST", body ?? {}),
  put: <T>(path: string, body?: unknown) => call<T>(`/api/v1/${path.replace(/^\//, "")}`, "PUT", body ?? {}),
  patch: <T>(path: string, body?: unknown) => call<T>(`/api/v1/${path.replace(/^\//, "")}`, "PATCH", body ?? {}),
  del: <T>(path: string) => call<T>(`/api/v1/${path.replace(/^\//, "")}`, "DELETE"),
};

/** The signed-in member as the backend describes them (template: account.v1.services.user.get_user_data). */
export type Member = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo: string | null;
  roles: string[];
  permissions: string[];
};
