import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fees")
      .select("*, students(full_name, courses(name))")
      .order("due_date", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setFees(
        (data ?? []).map((f) => ({
          ...f,
          student_name: f.students?.full_name ?? "Unknown",
          course_name: f.students?.courses?.name ?? "Unassigned",
        }))
      );
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { fees, loading, error, refetch };
}
