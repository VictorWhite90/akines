"use client";

import Wizard from "./Wizard";
import StudioHome from "./StudioHome";
import { useStudioState } from "./useMyStudio";
import type { Studio } from "@/lib/data/studio";

/** /studio: the wizard until the member has opened a studio, then the studio itself. */
export default function StudioApp({ demo }: { demo?: string }) {
  const state = useStudioState(demo);

  if (!state.ready) {
    return (
      <div className="sd sd-skel" aria-busy="true" aria-label="Loading your studio">
        <div className="a" />
        <div className="b" />
      </div>
    );
  }
  if (!state.studio) {
    const step = demo === "wizard2" ? 2 : demo === "wizard3" ? 3 : 1;
    const finish = (s: Studio) => {
      state.create(s);
      window.scrollTo({ top: 0 });
    };
    return <Wizard key={step} onFinish={finish} initialStep={step} prefill={!!demo} />;
  }
  return <StudioHome state={state} demo={demo} />;
}
