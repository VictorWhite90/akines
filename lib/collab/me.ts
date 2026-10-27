import type { PersonId } from "@/lib/data/people";

/**
 * Who "you" are on the collaboration screens. The demo plays Amara; a real build sets the signed-in member's
 * user id once their profile loads (lib/api/collab.ts), before any collaboration screen is ready.
 */
export let ME: PersonId = "amara";
export function setMe(id: string) { ME = id as PersonId; }
