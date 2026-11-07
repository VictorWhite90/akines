"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { media, useMedia } from "./media";
import { CamIcon, CamOffIcon, MeetTop, MicIcon, MicOffIcon, PresentIcon, Round, SelfTile, useCast, useMeetingScreen, useSelf } from "./MeetingParts";
import { MeetingMissing } from "./MeetingEnded";

/*
 * The meeting lobby, mirrored from the product design (meeting.css, mc-lobby): your preview with the microphone
 * and camera controls, the meeting's name, time and who is already in, and Join now or Present.
 * It asks for the camera and microphone on arrival; without them your photo shows and a note asks you to allow them.
 */
export default function MeetingLobby({ projectId }: { projectId: string }) {
  const cast = useCast(projectId);
  const router = useRouter();
  const m = useMedia();
  const self = useSelf();
  useMeetingScreen();
  useEffect(() => { media.clearScreenNote(); void media.request(); }, []);
  useEffect(() => {
    if (!m.screenNote) return;
    const t = window.setTimeout(() => media.clearScreenNote(), 6000);
    return () => window.clearTimeout(t);
  }, [m.screenNote]);

  if (!cast.project) return <MeetingMissing ready={cast.ws.ready} />;
  const call = `/collaborate/my-projects/${projectId}/meet/call`;
  const present = async () => { if (await media.present()) router.push(call); };
  const { meeting } = cast;
  return (
    <div className="mc-page">
      <MeetTop project={cast.project.title} />
      <main className="mc-lobby">
        <div className="mc-lobby__preview">
          <SelfTile self={self} person={cast.you} name={cast.youName} />
          <div className="mc-lobby__controls" role="group" aria-label="Your microphone and camera">
            <Round label={self.micMuted ? "Turn on microphone" : "Turn off microphone"} tone={self.micMuted ? "alert" : "default"} onClick={self.toggleMic}>{self.micMuted ? <MicOffIcon /> : <MicIcon />}</Round>
            <Round label={self.camOff ? "Turn on camera" : "Turn off camera"} tone={self.camOff ? "alert" : "default"} onClick={self.toggleCam}>{self.camOff ? <CamOffIcon /> : <CamIcon />}</Round>
          </div>
        </div>
        <section className="mc-join" aria-labelledby="mc-join-title">
          <p className="mc-eyebrow">{meeting.name.toUpperCase()}</p>
          <h1 id="mc-join-title" className="mc-join__title">Ready to join?</h1>
          <p className="mc-join__when">{meeting.status === "ongoing" ? `Started at ${meeting.startedAt ?? "now"}` : meeting.when || "Now"}, {meeting.minutes} minutes</p>
          <div className="mc-join__who">
            {/* eslint-disable-next-line @next/next/no-img-element -- the design's faces */}
            <span className="mc-faces" aria-hidden="true">{cast.others.map((o) => (o.photo ? <img key={o.id} className="mc-faces__img" src={o.photo} alt="" width={32} height={32} draggable={false} /> : null))}</span>
            <span className="mc-join__who-text">{cast.others.length ? `${cast.firstNames} ${cast.others.length === 1 ? "is" : "are"} here` : "No one else is here yet"}</span>
          </div>
          <div className="mc-join__actions">
            <Button size="lg" href={call} className="mc-grow">Join now</Button>
            <Button size="lg" variant="secondary" icon={<PresentIcon size={16} />} onClick={present} className="mc-grow">Present</Button>
            {m.screenNote ? <p className="mc-join__note" role="status">{m.screenNote}</p> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
