import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { FeeSeal } from "@/components/FeeSeal";
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
import { useFees } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { sanitizeAmountInput } from "@/lib/inputUtils";
import { formatDate } from "@/lib/dateUtils";

function formatPKR(amount) {
  return `Rs ${Number(amount ?? 0).toLocaleString("en-PK")}`;
}

export function Fees() {
  const { institute } = useAuth();
  const { fees, loading, refetch } = useFees();
  const { students } = useStudents();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function resetForm() {
    setStudentId("");
    setAmount("");
    setPaidAmount("");
    setDueDate("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(fee) {
    setEditingId(fee.id);
    setStudentId(fee.student_id);
    setAmount(String(fee.amount));
    setPaidAmount(String(fee.paid_amount));
    setDueDate(fee.due_date);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      student_id: studentId,
      amount: Number(amount),
      paid_amount: Number(paidAmount || 0),
      due_date: dueDate,
    };

    const { error } = editingId
      ? await supabase.from("fees").update(payload).eq("id", editingId)
      : await supabase
          .from("fees")
          .insert({ ...payload, institute_id: institute.id });

    if (error) {
      setError(error.message);
    } else {
      resetForm();
      await refetch();
    }
    setSubmitting(false);
  }

  async function handleRecordPayment(fee) {
    const newPaidAmount =
      Number(fee.paid_amount) + Number(paymentAmount || 0);

    const { error } = await supabase
      .from("fees")
      .update({ paid_amount: newPaidAmount })
      .eq("id", fee.id);

    if (!error) {
      setPayingId(null);
      setPaymentAmount("");
      await refetch();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("fees")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setDeleteTarget(null);
      await refetch();
    }
  }

  return (
    <PageShell
      title="Fees"
      subtitle={`${fees.length} fee record${fees.length === 1 ? "" : "s"}`}
      actions={
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant="brass"
        >
          {showForm ? "Cancel" : "Add fee record"}
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit fee record" : "New fee record"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="feeStudent">Student</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger id="feeStudent">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Total amount (PKR)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(sanitizeAmountInput(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paidAmount">
                  {editingId ? "Paid so far (PKR)" : "Already paid (PKR)"}
                </Label>
                <Input
                  id="paidAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(sanitizeAmountInput(e.target.value))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Save fee record"}
                </Button>
                {!editingId && (
                  <p className="font-body text-xs text-ink/40">
                    Leave "Already paid" at 0 if the student hasn't paid
                    anything yet.
                  </p>
                )}
                {error && (
                  <p className="font-body text-sm text-stamp-red">{error}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="font-body text-sm text-ink/50">Loading fee records…</p>
      ) : fees.length === 0 ? (
        <EmptyState
          title="No fee records yet"
          description="Add a fee record for a student to start tracking payments."
          action={
            <Button onClick={() => setShowForm(true)} variant="brass">
              Add fee record
            </Button>
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
                <th className="font-body text-xs uppercase tracking-wider text-ink/50 px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, idx) => (
                <tr
                  key={fee.id}
                  className={`border-b border-border-paper last:border-b-0 ${
                    idx % 2 === 1 ? "bg-paper-dim/40" : ""
                  }`}
                >
                  <td className="font-body text-sm text-ink px-5 py-3.5">
                    {fee.student_name}
                  </td>
                  <td className="font-body text-sm text-ink/70 px-5 py-3.5">
                    {fee.course_name}
                  </td>
                  <td className="font-mono text-sm text-ink text-right px-5 py-3.5">
                    {formatPKR(fee.amount)}
                  </td>
                  <td className="font-mono text-sm text-ink/70 text-right px-5 py-3.5">
                    {formatPKR(fee.paid_amount)}
                  </td>
                  <td className="font-mono text-sm text-ink/60 px-5 py-3.5">
                    {formatDate(fee.due_date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <FeeSeal status={fee.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {fee.status !== "paid" &&
                        (payingId === fee.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              className="h-8 w-20"
                              value={paymentAmount}
                              onChange={(e) =>
                                setPaymentAmount(
                                  sanitizeAmountInput(e.target.value)
                                )
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() => handleRecordPayment(fee)}
                            >
                              Record
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPayingId(fee.id)}
                            className="font-body text-sm text-brass hover:text-brass-light"
                          >
                            Record payment
                          </button>
                        ))}
                      <button
                        onClick={() => startEdit(fee)}
                        className="text-ink/40 hover:text-brass transition-colors"
                        aria-label={`Edit fee for ${fee.student_name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(fee)}
                        className="text-ink/40 hover:text-stamp-red transition-colors"
                        aria-label={`Delete fee for ${fee.student_name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            <AlertDialogTitle>Delete fee record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this fee record for{" "}
              {deleteTarget?.student_name}. This can't be undone.
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
