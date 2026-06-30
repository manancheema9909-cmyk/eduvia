import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfileAndInstitute(userId) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profileData) {
      // No profile yet — check if signup was interrupted by an
      // email-confirmation step and finish setup now.
      const pendingRaw = localStorage.getItem("eduvia_pending_institute");
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          const { error: rpcError } = await supabase.rpc(
            "create_institute_with_owner",
            {
              institute_name: pending.instituteName,
              institute_slug: pending.slug,
              owner_full_name: pending.fullName,
            }
          );
          localStorage.removeItem("eduvia_pending_institute");

          if (!rpcError) {
            // Retry loading now that the profile exists.
            const { data: retryProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();

            if (retryProfile) {
              setProfile(retryProfile);
              const { data: instituteData } = await supabase
                .from("institutes")
                .select("*")
                .eq("id", retryProfile.institute_id)
                .maybeSingle();
              setInstitute(instituteData ?? null);
              return;
            }
          }
        } catch {
          // Malformed pending data — fall through to "no profile" state.
        }
      }

      setProfile(null);
      setInstitute(null);
      return;
    }

    setProfile(profileData);

    const { data: instituteData } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", profileData.institute_id)
      .maybeSingle();

    setInstitute(instituteData ?? null);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        await loadProfileAndInstitute(session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadProfileAndInstitute(session.user.id);
        } else {
          setProfile(null);
          setInstitute(null);
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (session?.user) {
      await loadProfileAndInstitute(session.user.id);
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    institute,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
