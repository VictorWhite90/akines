/**
 * Feature switches for work that is built but parked.
 * Flip to true to bring a feature back; the code and routes stay in place.
 */
export const FEATURES = {
  /** Event check-in at the door (leader guest list, ticket codes). Parked 19 Oct 2026. */
  eventCheckIn: false,
  /** Events and tickets inside community circles. Off until the events backend exists (sample data only). */
  communityEvents: false,
  /** Small KinCircles started inside a community. Off until small circles are on the backend. */
  smallCirclesInCommunity: false,
} as const;
