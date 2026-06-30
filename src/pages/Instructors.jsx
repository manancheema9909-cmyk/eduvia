import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
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
import { useInstructors } from "@/hooks/useInstructors";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { sanitizeNameInput } from "@/lib/inputUtils";

const SHIFT_LABEL = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function ShiftBadge({ shift, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-paper bg-paper-dim px-2 py-0.5 font-body text-xs text-ink/70">
      {SHIFT_LABEL[shift] ?? shift}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-ink/30 hover:text-stamp-red transition-colors"
          aria-label="Remove assignment"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export function Instructors() {
  const { institute } = useAuth();
  const { instructors, loading, refetch } = useInstructors();
  const { courses } = useCourses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [shift, setShift] = useState("morning");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function courseName(courseId) {
    return courses.find((c) => c.id === courseId)?.name ?? "Unknown course";
  }

  function resetForm() {
    setFullName("");
    setCourseId("");
    setShift("morning");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(instructor) {
    setEditingId(instructor.id);
    setFullName(instructor.full_name);
    setCourseId("");
    setShift("morning");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (editingId) {
      // Editing only updates the name; assignments are managed inline
      // on each instructor's card via addAssignment/removeAssignment.
      const { error } = await supabase
        .from("instructors")
        .update({ full_name: fullName })
        .eq("id", editingId);

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        await refetch();
      }
    } else {
      const assignments = courseId ? [{ course_id: courseId, shift }] : [];
      const { error } = await supabase.from("instructors").insert({
        institute_id: institute.id,
        full_name: fullName,
        assignments,
      });

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        await refetch();
      }
    }
    setSubmitting(false);
  }

  async function addAssignment(instructor, newCourseId, newShift) {
    if (!newCourseId) return;
    const updated = [
      ...instructor.assignments,
      { course_id: newCourseId, shift: newShift },
    ];
    const { error } = await supabase
      .from("instructors")
      .update({ assignments: updated })
      .eq("id", instructor.id);
    if (!error) await refetch();
  }

  async function removeAssignment(instructor, index) {
    const updated = instructor.assignments.filter((_, i) => i !== index);
    const { error } = await supabase
      .from("instructors")
      .update({ assignments: updated })
      .eq("id", instructor.id);
    if (!error) await refetch();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("instructors")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setDeleteTarget(null);
      await refetch();
    }
  }

  return (
    <PageShell
      title="Instructors"
      subtitle={`${instructors.length} instructor${
        instructors.length === 1 ? "" : "s"
      } on staff`}
      actions={
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant="brass"
        >
          {showForm ? "Cancel" : "Add instructor"}
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit instructor" : "New instructor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-3 sm:col-span-1">
                <Label htmlFor="instructorName">Full name</Label>
                <Input
                  id="instructorName"
                  placeholder="Instructor's full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(sanitizeNameInput(e.target.value))
                  }
                  required
                />
              </div>
              {!editingId && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="assignCourse">Assign to course</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger id="assignCourse">
                        <SelectValue placeholder="Optional" />
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
                  <div className="space-y-1.5">
                    <Label htmlFor="shift">Shift</Label>
                    <Select value={shift} onValueChange={setShift}>
                      <SelectTrigger id="shift">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="col-span-3 flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Save instructor"}
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
        <p className="font-body text-sm text-ink/50">Loading instructors…</p>
      ) : instructors.length === 0 ? (
        <EmptyState
          title="No instructors yet"
          description="Add instructors and assign them to courses and shifts."
          action={
            <Button onClick={() => setShowForm(true)} variant="brass">
              Add instructor
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {instructors.map((instructor) => (
            <Card key={instructor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {instructor.full_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(instructor)}
                      className="text-ink/40 hover:text-brass transition-colors"
                      aria-label={`Edit ${instructor.full_name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(instructor)}
                      className="text-ink/40 hover:text-stamp-red transition-colors"
                      aria-label={`Delete ${instructor.full_name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {instructor.assignments?.length === 0 ? (
                  <p className="font-body text-sm text-ink/40 mb-3">
                    No course assignments yet
                  </p>
                ) : (
                  <ul className="space-y-2 mb-3">
                    {instructor.assignments.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="font-body text-sm text-ink/80">
                          {courseName(a.course_id)}
                        </span>
                        <ShiftBadge
                          shift={a.shift}
                          onRemove={() => removeAssignment(instructor, i)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <AddAssignmentRow
                  courses={courses}
                  onAdd={(courseId, shift) =>
                    addAssignment(instructor, courseId, shift)
                  }
                />
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
            <AlertDialogTitle>Delete instructor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.full_name} and
              their shift assignments. This can't be undone.
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

function AddAssignmentRow({ courses, onAdd }) {
  const [courseId, setCourseId] = useState("");
  const [shift, setShift] = useState("morning");

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border-paper">
      <Select value={courseId} onValueChange={setCourseId}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Add course…" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={shift} onValueChange={setShift}>
        <SelectTrigger className="h-8 text-xs w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="morning">Morning</SelectItem>
          <SelectItem value="afternoon">Afternoon</SelectItem>
          <SelectItem value="evening">Evening</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (!courseId) return;
          onAdd(courseId, shift);
          setCourseId("");
        }}
      >
        Add
      </Button>
    </div>
  );
}
