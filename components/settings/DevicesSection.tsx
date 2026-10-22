"use client";

import { useState } from "react";
import { Mobile, Monitor } from "iconsax-reactjs";
import { account, type Device } from "@/lib/api/account";
import { Notice, Status, useLoad } from "./useLoad";

function when(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return "Active now";
  if (mins < 60) return `Active ${mins} min ago`;
  if (mins < 60 * 24) return `Active ${Math.round(mins / 60)} h ago`;
  return `Last active ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

const isPhone = (d: Device) => /iPhone|Android|iPad/.test(d.device);

export default function DevicesSection() {
  const devices = useLoad(account.devices);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  if (!devices.data) return <Status loading={devices.loading} error={devices.error} onRetry={devices.reload} />;
  const others = devices.data.filter((d) => !d.is_current);

  const signOut = async (d: Device) => {
    setBusy(d.device_id);
    const r = await account.signOutDevice(d.device_id);
    setBusy(null);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    devices.setData(devices.data!.filter((x) => x.device_id !== d.device_id));
    setNotice({ text: `${d.device} is signed out.`, tone: "ok" });
  };

  const signOutOthers = async () => {
    setBusy("all");
    const r = await account.signOutOtherDevices();
    setBusy(null);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    devices.setData(devices.data!.filter((x) => x.is_current));
    setNotice({ text: `Signed out of ${r.data.signed_out} other ${r.data.signed_out === 1 ? "device" : "devices"}.`, tone: "ok" });
  };

  return (
    <div className="cm-form">
      <p className="st-lead">If you see a device you don&apos;t recognise, sign it out and change your password.</p>
      <ul className="st-list">
        {devices.data.map((d) => {
          const Icon = isPhone(d) ? Mobile : Monitor;
          return (
            <li key={d.device_id}>
              <Icon size={22} color="currentColor" />
              <span>
                <b>{d.device}{d.is_current && <em className="st-tag">This device</em>}</b>
                <small>{d.is_current ? "Active now" : when(d.last_seen_at)}{d.ip_address ? ` · ${d.ip_address}` : ""}</small>
              </span>
              {!d.is_current && <button className="kh-btn outline sm" onClick={() => signOut(d)} disabled={busy !== null}>{busy === d.device_id ? "Signing out…" : "Sign out"}</button>}
            </li>
          );
        })}
      </ul>
      {others.length > 1 && <button className="kh-btn outline st-save" onClick={signOutOthers} disabled={busy !== null}>{busy === "all" ? "Signing out…" : "Sign out of all other devices"}</button>}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
