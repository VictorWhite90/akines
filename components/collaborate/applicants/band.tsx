"use client";

import Button from "@/components/kin/Button";
import { useApplicants } from "@/lib/collab/applicants";
import { CwLink, Over } from "../workspace/parts";
import { BAND } from "./data";
import { Portrait } from "./parts";
import "../styles/applicants.css";

/*
 * The Interest requests band (Figma "02b Interest requests"), mirrored from the product design's applicants/band.tsx:
 * the label, "N waiting", Review all, and a Request Card for each person who waits for an answer (status New).
 * Every card and Review all open the applicants page. Nothing waiting: no band.
 * On a project's Overview it reads the project's applicants; on the host's view of a call, the call's.
 */

export function InterestRequestsBand({ projectId, callId, href }: { projectId?: string; callId?: string; href: string }) {
  const review = useApplicants({ projectId, callId });
  const requests = review.list.filter((a) => a.status === "New");
  if (requests.length === 0) return null;

  return (
    <section className="ap-band" aria-label="Interest requests" data-m="up">
      <div className="ap-band__head">
        <div className="ap-band__title">
          <Over className="cw-over--12">{BAND.label}</Over>
          <p className="ap-band__count">{BAND.waiting(requests.length)}</p>
        </div>
        <CwLink href={href}>{BAND.reviewAll}</CwLink>
      </div>
      <ul className={requests.length === 1 ? "ap-band__cards ap-band__cards--one" : "ap-band__cards"}>
        {requests.map((r) => (
          <li key={r.id}>
            <article className="ap-req">
              <div className="ap-req__top">
                <Portrait a={r} size={48} />
                <div className="ap-req__text">
                  <h3 className="ap-req__name">{r.name}</h3>
                  <p className="ap-req__wants">{BAND.wants(r.wants)}</p>
                </div>
              </div>
              <p className="ap-req__msg">{r.short}</p>
              <Button size="sm" variant="secondary" href={href} className="ap-req__review">
                {BAND.review}<span className="sr-only"> {r.name}</span>
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
