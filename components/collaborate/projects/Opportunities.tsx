"use client";

import Link from "next/link";
import Button from "@/components/kin/Button";
import { useCollab } from "@/lib/collab/useCollab";
import { openRoles, type OpenRole } from "@/lib/collab/opportunities";
import { CtaArrow, DsLink, PageHead, PageState, SkeletonCard, StageLine, pageStatus } from "./parts";
import "../styles/opportunities.css";

/*
 * Opportunities, mirrored from the product design (classes in ../styles/opportunities.css, with Discover's page,
 * summary and grid): a card for each open role on a project looking for people, best match to your profile first.
 */

const HREF = "/collaborate/discover";

function RoleCard({ item }: { item: OpenRole }) {
  return (
    <Link href={item.href} className="op-card" aria-label={`${item.role}, ${item.project}. View project`}>
      <div className="op-card__top"><StageLine stage="Open role" type={item.type} /></div>
      <div className="op-card__group"><h2 className="op-card__title">{item.role}</h2><p className="op-card__summary">{item.summary}</p></div>
      <div className="op-card__divider" />
      <div className="op-card__field"><span className="dsc-label">Project</span><p className="op-card__value op-card__value--project">{item.project}</p></div>
      <div className="op-card__field"><span className="dsc-label">Commitment</span><p className="op-card__value op-card__value--commit">{item.commitment}</p></div>
      <div className="op-card__field"><span className="dsc-label">Project owner</span><p className="op-card__value">{item.owner}</p></div>
      <span className="op-card__cta">View project<CtaArrow /></span>
    </Link>
  );
}

export default function Opportunities() {
  const collab = useCollab();
  const status = pageStatus(collab);
  const head = <PageHead eyebrow="Opportunities" title="Where you could help." lead="Open roles on projects that are looking for people. Choose one to read about the project." link={<DsLink href={HREF}>Discover projects</DsLink>} />;
  const roles = status === "ready" ? openRoles(collab.calls, collab.projects, collab.appFor) : [];

  let body: React.ReactNode;
  if (status === "loading") {
    body = (
      <section className="dsc-results" aria-busy="true" aria-label="Open roles">
        <div className="dsc-summary"><p className="dsc-summary__count">Finding open roles…</p></div>
        <div className="dsc-grid">{Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}</div>
      </section>
    );
  } else if (status === "error") {
    body = (
      <PageState pair role="alert" headline="We could not load the open roles." support="Check your connection and try again.">
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button variant="secondary" href={HREF}>Discover projects</Button>
      </PageState>
    );
  } else if (roles.length === 0) {
    body = (
      <PageState headline="No open roles right now." support="When a project looks for people whose skills match yours, the role will appear here. You can also explore projects that are still forming a team.">
        <Button href={HREF}>Discover projects</Button>
      </PageState>
    );
  } else {
    body = (
      <section className="dsc-results" aria-label="Open roles">
        <div className="dsc-summary"><p className="dsc-summary__count" aria-live="polite">{roles.length} open {roles.length === 1 ? "role" : "roles"}</p><span className="dsc-summary__note">Best match to your profile first</span></div>
        <div className="dsc-grid" data-m="stagger">{roles.map((r) => <RoleCard key={r.id} item={r} />)}</div>
      </section>
    );
  }
  return <div className="dsc-page"><div className="dsc-stack">{head}{body}</div></div>;
}
