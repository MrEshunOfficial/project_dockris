import React from "react";
import { useSelector } from "react-redux";
import { Sun, Sunset, Moon, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RootState } from "@/store";
import {
  selectMorningRoutines,
  selectAfternoonRoutines,
  selectEveningRoutines,
  selectActiveRoutines,
  selectCompletedRoutines,
  selectTodayCompletionStatus,
} from "@/store/scheduleSlice/routineSlice";
import { IRoutine, RoutineStatus } from "@/store/scheduleSlice/routineSlice";

type ColorType = "yellow" | "orange" | "indigo" | "green";

interface RoutineData {
  name: string;
  startTime: string;
  completed: boolean;
}

interface RoutineGroupProps {
  title: string;
  icon: React.FC<{ className?: string; size?: number }>;
  color: ColorType;
  routines: RoutineData[];
}

const getColorClass = (color: ColorType, variant: string): string => {
  const colorMap = {
    yellow: {
      50: "bg-yellow-50",
      100: "bg-yellow-100",
      200: "border-yellow-200",
      300: "text-yellow-300",
      400: "text-yellow-400",
      500: "text-yellow-500",
      600: "text-yellow-600",
      700: "text-yellow-700",
      800: "text-yellow-800",
      900: "bg-yellow-900",
    },
    orange: {
      50: "bg-orange-50",
      100: "bg-orange-100",
      200: "border-orange-200",
      300: "text-orange-300",
      400: "text-orange-400",
      500: "text-orange-500",
      600: "text-orange-600",
      700: "text-orange-700",
      800: "text-orange-800",
      900: "bg-orange-900",
    },
    indigo: {
      50: "bg-indigo-50",
      100: "bg-indigo-100",
      200: "border-indigo-200",
      300: "text-indigo-300",
      400: "text-indigo-400",
      500: "text-indigo-500",
      600: "text-indigo-600",
      700: "text-indigo-700",
      800: "text-indigo-800",
      900: "bg-indigo-900",
    },
    green: {
      50: "bg-green-50",
      100: "bg-green-100",
      200: "border-green-200",
      300: "text-green-300",
      400: "text-green-400",
      500: "text-green-500",
      600: "text-green-600",
      700: "text-green-700",
      800: "text-green-800",
      900: "bg-green-900",
    },
  };

  return colorMap[color][variant as keyof (typeof colorMap)[typeof color]];
};

const RoutineGroup: React.FC<RoutineGroupProps> = ({
  title,
  icon: Icon,
  color,
  routines,
}) => (
  <Card
    className={`${getColorClass(color, "50")} dark:${getColorClass(
      color,
      "900"
    )} border shadow-md`}
  >
    <CardHeader
      className={`flex flex-row items-center space-x-2 ${getColorClass(
        color,
        "100"
      )} dark:${getColorClass(color, "800")} rounded-t-lg`}
    >
      <Icon className={getColorClass(color, "600")} size={18} />
      <CardTitle
        className={`text-lg font-semibold ${getColorClass(
          color,
          "800"
        )} dark:${getColorClass(color, "100")}`}
      >
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-3">
        {routines.map((routine, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  routine.completed ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span
                className={`text-sm font-medium ${getColorClass(
                  color,
                  "700"
                )} dark:${getColorClass(color, "300")}`}
              >
                {routine.name}
              </span>
            </div>
            <span
              className={`text-xs ${getColorClass(
                color,
                "500"
              )} dark:${getColorClass(color, "400")} ${getColorClass(
                color,
                "100"
              )} dark:${getColorClass(color, "700")} px-2 py-1 rounded-full`}
            >
              {routine.startTime}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RoutineAside: React.FC = () => {
  const currentDate =
    useSelector((state: RootState) => state.routines.currentDate) || new Date();
  const activeRoutines = useSelector(selectActiveRoutines);
  const completedRoutines = useSelector(selectCompletedRoutines);
  const morningRoutines = useSelector(selectMorningRoutines);
  const afternoonRoutines = useSelector(selectAfternoonRoutines);
  const eveningRoutines = useSelector(selectEveningRoutines);
  const viewMode = useSelector((state: RootState) => state.routines.viewMode);

  // Get completion status for all routines at once
  const completionStatuses = useSelector((state: RootState) =>
    activeRoutines.reduce((acc, routine) => {
      acc[routine._id] = selectTodayCompletionStatus(state, routine._id);
      return acc;
    }, {} as Record<string, boolean>)
  );

  const totalRoutines = activeRoutines.length;
  const completedToday = completedRoutines.length;
  const completionPercentage =
    totalRoutines > 0 ? (completedToday / totalRoutines) * 100 : 0;

  // Format routines using the pre-fetched completion statuses
  const formatRoutines = (routines: IRoutine[]): RoutineData[] => {
    return routines.map((r) => ({
      name: r.title,
      startTime: new Date(r.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      completed: completionStatuses[r._id],
    }));
  };

  // Get all categories
  const categories = React.useMemo(
    () =>
      Array.from(
        new Set(
          activeRoutines.map((routine) => routine.category).filter(Boolean)
        )
      ),
    [activeRoutines]
  );

  // Get routines by category
  const routinesByCategory = React.useMemo(() => {
    return categories.reduce((acc, category) => {
      if (category) {
        const routines = activeRoutines.filter((r) => r.category === category);
        acc[category] = routines.length;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [categories, activeRoutines]);

  return (
    <Card className="w-full h-[87vh] flex flex-col gap-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900 dark:text-white flex items-center justify-between">
          Routine Overview
          <span className="text-sm font-normal bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">
            {viewMode === "list" ? "List View" : "Grid View"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-200">
              Total Active
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-white">
              {totalRoutines}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-200">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-white">
              {completedToday}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Daily Progress</span>
            <span>{completionPercentage.toFixed(1)}%</span>
          </div>
          <Progress
            value={completionPercentage}
            className="h-2 bg-blue-200 dark:bg-gray-600"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(routinesByCategory).map(([category, count]) => (
              <span
                key={category}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full flex items-center space-x-1"
              >
                <span>{category}</span>
                <span className="bg-gray-200 dark:bg-gray-600 px-1.5 rounded-full">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardContent className="space-y-4 flex-grow overflow-y-auto p-2">
        <RoutineGroup
          title="Morning Routines"
          icon={Sun}
          color="yellow"
          routines={formatRoutines(morningRoutines)}
        />
        <RoutineGroup
          title="Afternoon Routines"
          icon={Sunset}
          color="orange"
          routines={formatRoutines(afternoonRoutines)}
        />
        <RoutineGroup
          title="Evening Routines"
          icon={Moon}
          color="indigo"
          routines={formatRoutines(eveningRoutines)}
        />
        <RoutineGroup
          title="Active Routines"
          icon={Calendar}
          color="green"
          routines={formatRoutines(
            activeRoutines.filter((r) => r.status === RoutineStatus.ACTIVE)
          )}
        />
      </CardContent>
    </Card>
  );
};

export default RoutineAside;
