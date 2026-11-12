/**
 * How a circle is joined from Connect (the design's CircleAccess): open circles join at once, approval circles take a request
 * that the hosts answer. Shaped like the field the backend will serve on a circle (access: "open" | "approval").
 */
export type CircleAccess = "open" | "approval";

/** The design's approval circles: Poetry and Wine talk, Community Health Circle. */
const APPROVAL = new Set(["poetry", "health"]);

export const circleAccess = (id: string): CircleAccess => (APPROVAL.has(id) ? "approval" : "open");
