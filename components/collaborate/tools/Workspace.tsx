"use client";

import NotFound from "@/components/kin/NotFound";
import { useWorkspace } from "@/lib/collab/workspace";
import ArtWorkspace from "./ArtWorkspace";
import ResearchWorkspace from "./ResearchWorkspace";

/**
 * A project's shared workspace, full screen as in the product design: the Digital Art Workspace (a canvas) for
 * making and event projects, the Research Workspace (a document) for the rest. Saving, version history and
 * comment threads are states of each tool, not separate pages.
 */
export default function Workspace({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  if (!ws.project) return ws.ready ? <NotFound /> : <div style={{ minHeight: "100dvh" }} aria-busy="true" />;
  return ws.kind === "art" ? <ArtWorkspace ws={ws} /> : <ResearchWorkspace ws={ws} />;
}
