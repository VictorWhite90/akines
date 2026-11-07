"use client";

import { useEffect } from "react";
import Button from "@/components/kin/Button";
import NotFound from "@/components/kin/NotFound";
import { media } from "./media";
import { MeetTop, useCast, useMeetingScreen } from "./MeetingParts";

/*
 * After you leave a meeting, mirrored from the product design (meeting.css, mc-ended): the meeting's name, how long
 * you were in it, a reminder that your camera and microphone are off, and Rejoin or Back to conversation.
 */
export default function MeetingEnded({ projectId }: { projectId: string }) {
  const cast = useCast(projectId);
  useMeetingScreen();
  useEffect(() => { media.stopAll(); }, []);
  if (!cast.project) return <MeetingMissing ready={cast.ws.ready} />;
  const minutes = media.lastCall(projectId);
  return (
    <div className="mc-page">
      <MeetTop project={cast.project.title} />
      <main className="mc-ended">
        <p className="mc-eyebrow">{cast.meeting.name.toUpperCase()}</p>
        <h1 className="mc-ended__title">You left the meeting.</h1>
        <p className="mc-ended__text">{minutes ? `The meeting lasted ${minutes} ${minutes === 1 ? "minute" : "minutes"}. ` : ""}Your camera and microphone are now off.</p>
        <div className="mc-ended__actions">
          <Button size="lg" href={`/collaborate/my-projects/${projectId}/meet`}>Rejoin</Button>
          <Button size="lg" variant="secondary" href={cast.ws.project ? cast.ws.href("conversations") : "/collaborate"}>Back to conversation</Button>
        </div>
      </main>
    </div>
  );
}

/** A meeting address for a project that is not yours (or not loaded yet). */
export function MeetingMissing({ ready }: { ready: boolean }) {
  return ready ? <NotFound /> : <div className="mc-page" aria-busy="true" />;
}
