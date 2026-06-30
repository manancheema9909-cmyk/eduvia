import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { sanitizeAmountInput } from "@/lib/inputUtils";

function formatPKR(amount) {
  return `Rs ${Number(amount ?? 0).toLocaleString("en-PK")}`;
}

export function Courses() {
  const { institute } = useAuth();
  const { courses, loading, refetch } = useCourses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function resetForm() {
    setName("");
    setDurationWeeks("");
    setFeeAmount("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(course) {
    setEditingId(course.id);
    setName(course.name);
    setDurationWeeks(course.duration_weeks ? String(course.duration_weeks) : "");
    setFeeAmount(course.fee_amount ? String(course.fee_amount) : "");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name,
      duration_weeks: durationWeeks ? Number(durationWeeks) : null,
      fee_amount: feeAmount ? Number(feeAmount) : 0,
    };

    const { error } = editingId
      ? await supabase.from("courses").update(payload).eq("id", editingId)
      : await supabase
          .from("courses")
          .insert({ ...payload, institute_id: institute.id });

    if (error) {
      setError(error.message);
    } else {
      resetForm();
      await refetch();
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setDeleteTarget(null);
      await refetch();
    }
  }

  return (
    <PageShell
      title="Courses"
      subtitle={`${courses.length} course${courses.length === 1 ? "" : "s"} offered`}
      actions={
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant="brass"
        >
          {showForm ? "Cancel" : "Add course"}
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit course" : "New course"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-3 sm:col-span-1">
                <Label htmlFor="courseName">Course name</Label>
                <Input
                  id="courseName"
                  placeholder="Web Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={durationWeeks}
                  onChange={(e) =>
                    setDurationWeeks(sanitizeAmountInput(e.target.value))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="feeAmount">Fee amount (PKR)</Label>
                <Input
                  id="feeAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={feeAmount}
                  onChange={(e) =>
                    setFeeAmount(sanitizeAmountInput(e.target.value))
                  }
                />
              </div>
              <div className="col-span-3 flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Save course"}
                </Button>
                {error && (
                  <p className="font-body text-sm text-stamp-red">{error}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="font-body text-sm text-ink/50">Loading courses…</p>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Add your first course to start enrolling students."
          action={
            <Button onClick={() => setShowForm(true)} variant="brass">
              Add course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="relative group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(course)}
                      className="text-ink/40 hover:text-brass transition-colors"
                      aria-label={`Edit ${course.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(course)}
                      className="text-ink/40 hover:text-stamp-red transition-colors"
                      aria-label={`Delete ${course.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-body text-sm text-ink/60">
                  {course.duration_weeks
                    ? `${course.duration_weeks} weeks`
                    : "Duration not set"}
                </p>
                <p className="font-mono text-lg text-ink">
                  {formatPKR(course.fee_amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.name}. Students enrolled in
              this course will keep their record but lose their course
              assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
