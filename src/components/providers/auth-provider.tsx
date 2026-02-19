"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { EffectivePlan } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Full name from profiles table (synced when user updates profile). */
  profileFullName: string | null;
  /** Effective plan (from latest valid assignment or BASE). Loaded after user is set. */
  effectivePlan: EffectivePlan | null;
  planLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profileFullName: null,
  effectivePlan: null,
  planLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan | null>(
    null
  );
  const [planLoading, setPlanLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user?.id) {
      setProfileFullName(null);
      setEffectivePlan(null);
      setPlanLoading(false);
      return;
    }
    let cancelled = false;
    setPlanLoading(true);
    void Promise.resolve(
      supabase.from("profiles").select("full_name").eq("id", user.id).single()
    )
      .then(({ data }) => {
        if (!cancelled && data?.full_name != null) {
          setProfileFullName(data.full_name.trim() || null);
        } else if (!cancelled) {
          setProfileFullName(null);
        }
      })
      .catch(() => {
        if (!cancelled) setProfileFullName(null);
      });
    void Promise.resolve(
      supabase.rpc("get_effective_plan", { p_user_id: user.id })
    )
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setEffectivePlan(null);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.plan_code && row?.config) {
          setEffectivePlan({
            plan_code: row.plan_code as EffectivePlan["plan_code"],
            config: row.config as EffectivePlan["config"],
          });
        } else {
          setEffectivePlan(null);
        }
      })
      .catch(() => {
        if (!cancelled) setEffectivePlan(null);
      })
      .then(() => {
        if (!cancelled) setPlanLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profileFullName,
        effectivePlan,
        planLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
