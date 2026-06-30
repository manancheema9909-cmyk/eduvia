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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { sanitizeNameInput } from "@/lib/inputUtils";
import { formatDate } from "@/lib/dateUtils";

const STATUS_LABEL = {
  active: { label: "Active", className: "text-ledger-green" },
  completed: { label: "Completed", className: "text-ink/50" },
  withdrawn: { label: "Withdrawn", className: "text-stamp-red" },
};

const STATUS_OPTIONS = ["active", "completed", "withdrawn"];

export function Students() {
  const { institute } = useAuth();
  const { students, loading, refetch } = useStudents();
  const { courses } = useCourses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function resetForm() {
    setFullName("");
    setCourseId("");
    setStatus("active");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(student) {
    setEditingId(student.id);
    setFullName(student.full_name);
    setCourseId(student.course_id ?? "");
    setStatus(student.status);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      full_name: fullName,
      course_id: courseId || null,
      status,
    };

    const { error } = editingId
      ? await supabase.from("students").update(payload).eq("id", editingId)
      : await supabase
          .from("students")
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
      .from("students")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setDeleteTarget(null);
      await refetch();
    }
  }

  return (
    <PageShell
      title="Students"
      subtitle={`${students.length} student${students.length === 1 ? "" : "s"} enrolled`}
      actions={
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant="brass"
        >
          {showForm ? "Cancel" : "Add student"}
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit student" : "New student"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentName">Full name</Label>
                <Input
                  id="studentName"
                  placeholder="Student's full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(sanitizeNameInput(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course">Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingId && (
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-3 flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Save student"}
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
        <p className="font-body text-sm text-ink/50">Loading students…</p>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Add your first student to start tracking enrollment and fees."
          action={
            <Button onClick={() => setShowForm(true)} variant="brass">
              Add student
            </Button>
          }
        />
      ) : (
        <div className="border border-border-paper rounded-[var(--radius-card)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-paper-dim border-b border-border-paper">
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                  Name
                </th>
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                  Course
                </th>
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                  Enrolled
                </th>
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3">
                  Status
                </th>
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const statusInfo =
                  STATUS_LABEL[student.status] ?? STATUS_LABEL.active;
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-border-paper last:border-b-0 ${
                      idx % 2 === 1 ? "bg-paper-dim/40" : ""
                    }`}
                  >
                    <td className="font-body text-sm text-ink px-5 py-3.5">
                      {student.full_name}
                    </td>
                    <td className="font-body text-sm text-ink/70 px-5 py-3.5">
                      {student.course_name}
                    </td>
                    <td className="font-mono text-sm text-ink/60 px-5 py-3.5">
                      {formatDate(student.enrolled_at)}
                    </td>
                    <td
                      className={`font-body text-sm px-5 py-3.5 ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => startEdit(student)}
                          className="text-ink/40 hover:text-brass transition-colors"
                          aria-label={`Edit ${student.full_name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="text-ink/40 hover:text-stamp-red transition-colors"
                          aria-label={`Delete ${student.full_name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.full_name} and any
              fee records linked to them. This can't be undone.
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
