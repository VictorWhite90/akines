"use client";

import Link from "next/link";
import Button from "@/components/kin/Button";
import { useCollab } from "@/lib/collab/useCollab";
import { contributionsOf, type Contribution } from "@/lib/collab/contributions";
import { CtaArrow, PageHead, PageState, pageStatus } from "./parts";
import "../styles/opportunities.css";
import "../styles/contributions.css";

/*
 * My Contributions, mirrored from the product design (classes in ../styles/contributions.css and the shared card in
 * ../styles/opportunities.css): a record of your work with others, most recent first, each with the work it
 * relates to, its project and who acknowledged it.
 */

const NOTE = "Acknowledgements show that your work was seen. They are not ratings, and nothing here measures how often you are online.";

function Record({ item }: { item: Contribution }) {
  const inner = (
    <>
      <div className="co-rec__top">
        <div className="dsc-stage"><i aria-hidden="true" /><span className="dsc-stage__name">{item.type}</span></div>
        <span className="co-rec__date">{item.date}</span>
      </div>
      <div className="co-rec__group"><h2 className="co-rec__title">{item.title}</h2><p className="co-rec__context">{item.context}</p></div>
      <div className="co-rec__divider" />
      <div className="co-rec__meta">
        <div className="co-rec__field"><span className="dsc-label">Related work</span><p className="co-rec__value co-rec__value--work">{item.relatedWork}</p></div>
        <div className="co-rec__field"><span className="dsc-label">Project</span><p className="co-rec__value co-rec__value--project">{item.project}</p></div>
        {item.acknowledgement ? <div className="co-rec__field"><span className="dsc-label">Acknowledgement</span><p className="co-rec__value">{item.acknowledgement}</p></div> : null}
      </div>
      <span className="op-card__cta">View related work<CtaArrow /></span>
    </>
  );
  return item.href
    ? <Link href={item.href} className="co-rec" aria-label={`${item.title}, ${item.type}, ${item.date}. View related work`}>{inner}</Link>
    : <div className="co-rec co-rec--static">{inner}</div>;
}

/** `empty`: the design's Empty frame, at its own address. */
export default function Contributions({ variant }: { variant?: "empty" }) {
  const collab = useCollab({ engine: true });
  const status = variant === "empty" ? "ready" : pageStatus(collab);
  const head = <PageHead eyebrow="My contributions" title="What you have contributed." lead="A record of your work with others, shown with the context it came from. Only you can see this list." />;
  const items = status === "ready" && !variant ? contributionsOf(collab.projects, collab.myApps, collab.call) : [];

  let body: React.ReactNode;
  if (status === "loading") {
    body = <section className="dsc-results" aria-busy="true" aria-label="Contributions"><div className="dsc-summary"><p className="dsc-summary__count">Loading your contributions…</p></div></section>;
  } else if (status === "error") {
    body = (
      <PageState pair role="alert" headline="We could not load your contributions." support="Check your connection and try again. Your record is not lost.">
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button variant="secondary" href="/collaborate/my-projects">Go to My projects</Button>
      </PageState>
    );
  } else if (items.length === 0) {
    body = (
      <PageState headline="Your contributions will appear here." support="When you submit work, join a decision or complete a milestone with others, it is recorded here with the context it came from.">
        <Button href="/collaborate/my-projects">Go to My projects</Button>
      </PageState>
    );
  } else {
    body = (
      <section className="dsc-results" aria-label="Contributions">
        <div className="dsc-summary"><p className="dsc-summary__count" aria-live="polite">{items.length} {items.length === 1 ? "contribution" : "contributions"}</p><span className="dsc-summary__note">Most recent first</span></div>
        <div className="co-list" data-m="stagger">{items.map((c) => <Record key={c.id} item={c} />)}</div>
        <p className="dsc-summary__note co-note">{NOTE}</p>
      </section>
    );
  }
  return <div className="dsc-page"><div className="dsc-stack">{head}{body}</div></div>;
}
