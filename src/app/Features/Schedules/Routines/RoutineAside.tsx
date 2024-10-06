import React from "react";
import { useSelector } from "react-redux";
import { Icon as LucideIcon, Sun, Sunset, Moon, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RootState } from "@/store"; // Assuming you have a root state type
import {
  selectTotalRoutines,
  selectCompletedRoutinesByDay,
  selectUpcomingRoutines,
  selectMorningRoutines,
  selectAfternoonRoutines,
  selectEveningRoutines,
} from "@/store/schedule/routineSlice";
import { RoutineDocument } from "@/store/types/routine";

type IconType = typeof LucideIcon;
type ColorType = "yellow" | "orange" | "indigo" | "green";

interface RoutineGroupProps {
  title: string;
  icon: IconType;
  color: ColorType;
  routines: Array<{ name: string; startTime: string }>;
}

const getColorClass = (color: ColorType, variant: string): string => {
  return `${color}-${variant}` as const;
};

const RoutineGroup: React.FC<RoutineGroupProps> = ({
  title,
  icon: Icon,
  color,
  routines,
}) => (
  <Card
    className={`bg-${getColorClass(color, "50")} dark:bg-${getColorClass(
      color,
      "900"
    )} border-${getColorClass(color, "200")} dark:border-${getColorClass(
      color,
      "700"
    )} shadow-md`}
  >
    <CardHeader
      className={`flex flex-row items-center space-x-2 bg-${getColorClass(
        color,
        "100"
      )} dark:bg-${getColorClass(color, "800")} rounded-t-lg`}
    >
      <Icon
        className={`text-${getColorClass(
          color,
          "600"
        )} dark:text-${getColorClass(color, "400")}`}
        size={18}
        iconNode={[]}
      />
      <CardTitle
        className={`text-lg font-semibold text-${getColorClass(
          color,
          "800"
        )} dark:text-${getColorClass(color, "100")}`}
      >
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-3">
        {routines.map((routine, index) => (
          <div key={index} className="flex items-center justify-between">
            <span
              className={`text-sm font-medium text-${getColorClass(
                color,
                "700"
              )} dark:text-${getColorClass(color, "300")}`}
            >
              {routine.name}
            </span>
            <span
              className={`text-xs text-${getColorClass(
                color,
                "500"
              )} dark:text-${getColorClass(color, "400")} bg-${getColorClass(
                color,
                "100"
              )} dark:bg-${getColorClass(color, "700")} px-2 py-1 rounded-full`}
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
  const totalRoutines = useSelector(selectTotalRoutines);
  const completedRoutinesByDay = useSelector((state: RootState) =>
    selectCompletedRoutinesByDay(state, currentDate)
  );
  const upcomingRoutines = useSelector((state: RootState) =>
    selectUpcomingRoutines(state, currentDate)
  );
  const morningRoutines = useSelector(selectMorningRoutines);
  const afternoonRoutines = useSelector(selectAfternoonRoutines);
  const eveningRoutines = useSelector(selectEveningRoutines);

  const completedToday = completedRoutinesByDay.length;
  const completionPercentage =
    totalRoutines > 0 ? (completedToday / totalRoutines) * 100 : 0;

  // Get unique categories from all routines
  const allRoutines = useSelector(
    (state: RootState) => state.routines.routines
  );
  const categories = Array.from(
    new Set(
      allRoutines
        .map((routine) => routine.category)
        .filter((category): category is string => category !== undefined)
    )
  );

  const formatRoutines = (routines: RoutineDocument[]) =>
    routines.map((r) => ({
      name: r.name,
      startTime: new Date(r.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  return (
    <aside className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 w-ful max-h-[88vh] overflow-auto flex flex-col shadow-xl border border-blue-200 dark:border-gray-600 p-1">
      <Card className="mb-4 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-90 backdrop-filter backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900 dark:text-white">
            Routine Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
              Total Routines:
            </span>
            <span className="text-sm font-semibold text-blue-900 dark:text-white">
              {totalRoutines}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
                Completed Today:
              </span>
              <span className="text-sm font-semibold text-blue-900 dark:text-white">
                {completedToday}
              </span>
            </div>
            <Progress
              value={completionPercentage}
              className="h-2 bg-blue-200 dark:bg-gray-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
              Upcoming Routines:
            </span>
            <span className="text-sm font-semibold text-blue-900 dark:text-white">
              {upcomingRoutines.length}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
              Categories:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
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
          title="Upcoming Routines"
          icon={Calendar}
          color="green"
          routines={formatRoutines(upcomingRoutines)}
        />
      </div>
    </aside>
  );
};

export default RoutineAside;
