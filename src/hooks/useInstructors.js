import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("instructors")
      .select("*")
      .order("full_name");

    if (error) {
      setError(error.message);
    } else {
      setInstructors(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { instructors, loading, error, refetch };
}
