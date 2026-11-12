/**
 * How a circle is joined from Connect (the design's CircleAccess): open circles join at once, approval circles take a request
 * that the hosts answer. Shaped like the field the backend will serve on a circle (access: "open" | "approval").
 */
export type CircleAccess = "open" | "approval";

/** Circles whose hosts approve each member: care workers and parents share things they keep among themselves. */
const APPROVAL = new Set(["ceramics", "curators"]);

export const circleAccess = (id: string): CircleAccess => (APPROVAL.has(id) ? "approval" : "open");
