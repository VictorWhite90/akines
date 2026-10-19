"use client";

import CreateKinCircle from "../CreateKinCircle";
import { useCommunities } from "../useCommunities";

/** The small-circle wizard, filed under a community circle. */
export default function NewSmallInCommunity({ parentId }: { parentId: string }) {
  const { find } = useCommunities();
  return <CreateKinCircle parentId={parentId} parentName={find(parentId)?.name} />;
}
