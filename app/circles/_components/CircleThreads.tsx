"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Tabs from "@/components/ui/Tabs";
import { getPerson } from "@/lib/data";
import type { CircleThread } from "@/lib/types";

type TabId = "all" | CircleThread["kind"];

const KIND: Record<CircleThread["kind"], { label: string; tone: BadgeTone }> = {
  discussion: { label: "Discussion", tone: "neutral" },
  feedback: { label: "Portfolio feedback", tone: "gold" },
  opportunity: { label: "Opportunity", tone: "green" },
  mentorship: { label: "Mentorship", tone: "calm" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "discussion", label: "Discussion" },
  { id: "feedback", label: "Portfolio feedback" },
  { id: "opportunity", label: "Opportunities" },
  { id: "mentorship", label: "Mentorship" },
];

export default function CircleThreads({ threads, circleName }: { threads: CircleThread[]; circleName: string }) {
  const [tab, setTab] = useState<TabId>("all");
  const shown = tab === "all" ? threads : threads.filter((t) => t.kind === tab);

  return (
    <div>
      <Tabs items={TABS} value={tab} onChange={setTab} idPrefix="threads" label={`${circleName} threads by kind`} />
      <div role="tabpanel" id={`threads-panel-${tab}`} aria-labelledby={`threads-tab-${tab}`} className="pt-4">
        {shown.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description={threads.length === 0 ? `${circleName} is quiet so far. Start the first thread — moderators welcome every first post.` : "No threads of this kind right now. Try another tab or start one."}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-sand-200 rounded-[4px] border border-sand-200 bg-white">
            {shown.map((thread) => {
              const author = getPerson(thread.authorId);
              return (
                <li key={thread.id} className="flex items-start gap-3 p-4">
                  <Avatar name={author.name} size="sm" verified={author.verified} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-green-950">{thread.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-grey-700">
                      <Badge tone={KIND[thread.kind].tone}>{KIND[thread.kind].label}</Badge>
                      <span>
                        by <Link href={`/people/${author.id}`} className="font-semibold text-green-950 hover:underline">{author.name}</Link>
                      </span>
                      <span aria-hidden>·</span>
                      <span>active {thread.lastActive}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {shown.length > 0 && <p className="mt-3 text-center text-xs text-grey-700">That&apos;s every thread{tab === "all" ? "" : ` in ${TABS.find((t) => t.id === tab)?.label.toLowerCase()}`}.</p>}
      </div>
    </div>
  );
}
