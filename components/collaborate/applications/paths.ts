/*
 * Paths of the applicant journey (12.44 APPLICATION STATUS): /collaborate/projects/requests/<call id> shows the stage the
 * request is at; the tails open one stage's page (/shortlisted, /time, /talk, /offer, /joined, /declined, /not-selected,
 * /withdrawn) or a state with no natural trigger (/state-loading, /state-error).
 */
export type RequestView = "shortlisted" | "time" | "talk" | "offer" | "joined" | "declined" | "not-selected" | "withdrawn" | "state-loading" | "state-error";

export const requestHref = (callId: string, view?: RequestView) => `/collaborate/projects/requests/${encodeURIComponent(callId)}${view ? `/${view}` : ""}`;
export const projectPath = (callId: string) => `/collaborate/projects/${encodeURIComponent(callId)}`;
export const DISCOVER_PATH = "/collaborate/discover";
export const HOME_PATH = "/collaborate";
export const MY_PROJECTS_PATH = "/collaborate/my-projects";
