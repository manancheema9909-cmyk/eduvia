import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const TIER_LABEL = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function Settings() {
  const { institute, profile } = useAuth();

  return (
    <PageShell title="Settings" subtitle="Manage your institute's workspace">
      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Institute</CardTitle>
            <CardDescription>Basic details about your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-ink/50">
                Name
              </p>
              <p className="font-body text-sm text-ink mt-0.5">
                {institute?.name}
              </p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-ink/50">
                Slug
              </p>
              <p className="font-mono text-sm text-ink/70 mt-0.5">
                {institute?.slug}
              </p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-ink/50">
                Plan
              </p>
              <p className="font-body text-sm text-brass mt-0.5">
                {TIER_LABEL[institute?.subscription_tier] ?? "Free"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your account</CardTitle>
            <CardDescription>Signed in as</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-ink/50">
                Name
              </p>
              <p className="font-body text-sm text-ink mt-0.5">
                {profile?.full_name}
              </p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-ink/50">
                Role
              </p>
              <p className="font-body text-sm text-ink/70 mt-0.5 capitalize">
                {profile?.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
