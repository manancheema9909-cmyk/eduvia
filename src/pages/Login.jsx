import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL ?? "";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "";
const DEMO_ENABLED = Boolean(DEMO_EMAIL && DEMO_PASSWORD);

export function Login() {
  const navigate = useNavigate();
  // Pre-filled with demo credentials so a visitor can land on this
  // page and just hit "Log in" without typing or hunting for anything.
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="font-display text-2xl font-semibold text-ink mb-1">
            Eduvia
          </p>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            {DEMO_ENABLED
              ? "Demo credentials are already filled in — just click Log in to look around."
              : "Welcome back. Enter your details to access your dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@institute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="font-body text-sm text-stamp-red" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="font-body text-sm text-ink/50 text-center mt-5">
            Don't have an institute yet?{" "}
            <Link to="/signup" className="text-brass hover:text-brass-light">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
