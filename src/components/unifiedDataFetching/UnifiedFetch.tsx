import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store"; // Import your AppDispatch type from your Redux store
import { fetchTodos } from "@/store/schedule/todoSlice";
import { fetchRoutines } from "@/store/schedule/routineSlice";
import { fetchAppointments } from "@/store/schedule/appointmentSlice";
import { fetchEvents } from "@/store/schedule/eventSlice";
import { toast } from "../ui/use-toast";
import { fetchIncomes } from "@/store/finances/incomeSlice";
import { ErrorState, LoadingPageSkeleton } from "../ui/LoadingContent";
import { fetchExpenses } from "@/store/finances/expenseSlice";

interface UnifiedFetchProps {
  children: React.ReactNode; // Explicitly typing children
}

const UnifiedFetch: React.FC<UnifiedFetchProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>(); // Typing dispatch with AppDispatch
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          dispatch(fetchRoutines({})),
          dispatch(fetchAppointments({})),
          dispatch(fetchEvents({})),
          dispatch(fetchTodos()),
          dispatch(fetchIncomes()),
          dispatch(fetchExpenses()),
        ]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error"; // Proper error typing
        toast({
          title: "System Error",
          description:
            "An error occurred while fetching data. Please try again later.",
          duration: 7000,
          variant: "destructive",
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return <LoadingPageSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return <>{children}</>;
};

export default UnifiedFetch;
