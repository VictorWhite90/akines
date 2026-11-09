/*
 * Copy and paths of the lists behind the Collaborate Home count tiles, word for word from the product design
 * (overview-lists/data.ts): 12.48 Decisions awaiting you and 12.50 Tasks due this week, each with Empty and
 * Loading, and the paths of 12.49 Introduction requests (built with the collaborators pages). The rows are ours,
 * read across the member's projects (see ./probe.tsx).
 */

export const OL = {
  home: "/collaborate",
  myProjects: "/collaborate/my-projects",
  decisions: "/collaborate/decisions",
  decisionsEmpty: "/collaborate/decisions/state-empty",
  decisionsLoading: "/collaborate/decisions/state-loading",
  introductions: "/collaborate/introductions",
  introductionsEmpty: "/collaborate/introductions/state-empty",
  tasks: "/collaborate/tasks",
  tasksEmpty: "/collaborate/tasks/state-empty",
  tasksLoading: "/collaborate/tasks/state-loading",
  /** 12.46 Open calls, the calls the member hosts. */
  openCalls: "/collaborate/open-calls",
  homeLoading: "/collaborate/state-loading",
} as const;

/** The back link of the lists. */
export const BACK = { label: "Collaborate Home", href: OL.home };

export const DECISIONS_PAGE = {
  eyebrow: "DECISIONS",
  title: "Decisions awaiting you.",
  lead: "Choices your teams are waiting on you for, across all your projects.",
  tab: "Awaiting you",
  empty: {
    headline: "Nothing is waiting for your decision.",
    support: "When a team asks for your answer on a choice, it will appear here.",
    action: "View my projects",
    href: OL.myProjects,
  },
};

export const TASKS_PAGE = {
  eyebrow: "TASKS",
  title: "Tasks due this week.",
  lead: "What is due in the next few days, across all your projects.",
  tab: "Due this week",
  empty: {
    headline: "No tasks are due this week.",
    support: "When a task has a due date this week, it will appear here with its project.",
    action: "View my projects",
    href: OL.myProjects,
  },
};

/** Loading is announced to assistive technology only; the tab row of a loading list says "Loading". */
export const LOADING_COUNT = "Loading";
export const countOf = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
