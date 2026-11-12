"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { media, useMedia } from "./media";
import { CamIcon, CamOffIcon, MeetTop, MicIcon, MicOffIcon, PresentIcon, Round, SelfTile, useCast, useMeetingScreen, useSelf } from "./MeetingParts";
import { MeetingMissing } from "./MeetingEnded";
import Img from "@/components/kin/Img";

/*
 * The meeting lobby, mirrored from the product design (meeting.css, mc-lobby): your preview with the microphone
 * and camera controls, the meeting's name, time and who is already in, and Join now or Present.
 * It asks for the camera and microphone on arrival; without them your photo shows and a note asks you to allow them.
 * The Camera off frame has its own route (meet/state-camera-off).
 */
export default function MeetingLobby({ projectId, cameraOff = false }: { projectId: string; /** The Camera off frame (meet/state-camera-off): no devices are asked for, the camera starts off. */ cameraOff?: boolean }) {
  const cast = useCast(projectId);
  const router = useRouter();
  const m = useMedia();
  const self = useSelf(cameraOff, !cameraOff);
  useMeetingScreen();
  useEffect(() => { media.clearScreenNote(); if (!cameraOff) void media.request(); }, [cameraOff]);
  useEffect(() => {
    if (!m.screenNote) return;
    const t = window.setTimeout(() => media.clearScreenNote(), 6000);
    return () => window.clearTimeout(t);
  }, [m.screenNote]);

  if (!cast.project) return <MeetingMissing ready={cast.ws.ready} />;
  const call = `/collaborate/my-projects/${projectId}/meet/call`;
  const present = async () => { if (await media.present()) router.push(`/collaborate/my-projects/${projectId}/meet/state-screen-sharing`); };
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
            <span className="mc-faces" aria-hidden="true">{cast.others.map((o) => (o.photo ? <Img sizes="32px" key={o.id} className="mc-faces__img" src={o.photo} width={32} height={32} draggable={false} /> : null))}</span>
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
