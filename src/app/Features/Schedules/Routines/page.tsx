"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import RoutineCard from "./RoutineCard";
import { RoutineHeader } from "./RoutineHeader";

export const RoutinePage: React.FC = () => {
  const allRoutines = useSelector(
    (state: RootState) => state.routines.filteredRoutines
  );
  const viewMode = useSelector((state: RootState) => state.routines.viewMode);

  const GridView: React.FC<{ routineIds: string[] }> = ({ routineIds }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {routineIds.map((routineId) => (
        <RoutineCard key={routineId} routineId={routineId} />
      ))}
    </div>
  );

  const ListView: React.FC<{ routineIds: string[] }> = ({ routineIds }) => (
    <div className="space-y-4">
      {routineIds.map((routineId) => (
        <RoutineCard key={routineId} routineId={routineId} />
      ))}
    </div>
  );

  return (
    <section className="w-full h-full flex items-center justify-center">
      <div className="h-full flex-grow flex flex-col gap-1">
        <header className="h-auto w-full border border-b border-gray-200 p-4 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 rounded-md">
          <RoutineHeader />
        </header>

        <section className="flex-1 w-full p-2 border dark:border-gray-700 border-gray-300 overflow-y-auto rounded-md">
          {allRoutines.length === 0 && (
            <p>No routines found. Create one to get started!</p>
          )}
          {allRoutines.length > 0 &&
            (viewMode === "grid" ? (
              <ListView routineIds={allRoutines.map((r) => r._id)} />
            ) : (
              <GridView routineIds={allRoutines.map((r) => r._id)} />
            ))}
        </section>
      </div>
    </section>
  );
};

export default RoutinePage;
