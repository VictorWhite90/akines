import type { Metadata } from "next";
import NotificationList from "@/components/notifications/NotificationList";

export const metadata: Metadata = { title: "Notifications · Akines" };

export default function NotificationsPage() {
  return (
    <div className="kh nt-page">
      <h1>Notifications</h1>
      <NotificationList />
    </div>
  );
}
