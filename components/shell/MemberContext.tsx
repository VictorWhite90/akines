"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { account, fullName, type MyProfile } from "@/lib/api/account";

/** The signed-in member as the app frame shows them. */
export type Me = { id: string; username: string | null; name: string; firstName: string; email: string; photo: string | null };

type MemberState = { me: Me | null; loading: boolean; refresh: () => Promise<void>; setFromProfile: (p: MyProfile) => void };

const CACHE_KEY = "ak:me";
const MemberContext = createContext<MemberState>({ me: null, loading: true, refresh: async () => {}, setFromProfile: () => {} });

function toMe(p: MyProfile): Me {
  return {
    id: p.user_id,
    username: p.username,
    name: fullName(p),
    firstName: p.first_name || (p.username ? `@${p.username}` : "You"),
    email: p.email,
    photo: p.profile_photo,
  };
}

function cached(): Me | null {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null");
  } catch {
    return null;
  }
}

/** Loads the member once per tab (cached in sessionStorage for an instant first paint) and shares it with the frame. */
export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const store = useCallback((next: Me) => {
    setMe(next);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    const r = await account.profile();
    if (r.ok) store(toMe(r.data));
    setLoading(false);
  }, [store]);

  useEffect(() => {
    const hit = cached();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- paint the cached member before the network answers
    if (hit) setMe(hit);
    void refresh();
  }, [refresh]);

  const setFromProfile = useCallback((p: MyProfile) => store(toMe(p)), [store]);

  return <MemberContext.Provider value={{ me, loading, refresh, setFromProfile }}>{children}</MemberContext.Provider>;
}

export const useMe = () => useContext(MemberContext);

export function clearMemberCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}
