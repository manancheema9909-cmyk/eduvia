import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { FeeSeal } from "@/components/FeeSeal";
import { EmptyState } from "@/components/EmptyState";
import { useStudents } from "@/hooks/useStudents";
import { useFees } from "@/hooks/useFees";
import { useInstructors } from "@/hooks/useInstructors";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/dateUtils";

function formatPKR(amount) {
  return `Rs ${Number(amount ?? 0).toLocaleString("en-PK")}`;
}

export function Dashboard() {
  const { institute } = useAuth();
  const { students, loading: studentsLoading } = useStudents();
  const { fees, loading: feesLoading } = useFees();
  const { instructors, loading: instructorsLoading } = useInstructors();

  const loading = studentsLoading || feesLoading || instructorsLoading;

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === "active");
    const collected = fees.reduce((sum, f) => sum + Number(f.paid_amount), 0);
    const billed = fees.reduce((sum, f) => sum + Number(f.amount), 0);
    const overdue = fees.filter((f) => f.status === "overdue");
    const overdueTotal = overdue.reduce(
      (sum, f) => sum + (Number(f.amount) - Number(f.paid_amount)),
      0
    );
    const courseCount = new Set(
      students.map((s) => s.course_id).filter(Boolean)
    ).size;

    return {
      activeStudentCount: activeStudents.length,
      courseCount,
      collected,
      billed,
      overdueCount: overdue.length,
      overdueTotal,
      instructorCount: instructors.length,
    };
  }, [students, fees, instructors]);

  const upcomingFees = fees.slice(0, 6);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell
      title="Dashboard"
      subtitle={`${today} — ${institute?.name ?? ""}`}
    >
      {loading ? (
        <p className="font-body text-sm text-ink/50">Loading dashboard…</p>
      ) : (
        <>
          <section className="grid grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Active students"
              value={String(stats.activeStudentCount)}
              sublabel={`across ${stats.courseCount} course${
                stats.courseCount === 1 ? "" : "s"
              }`}
              accent="ink"
            />
            <StatCard
              label="Total collected"
              value={formatPKR(stats.collected)}
              sublabel={`of ${formatPKR(stats.billed)} billed`}
              accent="ledger-green"
            />
            <StatCard
              label="Overdue fees"
              value={String(stats.overdueCount)}
              sublabel={`${formatPKR(stats.overdueTotal)} outstanding`}
              accent="stamp-red"
            />
            <StatCard
              label="Instructors"
              value={String(stats.instructorCount)}
              accent="brass"
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-ink">
                Fee register
              </h2>
              <Link
                to="/fees"
                className="font-body text-sm text-brass hover:text-brass-light transition-colors"
              >
                View all →
              </Link>
            </div>

            {upcomingFees.length === 0 ? (
              <EmptyState
                title="No fee records yet"
                description="Once you add students and assign fees, they'll show up here."
                action={
                  <Link to="/students">
                    <button className="font-body text-sm text-brass hover:text-brass-light">
                      Go to students →
                    </button>
                  </Link>
                }
              />
            ) : (
              <div className="border border-border-paper rounded-[var(--radius-card)] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-paper-dim border-b border-border-paper">
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                        Student
                      </th>
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                        Course
                      </th>
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3 text-right">
                        Amount
                      </th>
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3 text-right">
                        Paid
                      </th>
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                        Due
                      </th>
                      <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingFees.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className={`border-b border-border-paper last:border-b-0 ${
                          idx % 2 === 1 ? "bg-paper-dim/40" : ""
                        }`}
                      >
                        <td className="font-body text-sm text-ink px-5 py-3.5">
                          {entry.student_name}
                        </td>
                        <td className="font-body text-sm text-ink/70 px-5 py-3.5">
                          {entry.course_name}
                        </td>
                        <td className="font-mono text-sm text-ink text-right px-5 py-3.5">
                          {formatPKR(entry.amount)}
                        </td>
                        <td className="font-mono text-sm text-ink/70 text-right px-5 py-3.5">
                          {formatPKR(entry.paid_amount)}
                        </td>
                        <td className="font-mono text-sm text-ink/60 px-5 py-3.5">
                          {formatDate(entry.due_date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <FeeSeal status={entry.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}
