"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { useFirstVisit } from "@/components/collaborate/overview-lists/loading";
import { toast } from "@/components/kin/Toast";
import { useCollab } from "@/lib/collab/useCollab";
import { discoverProject } from "@/lib/collab/projects";
import { Back, DsLink, PageHead, PageState, ProjectCard, SkeletonCard, pageStatus } from "./parts";

/*
 * Saved projects, mirrored from the product design (classes in ../styles/projects.css): the calls the member saved,
 * most recent first, each removable with Undo. Loading, empty and failed states are the page's real ones.
 */

export type SavedVariant = "empty" | "loading" | "error";

export default function Saved({ variant }: { variant?: SavedVariant }) {
  const collab = useCollab();
  const router = useRouter();
  // The design's Loading frame: the first visit of a session (and the state-loading route, which then goes on to the list).
  const first = useFirstVisit("saved", { stateRoute: variant === "loading", skip: !!variant, onDone: () => router.replace("/collaborate/saved") });
  const status = first ? "loading" : variant === "error" ? "error" : variant === "empty" ? "ready" : pageStatus(collab);
  // On the state route, Try again shows the Loading frame and then the list, as in the design.
  const retry = () => (variant ? router.replace("/collaborate/saved/state-loading") : window.location.reload());

  if (status === "error") {
    return (
      <div className="dsc-page"><div className="dsc-stack">
        <Back href="/collaborate/discover">Back to discover projects</Back>
        <PageState pair role="alert" headline="We could not load your saved projects." support="Check your connection and try again. Your saved list is not lost.">
          <Button onClick={retry}>Try again</Button>
          <Button variant="secondary" href="/collaborate/discover">Back to discover projects</Button>
        </PageState>
      </div></div>
    );
  }

  // Saved calls are kept in the order they were saved; the design lists the latest first.
  const list = variant === "empty" ? [] : [...collab.state.saved].reverse().map((id) => collab.call(id)).filter((c) => !!c).map((c) => discoverProject(c, collab.projects));
  const head = <PageHead eyebrow="Saved projects" title="Projects you saved." lead="Keep the ones you want to think about. Only you can see this list." link={<DsLink href="/collaborate/discover">Discover projects</DsLink>} />;

  let body: React.ReactNode;
  if (status === "loading") {
    body = (
      <section className="dsc-results" aria-busy="true" aria-label="Saved projects">
        <div className="dsc-summary"><p className="dsc-summary__count">Loading your saved projects...</p></div>
        <div className="dsc-grid">{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</div>
      </section>
    );
  } else if (list.length === 0) {
    body = (
      <PageState headline="You have not saved any projects yet." support="Use the bookmark on a project to keep it here. Only you can see your list.">
        <Button href="/collaborate/discover">Discover projects</Button>
      </PageState>
    );
  } else {
    body = (
      <section className="dsc-results" aria-label="Saved projects">
        <div className="dsc-summary">
          <p className="dsc-summary__count" aria-live="polite">{list.length} saved {list.length === 1 ? "project" : "projects"}</p>
          <span className="dsc-summary__note">Recently saved first</span>
        </div>
        <div className="dsc-grid" data-m="stagger">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} mode="saved" saved onSave={() => {
              collab.toggleSave(p.id);
              toast.show({ message: "Removed from saved projects.", actionLabel: "Undo", onAction: () => collab.toggleSave(p.id) });
            }} />
          ))}
        </div>
      </section>
    );
  }

  return <div className="dsc-page"><div className="dsc-stack">{head}{body}</div></div>;
}
