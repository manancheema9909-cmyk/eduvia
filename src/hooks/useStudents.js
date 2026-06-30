import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*, courses(name)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setStudents(
        (data ?? []).map((s) => ({
          ...s,
          course_name: s.courses?.name ?? "Unassigned",
        }))
      );
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { students, loading, error, refetch };
}
