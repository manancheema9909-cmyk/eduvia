import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("name");

    if (error) {
      setError(error.message);
    } else {
      setCourses(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { courses, loading, error, refetch };
}
