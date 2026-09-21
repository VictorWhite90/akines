// Covers: C3 (introductions become conversations, the "why" pinned), T2 (labelled reasons), S4/U2 (collaboration starts here), P3 (no follower counts — just two people)
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layer, ShieldTick } from "iconsax-reactjs";
import AttachmentView from "@/components/village/Attachments";
import ChatView from "@/components/village/ChatView";
import { PresenceAvatar, presenceOf } from "@/components/village/Presence";
import { getPerson, PEOPLE } from "@/lib/data";
import { getDirectThread, PRESENCE_LABEL } from "@/lib/data/village";

export async function generateMetadata({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const person = PEOPLE.find((p) => p.id === personId);
  return { title: person ? person.name : "Message" };
}

export default async function DirectMessagePage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const thread = getDirectThread(personId);
  if (!thread) notFound();
  const person = getPerson(personId);
  const presence = presenceOf(personId);

  const pinned = (
    <div className="border-b border-sand-200 px-4 pb-6 pt-8 sm:px-6">
      <PresenceAvatar personId={person.id} name={person.name} size="xl" ring="ring-sand-50" />
      <p className="mt-4 flex items-center gap-2 font-playfair text-2xl font-bold text-green-950">
        {person.name}
        {person.verified && <ShieldTick size={18} variant="Bold" color="var(--color-verified)" aria-label="Verified" />}
      </p>
      <p className="mt-1 text-sm text-grey-700">
        {person.title} · {person.city}, {person.country} · {presence.activity ?? PRESENCE_LABEL[presence.state]}
      </p>
      {thread.introId && (
        <div className="mt-4">
          <AttachmentView attachment={{ type: "intro", introId: thread.introId }} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href={`/people/${person.id}`} className="font-semibold text-green-950 underline underline-offset-4">View profile</Link>
        <Link href="/studio" className="inline-flex items-center gap-1.5 font-semibold text-green-950 underline underline-offset-4">
          <Layer size={15} color="currentColor" aria-hidden /> Open a private canvas together
        </Link>
      </div>
    </div>
  );

  return (
    <ChatView
      key={personId}
      title={person.name}
      topic={person.title}
      icon={<span className="text-xl leading-none">@</span>}
      initialMessages={thread.messages}
      placeholder={`Message ${person.name.split(" ")[0]}`}
      pinned={pinned}
    />
  );
}
