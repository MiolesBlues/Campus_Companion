"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected profile fetch failure", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const profileData = await fetchProfile(nextSession.user.id);
        if (mounted) {
          setProfile(profileData);
        }
      } else if (mounted) {
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    };

    const initialise = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        await applySession(currentSession);
      } catch (error) {
        console.error("Failed to initialise auth session", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    void initialise();

    const timeoutId = window.setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 4000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [configured]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isConfigured: configured,
      signOut: async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          return;
        }
        await supabase.auth.signOut();
      },
      refreshProfile: async () => {
        if (!user) {
          setProfile(null);
          return;
        }

        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      },
    }),
    [configured, loading, profile, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
