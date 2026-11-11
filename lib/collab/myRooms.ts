import type { Room } from "@/lib/data/community";
import { useLocal } from "@/lib/useLocal";

/** Rooms you opened (a project's Create Call opens one), kept in this browser. */
export const MY_ROOMS_KEY = "ac:rooms";
export const useMyRooms = () => useLocal<Room[]>(MY_ROOMS_KEY, []);
