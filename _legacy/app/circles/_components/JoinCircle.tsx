"use client";

import { useState } from "react";
import { Logout, TickCircle, UserAdd } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function JoinCircle({
  circleName,
  isMember,
  moderatorName,
  size = "md",
}: {
  circleName: string;
  isMember: boolean;
  moderatorName: string;
  size?: "sm" | "md";
}) {
  const [member, setMember] = useState(isMember);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {member ? (
          <>
            <Badge tone="green" icon={<TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />}>You&apos;re a member</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setMember(false); setMessage(`You've left ${circleName}. Your past posts stay credited to you; nobody is notified.`); }}
              icon={<Logout size={16} color="currentColor" aria-hidden />}
            >
              Leave circle
            </Button>
          </>
        ) : (
          <Button
            size={size}
            onClick={() => { setMember(true); setMessage(`Welcome to ${circleName}. ${moderatorName} (moderator) will say hello — start by introducing your practice in a line or two.`); }}
            icon={<UserAdd size={16} color="currentColor" aria-hidden />}
          >
            Join {circleName}
          </Button>
        )}
      </div>
      <p className={message ? "text-sm text-grey-800" : "sr-only"} aria-live="polite">{message}</p>
    </div>
  );
}
