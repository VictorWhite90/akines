"use client";

import NotFound from "@/components/kin/NotFound";
import { useWorkspace } from "@/lib/collab/workspace";
import ArtWorkspace from "./ArtWorkspace";
import ResearchWorkspace from "./ResearchWorkspace";
import type { WorkspaceState } from "./ToolFrame";

/**
 * A project's shared workspace, full screen as in the product design: the Digital Art Workspace (a canvas) for
 * making and event projects, the Research Workspace (a document) for the rest. Saving, version history and
 * comment threads are states of each tool; the design's state frames also have routes of their own
 * (workspace/state-saving, state-could-not-save, …) that open the tool already in that state.
 */
export default function Workspace({ projectId, state }: { projectId: string; state?: WorkspaceState }) {
  const ws = useWorkspace(projectId);
  if (!ws.project) return ws.ready ? <NotFound /> : <div style={{ minHeight: "100dvh" }} aria-busy="true" />;
  return ws.kind === "art" ? <ArtWorkspace ws={ws} state={state} /> : <ResearchWorkspace ws={ws} state={state} />;
}
