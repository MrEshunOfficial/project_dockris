"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RoutineAside from "./RoutineAside";
import RoutineHeader from "./RoutineHeader";
import RoutineCard from "./RoutineCard";
import { RootState } from "@/store";

// New GridView component
const GridView: React.FC<{ routines: any[] }> = ({ routines }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {routines.map((routine) => (
      <RoutineCard key={routine._id} routine={routine} />
    ))}
  </div>
);

// New ListView component (using the existing map function)
const ListView: React.FC<{ routines: any[] }> = ({ routines }) => (
  <div className="space-y-4">
    {routines.map((routine) => (
      <RoutineCard key={routine._id} routine={routine} />
    ))}
  </div>
);

export default function RoutinePage() {
  const routines = useSelector((state: RootState) => state.routines.routines);
  const status = useSelector((state: RootState) => state.routines.status);
  const viewMode = useSelector((state: RootState) => state.routines.viewMode);

  return (
    <section className="w-full h-full flex items-center justify-center">
      <aside className="w-72 h-full rounded-lg">
        <RoutineAside />
      </aside>

      <div className="h-full flex-grow flex flex-col gap-1">
        <header className="h-auto w-full border border-b border-gray-200 p-4 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <RoutineHeader />
        </header>
        <section className="flex-1 w-full p-2 border ml-1 overflow-y-auto">
          {status === "succeeded" && routines.length === 0 && (
            <p>No routines found. Create one to get started!</p>
          )}
          {status === "succeeded" &&
            routines.length > 0 &&
            (viewMode === "list" ? (
              <GridView routines={routines} />
            ) : (
              <ListView routines={routines} />
            ))}
        </section>
      </div>
    </section>
  );
}
