"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationBing } from "iconsax-reactjs";
import { notifications } from "@/lib/api/notifications";
import NotificationList from "./NotificationList";

const POLL_MS = 60_000;

/** The bell: unread count (checked every minute and when the tab comes back), a panel on desktop, a page on phones. */
export default function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  const refresh = useCallback(async () => {
    const r = await notifications.unread();
    if (r.ok) setUnread(r.data.unread);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first count, then poll
    void refresh();
    const timer = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    const onShow = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => wrap.current && !wrap.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = () => {
    if (window.matchMedia("(max-width: 700px)").matches) return router.push("/notifications");
    setOpen((o) => !o);
  };

  return (
    <span className="nt-bell-wrap" ref={wrap}>
      <button className="nx-icon nx-bell" onClick={toggle} aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={open} title="Notifications">
        <NotificationBing size={18} color="currentColor" />
        {unread > 0 && <span className="nt-badge" aria-hidden>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="kh nt-panel" role="dialog" aria-label="Notifications">
          <header><b>Notifications</b></header>
          <NotificationList compact onNavigate={() => setOpen(false)} onChange={refresh} />
        </div>
      )}
    </span>
  );
}
