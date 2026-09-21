import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type PaceRole = "senior" | "staff";

export type PacePerson = { name: string; relationship: string };

export type PacePreferences = {
  onboarded: boolean;
  music: string[];
  people: PacePerson[];
  interests: string[];
  tileUsage: Record<string, number>;
  lastMoment: { label: string; path: string } | null;
};

export const emptyPreferences: PacePreferences = {
  onboarded: false,
  music: [],
  people: [],
  interests: [],
  tileUsage: {},
  lastMoment: null,
};

export type PaceProfile = {
  id: string;
  display_name: string;
  greeting_name: string;
  accessibility: Record<string, unknown>;
  preferences: Record<string, unknown>;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: PaceRole | null;
  profile: PaceProfile | null;
  preferences: PacePreferences;
  savePreferences: (patch: Partial<PacePreferences>) => Promise<void>;
  saveGreetingName: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function PaceAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<PaceRole | null>(null);
  const [profile, setProfile] = useState<PaceProfile | null>(null);

  const loadDetails = async (userId: string | undefined) => {
    if (!userId) {
      setRole(null);
      setProfile(null);
      return;
    }
    const [{ data: roles }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("profiles")
        .select("id, display_name, greeting_name, accessibility, preferences")
        .eq("id", userId)
        .maybeSingle(),
    ]);
    const found = roles?.map((row) => row.role as PaceRole) ?? [];
    setRole(found.includes("staff") ? "staff" : found.includes("senior") ? "senior" : null);
    setProfile(
      profileRow
        ? {
            id: profileRow.id,
            display_name: profileRow.display_name,
            greeting_name: profileRow.greeting_name,
            accessibility: (profileRow.accessibility ?? {}) as Record<string, unknown>,
            preferences: (profileRow.preferences ?? {}) as Record<string, unknown>,
          }
        : null,
    );
  };

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setRole(null);
        setProfile(null);
        return;
      }
      if (nextSession?.user?.id) void loadDetails(nextSession.user.id);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadDetails(data.session?.user?.id);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const preferences: PacePreferences = {
    ...emptyPreferences,
    ...((profile?.preferences ?? {}) as Partial<PacePreferences>),
  };

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      preferences,
      savePreferences: async (patch) => {
        const userId = session?.user?.id;
        if (!userId) return;
        const next = { ...preferences, ...patch };
        setProfile((current) => (current ? { ...current, preferences: next } : current));
        await supabase
          .from("profiles")
          .update({ preferences: next, updated_at: new Date().toISOString() })
          .eq("id", userId);
      },
      saveGreetingName: async (greeting) => {
        const userId = session?.user?.id;
        if (!userId) return;
        const clean = greeting.trim() || "Friend";
        setProfile((current) =>
          current ? { ...current, greeting_name: clean, display_name: clean } : current,
        );
        await supabase
          .from("profiles")
          .update({ greeting_name: clean, display_name: clean, updated_at: new Date().toISOString() })
          .eq("id", userId);
      },
      session,
      user: session?.user ?? null,
      role,
      profile,
      refresh: async () => {
        const { data } = await supabase.auth.getUser();
        await loadDetails(data.user?.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setRole(null);
        setProfile(null);
        setSession(null);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, session, role, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function usePaceAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("usePaceAuth must be used inside PaceAuthProvider");
  return value;
}
