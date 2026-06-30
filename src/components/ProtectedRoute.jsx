import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    // Signed in but no profile/institute yet (e.g. email confirmation
    // flow interrupted setup) — send back to finish signup.
    return <Navigate to="/signup" replace />;
  }

  return children;
}
