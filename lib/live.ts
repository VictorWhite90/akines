"use client";

/**
 * The app's one live connection to Akines (a WebSocket), shared by every screen in the tab.
 *
 * - It signs in with a single-use ticket fetched through our own server, so sign-in tokens never reach page code.
 * - It reconnects by itself (backing off up to 30s, with jitter so a server restart isn't hit by everyone at
 *   once), and tells listeners when it's back so they can fetch anything they missed.
 * - Messages are always sent over the API; this connection only brings news in (and "typing").
 */
import { chat, type LiveEvent } from "./api/chat";

type Status = "connecting" | "open" | "offline";
type Listener = (event: LiveEvent) => void;

const LIVE_URL = process.env.NEXT_PUBLIC_AKINES_LIVE_URL ?? "ws://localhost:8000/ws/v1/live";
const PING_EVERY_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;
const CLOSE_SIGNED_OUT = 4401;

let socket: WebSocket | null = null;
let status: Status = "offline";
let users = 0;
let attempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let pingTimer: ReturnType<typeof setInterval> | undefined;
let everConnected = false;
let opening = false;
const listeners = new Set<Listener>();
const statusListeners = new Set<(s: Status, reconnected: boolean) => void>();

function setStatus(next: Status, reconnected = false) {
  status = next;
  statusListeners.forEach((fn) => fn(next, reconnected));
}

async function open() {
  if (socket || opening || users === 0 || typeof window === "undefined") return;
  opening = true;
  setStatus("connecting");
  const t = await chat.liveTicket();
  opening = false;
  if (users === 0) return setStatus("offline");
  if (!t.ok) return retry(); // offline or the server is down; a 401 has already sent the member to log in

  const ws = new WebSocket(`${LIVE_URL}?ticket=${encodeURIComponent(t.data.ticket)}`);
  socket = ws;
  ws.onmessage = (e) => {
    let event: LiveEvent;
    try {
      event = JSON.parse(e.data);
    } catch {
      return;
    }
    if (event.type === "ready") {
      const reconnected = everConnected;
      everConnected = true;
      attempt = 0;
      setStatus("open", reconnected);
      return;
    }
    if (event.type === "session.ended") {
      window.location.assign("/login?ended=1");
      return;
    }
    listeners.forEach((fn) => fn(event));
  };
  ws.onclose = (e) => {
    if (socket === ws) socket = null;
    clearInterval(pingTimer);
    setStatus("offline");
    // Signed out on the server: the next ticket request decides (it sends the member to log in if so).
    if (users > 0) retry(e.code === CLOSE_SIGNED_OUT ? 0 : undefined);
  };
  clearInterval(pingTimer);
  pingTimer = setInterval(() => send({ type: "ping" }), PING_EVERY_MS);
}

function retry(delay?: number) {
  clearTimeout(retryTimer);
  const wait = delay ?? Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt) * (0.5 + Math.random() / 2);
  attempt += 1;
  retryTimer = setTimeout(() => void open(), wait);
}

function close() {
  clearTimeout(retryTimer);
  clearInterval(pingTimer);
  const ws = socket;
  socket = null;
  ws?.close(1000);
  setStatus("offline");
}

function send(data: unknown) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
}

if (typeof window !== "undefined") {
  // Back online, or back on the tab after the phone slept: reconnect now instead of waiting for the backoff.
  const wake = () => {
    if (users > 0 && !socket) {
      attempt = 0;
      retry(0);
    }
  };
  window.addEventListener("online", wake);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && wake());
}

export const live = {
  /** Keeps the connection open while at least one screen uses it. Returns a function to call when done. */
  use(): () => void {
    users += 1;
    if (users === 1) {
      attempt = 0;
      void open();
    }
    return () => {
      users -= 1;
      if (users === 0) close();
    };
  },
  on(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  onStatus(fn: (s: Status, reconnected: boolean) => void): () => void {
    statusListeners.add(fn);
    return () => statusListeners.delete(fn);
  },
  get status() {
    return status;
  },
  typing(conversationId: string) {
    send({ type: "typing", conversation_id: conversationId });
  },
};
