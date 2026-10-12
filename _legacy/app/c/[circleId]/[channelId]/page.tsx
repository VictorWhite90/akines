// Covers: C5 (circles as living spaces), C4 (palavers in the channel list), C3/S4 (Companion connects complementary members), T2 (AI labelled), T6 (scam check in #opportunities), P3 (responses show who, never how many)
import { notFound } from "next/navigation";
import { Briefcase, Edit2, InfoCircle } from "iconsax-reactjs";
import ChatView from "@/components/village/ChatView";
import MembersList from "@/components/village/MembersList";
import { CIRCLES, ME_ID } from "@/lib/data";
import { channelsFor, COMPANION_ID, messagesFor, roomsFor } from "@/lib/data/village";
import { roleTagsFor } from "../../../village-roles";

export async function generateMetadata({ params }: { params: Promise<{ circleId: string; channelId: string }> }) {
  const { circleId, channelId } = await params;
  const circle = CIRCLES.find((c) => c.id === circleId);
  return { title: circle ? `#${channelId} · ${circle.name}` : "Circle" };
}

export default async function ChannelPage({ params }: { params: Promise<{ circleId: string; channelId: string }> }) {
  const { circleId, channelId } = await params;
  const circle = CIRCLES.find((c) => c.id === circleId);
  const channel = channelsFor(circleId).find((c) => c.id === channelId);
  if (!circle || !channel) notFound();

  const messages = messagesFor(circleId, channelId);
  const members = [
    ME_ID,
    ...circle.moderatorIds,
    ...roomsFor(circleId).flatMap((r) => r.participantIds),
    ...Object.values(["welcome", "general", "works-in-progress", "opportunities"]).flatMap((ch) => messagesFor(circleId, ch).map((m) => m.authorId)),
  ].filter((id) => id !== COMPANION_ID);
  const roleTags = roleTagsFor(circleId);
  const icon = channel.kind === "announce" ? <InfoCircle size={20} color="currentColor" aria-hidden /> : channel.kind === "feedback" ? <Edit2 size={18} color="currentColor" aria-hidden /> : channel.kind === "calls" ? <Briefcase size={18} color="currentColor" aria-hidden /> : <span className="text-xl leading-none">#</span>;

  return (
    <ChatView
      key={`${circleId}/${channelId}`}
      title={channel.name}
      topic={channel.topic}
      icon={icon}
      channelKind={channel.kind}
      initialMessages={messages}
      roleTags={roleTags}
      placeholder={channel.kind === "feedback" ? "Share a work in progress…" : `Message #${channel.name}`}
      members={<MembersList personIds={members} roleTags={roleTags} />}
      pinned={
        messages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-playfair text-xl font-semibold text-green-950">This is the start of #{channel.name}</p>
            <p className="mt-2 text-sm text-grey-700">{channel.topic}</p>
          </div>
        ) : undefined
      }
    />
  );
}
