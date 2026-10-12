import Link from "next/link";
import { ArrowRight, Briefcase, Layer, Microphone2, ShieldTick, Warning2 } from "iconsax-reactjs";
import { AvatarStack } from "@/components/ui/Avatar";
import Media from "@/components/ui/Media";
import TrustLabel from "@/components/ui/TrustLabel";
import { getCall, getPerson, getProject, getRoom, getStory, INTRODUCTIONS } from "@/lib/data";
import { LIVE_ROOM_IDS, type Attachment } from "@/lib/data/village";
import { PROJECT_STAGES } from "@/lib/data/projects";

const frame = "mt-2 block max-w-xl overflow-hidden rounded-[8px] border border-sand-200 bg-white";

function StoryAttachment({ storyId }: { storyId: string }) {
  const story = getStory(storyId);
  if (!story) return null;
  const artist = getPerson(story.artistId);
  return (
    <Link href={`/stories/${story.id}`} className={`${frame} grid grid-cols-[120px_1fr] hover:border-sand-300 sm:grid-cols-[160px_1fr]`}>
      <Media src={story.image} alt="" ratio="1/1" sizes="160px" />
      <div className="flex flex-col justify-center gap-1 p-4">
        <p className="text-xs text-grey-700">Artwork story</p>
        <p className="font-playfair text-lg font-semibold leading-tight text-green-950">{story.title}</p>
        <p className="text-sm text-grey-700">{artist.name} · {story.year}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-green-950">
          <Microphone2 size={14} color="currentColor" aria-hidden /> Listen · {story.voiceNote.duration}
        </p>
      </div>
    </Link>
  );
}

function CallAttachment({ callId }: { callId: string }) {
  const call = getCall(callId);
  if (!call) return null;
  const flagged = Boolean(call.flags?.length);
  return (
    <Link href={`/opportunities/${call.id}`} className={`${frame} p-4 hover:border-sand-300 ${flagged ? "border-alert/40 bg-alert-bg" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-grey-700">
        <Briefcase size={14} color="currentColor" aria-hidden /> Open call · {call.organisation}
        {call.organiserVerified ? <TrustLabel source="verified" compact /> : null}
      </div>
      <p className="mt-2 font-semibold text-green-950">{call.title}</p>
      {flagged ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-alert">
          <Warning2 size={16} color="currentColor" className="mt-0.5 shrink-0" aria-hidden /> {call.flags!.length} warning signs — see why before you engage.
        </p>
      ) : (
        <p className="mt-1 text-sm text-grey-700">{call.budget} · closes {call.deadline}</p>
      )}
    </Link>
  );
}

function RoomAttachment({ roomId }: { roomId: string }) {
  const room = getRoom(roomId);
  if (!room) return null;
  const live = LIVE_ROOM_IDS.includes(room.id);
  const open = room.capacity - room.participantIds.length;
  return (
    <Link href={`/rooms/${room.id}`} className="mt-2 flex max-w-xl items-center gap-4 overflow-hidden rounded-[8px] bg-night-900 p-4 text-night-text transition-colors hover:bg-night-800">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-night-700">
        <span className="h-4 w-4 rounded-full bg-fire shadow-[0_0_18px_6px_rgba(245,176,65,0.45)]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-xs text-night-muted">{live ? "Palaver · live now" : `Palaver · ${room.when}`}</span>
        <span className="mt-0.5 block font-semibold text-white">{room.title}</span>
        <span className="mt-1 flex items-center gap-2 text-xs text-night-muted">
          <AvatarStack names={room.participantIds.map((id) => getPerson(id).name)} size="xs" max={6} />
          {open > 0 ? `${open} of 6 seats open` : "All six seats taken"}
        </span>
      </span>
      <ArrowRight size={18} color="currentColor" aria-hidden />
    </Link>
  );
}

function ProjectAttachment({ projectId }: { projectId: string }) {
  const project = getProject(projectId);
  if (!project) return null;
  const stage = PROJECT_STAGES.find((s) => s.id === project.stage);
  return (
    <Link href={`/studio/${project.id}`} className={`${frame} flex items-center gap-4 p-4 hover:border-sand-300`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-green-950 text-white">
        <Layer size={20} color="currentColor" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="text-xs text-grey-700">Private collaboration · {stage?.label}</span>
        <span className="block font-semibold text-green-950">{project.title}</span>
      </span>
    </Link>
  );
}

function FeedbackAttachment({ image, questions }: { image: string; questions: string[] }) {
  return (
    <div className={frame}>
      <Media src={image} alt="Work in progress" ratio="16/10" sizes="576px" />
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ruby-600">Asking for critique</p>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-green-950">
          {questions.map((q) => (
            <li key={q}>— {q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CritiqueAttachment({ working, unclear, tryThis }: { working: string; unclear: string; tryThis: string }) {
  const rows = [
    { label: "What's working", text: working, tone: "text-verified" },
    { label: "What's unclear", text: unclear, tone: "text-ruby-700" },
    { label: "Try this", text: tryThis, tone: "text-ai" },
  ];
  return (
    <dl className={`${frame} divide-y divide-sand-200`}>
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
          <dt className={`text-xs font-semibold ${row.tone}`}>{row.label}</dt>
          <dd className="text-sm text-green-950">{row.text}</dd>
        </div>
      ))}
    </dl>
  );
}

function IntroAttachment({ introId }: { introId: string }) {
  const intro = INTRODUCTIONS.find((i) => i.id === introId);
  if (!intro) return null;
  return (
    <div className={`${frame} p-4`}>
      <p className="flex items-center gap-2 text-xs font-semibold text-ai">
        <ShieldTick size={14} color="currentColor" aria-hidden /> Why Artelia introduced you
      </p>
      <p className="mt-2 font-playfair text-lg text-green-950">{intro.headline}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {intro.reasons.map((r) => (
          <li key={r.text} className="flex items-start gap-2 text-sm text-grey-800">
            <TrustLabel source={r.source} compact className="mt-0.5 shrink-0" />
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AttachmentView({ attachment }: { attachment: Attachment }) {
  switch (attachment.type) {
    case "story":
      return <StoryAttachment storyId={attachment.storyId} />;
    case "call":
      return <CallAttachment callId={attachment.callId} />;
    case "room":
      return <RoomAttachment roomId={attachment.roomId} />;
    case "project":
      return <ProjectAttachment projectId={attachment.projectId} />;
    case "feedback":
      return <FeedbackAttachment image={attachment.image} questions={attachment.questions} />;
    case "critique":
      return <CritiqueAttachment working={attachment.working} unclear={attachment.unclear} tryThis={attachment.tryThis} />;
    case "intro":
      return <IntroAttachment introId={attachment.introId} />;
    case "image":
      return (
        <div className={frame}>
          <Media src={attachment.src} alt={attachment.alt} ratio="16/10" sizes="576px" />
        </div>
      );
  }
}
