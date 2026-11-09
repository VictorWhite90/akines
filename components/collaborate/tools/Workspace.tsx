"use client";

import NotFound from "@/components/kin/NotFound";
import { useWorkspace } from "@/lib/collab/workspace";
import ArtWorkspace from "./ArtWorkspace";
import ResearchWorkspace from "./ResearchWorkspace";

/**
 * A project's shared workspace, full screen as in the product design: the Digital Art Workspace (a canvas) for
 * making and event projects, the Research Workspace (a document) for the rest. Saving, version history and
 * comment threads are states of each tool, not separate pages; a failed save has no natural trigger, so it has
 * its own route (workspace/state-could-not-save).
 */
export default function Workspace({ projectId, state }: { projectId: string; /** state-could-not-save: a failed save with its popover open. */ state?: "couldNotSave" }) {
  const ws = useWorkspace(projectId);
  if (!ws.project) return ws.ready ? <NotFound /> : <div style={{ minHeight: "100dvh" }} aria-busy="true" />;
  const failed = state === "couldNotSave";
  return ws.kind === "art" ? <ArtWorkspace ws={ws} failed={failed} /> : <ResearchWorkspace ws={ws} failed={failed} />;
}
