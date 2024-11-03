"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchUserProfile } from "@/store/userProfileSlice";
import { useSession } from "next-auth/react";
import { fetchTodos } from "@/store/scheduleSlice/todoSlice";
import { fetchReminders } from "@/store/reminderSlice";
import { toast } from "./ui/use-toast";
import { ErrorState, LoadingPageSkeleton } from "./ui/LoadingContent";
import { fetchRoutines } from "@/store/scheduleSlice/routineSlice";
import { fetchAppointments } from "@/store/scheduleSlice/appointmentSlice";
import { fetchEvents } from "@/store/scheduleSlice/eventSlice";

interface UnifiedFetchProps {
  children: React.ReactNode;
}

const UnifiedFetch: React.FC<UnifiedFetchProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          dispatch(fetchUserProfile()),
          dispatch(fetchTodos()),
          dispatch(fetchReminders()),
          dispatch(fetchRoutines()),
          dispatch(fetchAppointments({})),
          dispatch(fetchEvents({})),
        ]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
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

    if (userId) {
      fetchData();
    }
  }, [dispatch, userId]);

  if (loading) {
    return <LoadingPageSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return <>{children}</>;
};

export default UnifiedFetch;
