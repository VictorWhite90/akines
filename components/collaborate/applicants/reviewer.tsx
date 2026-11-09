"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/kin/Toast";
import type { Review } from "@/lib/collab/applicants";
import { NOT_NOW, OFFER, TIMES } from "./data";
import { NotNowModal, ProposeTimesModal, SendOfferModal } from "./modals";
import { ApplicantSlideOut } from "./slideout";
import type { Group } from "./parts";

/*
 * What a host can do with a person who applied, shared by the list, the compare page and the slide-out (the product
 * design's applicants/reviewer.tsx): open the slide-out, Shortlist, Propose times, Send offer and Not now (with Undo
 * in its toast). The overlays are rendered in `layer`. An action taken away from the list (Compare, a state route)
 * ends on the list, as the design's modals do.
 */

type ModalState = { kind: "times" | "offer" | "notnow"; id: string };

export function useReviewer(review: Review, group: Group, home: string) {
  const router = useRouter();
  const path = usePathname();
  const [slide, setSlide] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const toList = () => { if (path !== home) router.push(home); };
  const finish = () => { setModal(null); setSlide(null); toList(); };

  const open = (id: string) => { review.view(id); setSlide(id); };
  const shortlist = (id: string) => {
    review.shortlist(id);
    // a shortlisted person of a call has no slide-out; on a project it becomes the Shortlisted one
    if (group === "call") setSlide(null);
  };
  const propose = (id: string) => setModal({ kind: "times", id });
  const offer = (id: string) => setModal({ kind: "offer", id });
  const notNow = (id: string) => setModal({ kind: "notnow", id });
  const undo = (id: string) => { review.undoNotNow(id); toList(); };

  const person = modal ? review.list.find((a) => a.id === modal.id) ?? null : null;
  const layer = (
    <>
      <ApplicantSlideOut id={slide} group={group} review={review} onClose={() => setSlide(null)} h={{ shortlist, propose, offer, notNow }} />
      <ProposeTimesModal open={modal?.kind === "times"} person={modal?.kind === "times" ? person : null} onClose={() => setModal(null)}
        onSend={(slots, message) => { if (!person) return; review.proposeTimes(person.id, slots, message); toast.show({ message: TIMES.toast(person.name) }); finish(); }} />
      <SendOfferModal open={modal?.kind === "offer"} person={modal?.kind === "offer" ? person : null} onClose={() => setModal(null)}
        onSend={(terms) => { if (!person) return; review.sendOffer(person.id, terms); toast.show({ message: OFFER.toast(person.name) }); finish(); }} />
      <NotNowModal open={modal?.kind === "notnow"} person={modal?.kind === "notnow" ? person : null} onClose={() => setModal(null)}
        onSend={(message) => {
          if (!person) return;
          const id = person.id;
          const before = review.notNow(id, message);
          toast.show({ message: NOT_NOW.toast(person.name), actionLabel: "Undo", onAction: () => { if (before) review.restore(id, before); toList(); } });
          finish();
        }} />
    </>
  );

  return { open, shortlist, propose, offer, notNow, undo, layer };
}
