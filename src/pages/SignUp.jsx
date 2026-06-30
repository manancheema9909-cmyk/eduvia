import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { sanitizeNameInput } from "@/lib/inputUtils";
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

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({ email, password });

      if (signUpError) throw signUpError;

      const slug = `${slugify(instituteName)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      if (!signUpData.session) {
        // Email confirmation is required before a session exists.
        // Stash the institute details so we can finish setup the
        // moment the user actually logs in after confirming.
        localStorage.setItem(
          "eduvia_pending_institute",
          JSON.stringify({ instituteName, slug, fullName })
        );
        setError(
          "Check your inbox to confirm your email. Once confirmed, log in and your institute will be set up automatically."
        );
        setSubmitting(false);
        return;
      }

      const { error: rpcError } = await supabase.rpc(
        "create_institute_with_owner",
        {
          institute_name: instituteName,
          institute_slug: slug,
          owner_full_name: fullName,
        }
      );

      if (rpcError) throw rpcError;

      navigate("/dashboard");
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="font-display text-2xl font-semibold text-ink mb-1">
            Eduvia
          </p>
          <CardTitle>Set up your institute</CardTitle>
          <CardDescription>
            Create an account and your institute's workspace in one step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="instituteName">Institute name</Label>
              <Input
                id="instituteName"
                placeholder="Crescent Institute of Technology"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(sanitizeNameInput(e.target.value))}
                required
              />
            </div>

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
                placeholder="At least 8 characters"
                minLength={8}
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
              {submitting ? "Creating your workspace…" : "Create institute"}
            </Button>
          </form>

          <p className="font-body text-sm text-ink/50 text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brass hover:text-brass-light">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
