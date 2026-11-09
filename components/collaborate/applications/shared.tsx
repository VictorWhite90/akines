/**
 * Shared parts of the application journey (Figma 12.44 APPLICATION STATUS, components page section 13):
 * StatusPill = Figma "Application Status" (set 17972:138675) and ApplicationTimeline = "Application Timeline" (set 17972:140671)
 * built from "Application Step" (set 17972:140290). Pure presentational: no state, no "use client", so server code and
 * the host (applicants) and introduction request (people) pages can import them. Classes are prefixed apl- (../styles/applications-shared.css).
 */
import "../styles/applications-shared.css";
import type { ReactNode } from "react";

export type ApplicationStatus =
  | "Pending"
  | "New"
  | "Shortlisted"
  | "Talk booked"
  | "Offer received"
  | "Offer sent"
  | "Joined"
  | "Not selected"
  | "Not now"
  | "Declined"
  | "Withdrawn";

type Tone = "warning" | "info" | "success" | "muted";
const TONE: Record<ApplicationStatus, Tone> = {
  Pending: "warning",
  New: "info",
  Shortlisted: "info",
  "Talk booked": "info",
  "Offer received": "success",
  "Offer sent": "success",
  Joined: "success",
  "Not selected": "muted",
  "Not now": "muted",
  Declined: "muted",
  Withdrawn: "muted",
};

/* ------------------------------------------------------------------ icons (14 x 14 frame, Figma icon set, stroke 0.875) */

const P = { fill: "none", stroke: "currentColor", strokeWidth: 0.875, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const at = (x: number, y: number) => `translate(${x} ${y})`;

const ICONS: Record<ApplicationStatus, ReactNode> = {
  Pending: (
    <>
      <path {...P} transform={at(1.1667, 1.1667)} d="M11.6667 5.8333C11.6667 9.055 9.055 11.6667 5.8333 11.6667C2.6117 11.6667 0 9.055 0 5.8333C0 2.6117 2.6117 0 5.8333 0C9.055 0 11.6667 2.6117 11.6667 5.8333Z" />
      <path {...P} transform={at(7, 3.5)} d="M0 0L0 3.5L2.3333 4.6667" />
    </>
  ),
  New: (
    <path
      {...P}
      transform={at(1.1676, 1.1665)}
      d="M4.629 7.8751C4.5769 7.6733 4.4717 7.489 4.3243 7.3416C4.1769 7.1942 3.9927 7.089 3.7908 7.0369L0.212 6.1141C0.151 6.0967 0.0972 6.06 0.059 6.0093C0.0207 5.9587 0 5.8969 0 5.8335C0 5.77 0.0207 5.7083 0.059 5.6576C0.0972 5.607 0.151 5.5702 0.212 5.5529L3.7908 4.6295C3.9926 4.5774 4.1768 4.4723 4.3242 4.325C4.4716 4.1777 4.5769 3.9936 4.629 3.7918L5.5519 0.2131C5.569 0.1518 5.6058 0.0978 5.6565 0.0593C5.7072 0.0208 5.7691 0 5.8327 0C5.8964 0 5.9583 0.0208 6.009 0.0593C6.0597 0.0978 6.0965 0.1518 6.1136 0.2131L7.0359 3.7918C7.0879 3.9937 7.1932 4.1779 7.3406 4.3253C7.488 4.4728 7.6722 4.578 7.8741 4.6301L11.4529 5.5523C11.5144 5.5693 11.5687 5.606 11.6074 5.6568C11.646 5.7076 11.667 5.7696 11.667 5.8335C11.667 5.8973 11.646 5.9594 11.6074 6.0102C11.5687 6.061 11.5144 6.0977 11.4529 6.1146L7.8741 7.0369C7.6722 7.089 7.488 7.1942 7.3406 7.3416C7.1932 7.489 7.0879 7.6733 7.0359 7.8751L6.113 11.4539C6.0959 11.5152 6.0591 11.5692 6.0084 11.6077C5.9577 11.6461 5.8958 11.667 5.8322 11.667C5.7685 11.667 5.7066 11.6461 5.6559 11.6077C5.6052 11.5692 5.5684 11.5152 5.5513 11.4539L4.629 7.8751Z"
    />
  ),
  Shortlisted: (
    <path {...P} transform={at(2.9167, 1.75)} d="M8.1667 10.5L4.0833 8.1667L0 10.5L0 1.1667C0 0.525 0.525 0 1.1667 0L7 0C7.6417 0 8.1667 0.525 8.1667 1.1667L8.1667 10.5Z" />
  ),
  "Talk booked": (
    <>
      <path {...P} transform={at(4.6667, 1.1667)} d="M0 0L0 2.3333" />
      <path {...P} transform={at(9.3333, 1.1667)} d="M0 0L0 2.3333" />
      <path {...P} transform={at(1.75, 2.3333)} d="M1.1667 0L9.3333 0C9.9777 0 10.5 0.5223 10.5 1.1667L10.5 9.3333C10.5 9.9777 9.9777 10.5 9.3333 10.5L1.1667 10.5C0.5223 10.5 0 9.9777 0 9.3333L0 1.1667C0 0.5223 0.5223 0 1.1667 0Z" />
      <path {...P} transform={at(1.75, 5.8333)} d="M0 0L10.5 0" />
    </>
  ),
  "Offer received": (
    <>
      <path {...P} transform={at(6.4167, 9.3333)} d="M0 0.5833L1.1667 1.75C1.2816 1.8649 1.418 1.9561 1.5681 2.0182C1.7183 2.0804 1.8792 2.1124 2.0417 2.1124C2.2042 2.1124 2.3651 2.0804 2.5152 2.0182C2.6653 1.9561 2.8018 1.8649 2.9167 1.75C3.0316 1.6351 3.1227 1.4987 3.1849 1.3485C3.2471 1.1984 3.2791 1.0375 3.2791 0.875C3.2791 0.7125 3.2471 0.5516 3.1849 0.4015C3.1227 0.2513 3.0316 0.1149 2.9167 0" />
      <path
        {...P}
        transform={at(4.0126, 1.7497)}
        d="M4.1541 6.417L5.6124 7.8753C5.8445 8.1074 6.1592 8.2377 6.4874 8.2377C6.8156 8.2377 7.1304 8.1074 7.3624 7.8753C7.5945 7.6432 7.7249 7.3285 7.7249 7.0003C7.7249 6.6721 7.5945 6.3574 7.3624 6.1253L5.0991 3.862C4.771 3.5342 4.3262 3.3502 3.8624 3.3502C3.3987 3.3502 2.9539 3.5342 2.6258 3.862L2.1124 4.3753C1.8804 4.6074 1.5656 4.7377 1.2374 4.7377C0.9092 4.7377 0.5945 4.6074 0.3624 4.3753C0.1304 4.1432 0 3.8285 0 3.5003C0 3.1721 0.1304 2.8574 0.3624 2.6253L2.0016 0.9861C2.5337 0.4554 3.2277 0.1173 3.9736 0.0254C4.7196 -0.0666 5.4749 0.0929 6.1199 0.4786L6.3941 0.642C6.6425 0.7919 6.9378 0.8439 7.2224 0.7878L8.2374 0.5836"
      />
      <path {...P} transform={at(11.6667, 1.75)} d="M0.5833 0L1.1667 6.4167L0 6.4167" />
      <path {...P} transform={at(1.1667, 1.75)} d="M0.5833 0L0 6.4167L3.7917 10.2083C4.0237 10.4404 4.3385 10.5708 4.6667 10.5708C4.9949 10.5708 5.3096 10.4404 5.5417 10.2083C5.7737 9.9763 5.9041 9.6615 5.9041 9.3333C5.9041 9.0051 5.7737 8.6904 5.5417 8.4583" />
      <path {...P} transform={at(1.75, 2.3333)} d="M0 0L4.6667 0" />
    </>
  ),
  "Offer sent": (
    <>
      <path {...P} transform={at(1.1667, 1.1667)} d="M11.6667 0L7.5833 11.6667L5.25 6.4167L0 4.0833L11.6667 0Z" />
      <path {...P} transform={at(6.4167, 1.1667)} d="M6.4167 0L0 6.4167" />
    </>
  ),
  Joined: (
    <>
      <path {...P} transform={at(1.1667, 1.1667)} d="M11.6667 5.8333C11.6667 9.055 9.055 11.6667 5.8333 11.6667C2.6117 11.6667 0 9.055 0 5.8333C0 2.6117 2.6117 0 5.8333 0C9.055 0 11.6667 2.6117 11.6667 5.8333Z" />
      <path {...P} transform={at(5.25, 5.8333)} d="M0 1.1667L1.1667 2.3333L3.5 0" />
    </>
  ),
  "Not selected": <path {...P} transform={at(2.9167, 7)} d="M0 0L8.1667 0" />,
  "Not now": <path {...P} transform={at(2.9167, 7)} d="M0 0L8.1667 0" />,
  Declined: <path {...P} strokeWidth={1.05} transform={at(3.5, 3.5)} d="M0 0L7 7M7 0L0 7" />,
  Withdrawn: (
    <>
      <path
        {...P}
        transform={at(1.75, 1.75)}
        d="M0 5.25C0 6.2884 0.3079 7.3034 0.8848 8.1667C1.4617 9.0301 2.2816 9.703 3.2409 10.1004C4.2002 10.4977 5.2558 10.6017 6.2742 10.3991C7.2926 10.1966 8.2281 9.6965 8.9623 8.9623C9.6965 8.2281 10.1966 7.2926 10.3991 6.2742C10.6017 5.2558 10.4977 4.2002 10.1004 3.2409C9.703 2.2816 9.0301 1.4617 8.1667 0.8848C7.3034 0.3079 6.2884 0 5.25 0C3.7823 0.0055 2.3736 0.5782 1.3183 1.5983L0 2.9167"
      />
      <path {...P} transform={at(1.75, 1.75)} d="M0 0L0 2.9167L2.9167 2.9167" />
    </>
  ),
};

/** Application Status (Figma 17972:138675): 31 px pill, tone tint, icon and label (never colour alone). Display only. */
export function StatusPill({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span className={`apl-pill apl-pill--${TONE[status]}${className ? ` ${className}` : ""}`}>
      <svg className="apl-pill__icon" width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        {ICONS[status]}
      </svg>
      <span className="apl-pill__label">{status}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ timeline */

export type StepState = "done" | "current" | "upcoming" | "skipped" | "ended";
export type TimelineStep = {
  title: string;
  note: string;
  state: StepState;
  /** Mark inside an `ended` step: the minus of Not selected and Not now (default), the cross of Declined, the arrow of Withdrawn. By default it follows the title. */
  endIcon?: "minus" | "cross" | "undo";
};

const ENDED_ICONS = {
  minus: <path {...P} transform={at(2.9167, 7)} d="M0 0L8.1667 0" />,
  cross: <path {...P} transform={at(3.5, 3.5)} d="M0 0L7 7M7 0L0 7" />,
  undo: ICONS.Withdrawn,
};
const endIconFor = (s: TimelineStep): keyof typeof ENDED_ICONS => s.endIcon ?? (s.title === "Declined" ? "cross" : s.title === "Withdrawn" ? "undo" : "minus");

function StepNode({ step }: { step: TimelineStep }) {
  if (step.state === "done") {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        <path {...P} transform={at(2.3333, 3.5)} d="M9.3333 0L2.9167 6.4167L0 3.5" />
      </svg>
    );
  }
  if (step.state === "skipped") {
    return (
      <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path {...P} strokeWidth={0.75} transform={at(2.5, 6)} d="M0 0L7 0" />
      </svg>
    );
  }
  if (step.state === "ended") {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        {ENDED_ICONS[endIconFor(step)]}
      </svg>
    );
  }
  return null;
}

const STATE_WORD: Record<StepState, string> = { done: "Done", current: "Current step", upcoming: "Upcoming", skipped: "Skipped", ended: "Ended" };

/** Application Step (Figma 17972:140290): a rail with the node and the line down to the next step, and the title with its note. */
function Step({ step, last }: { step: TimelineStep; last: boolean }) {
  return (
    <li className="apl-step" data-state={step.state} data-last={last || undefined} aria-current={step.state === "current" ? "step" : undefined}>
      <span className="apl-step__rail" aria-hidden="true">
        <span className="apl-step__node">
          {step.state === "current" ? <i className="apl-step__dot" /> : <StepNode step={step} />}
        </span>
        {last ? null : <span className="apl-step__line" />}
      </span>
      <span className="apl-step__text">
        <span className="apl-step__title">
          {step.title}
          <span className="apl-sr"> ({STATE_WORD[step.state]})</span>
        </span>
        <span className="apl-step__note">{step.note}</span>
      </span>
    </li>
  );
}

/** Application Timeline (Figma 17972:140671): white card with a serif heading and 3 to 5 steps; the last step has no line. `trailingLine` keeps the line under the last step (the 12.47 Pending and Accepted pages show three of the five steps, so step 3 still has its line). */
export function ApplicationTimeline({ heading = "Your application", steps, className, trailingLine }: { heading?: string; steps: TimelineStep[]; className?: string; trailingLine?: boolean }) {
  return (
    <section className={`apl-timeline${className ? ` ${className}` : ""}`} aria-label={heading}>
      <h2 className="apl-timeline__heading">{heading}</h2>
      <ol className="apl-timeline__steps">
        {steps.map((s, i) => (
          <Step key={`${s.title}-${i}`} step={s} last={i === steps.length - 1 && !trailingLine} />
        ))}
      </ol>
    </section>
  );
}
