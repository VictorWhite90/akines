"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** A QR code for a link or ticket code, drawn locally (no network). */
export default function QR({ value, size = 180, label }: { value: string; size?: number; label: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, { margin: 1, width: size * 2, color: { dark: "#181818", light: "#ffffff" } }).then(setSrc).catch(() => setSrc(""));
  }, [value, size]);
  // eslint-disable-next-line @next/next/no-img-element -- generated data URL
  return src ? <img src={src} alt={label} width={size} height={size} className="cm-qr" /> : <span className="cm-qr" style={{ width: size, height: size }} aria-label={label} />;
}
