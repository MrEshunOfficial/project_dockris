import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import TodoForm from "../Todo/TodoForm";
import { useDispatch } from "react-redux";
import { addTodo } from "@/store/schedule/todoSlice";
import { createAppointment } from "@/store/schedule/appointmentSlice";
import { addRoutine } from "@/store/schedule/routineSlice";
import AppointmentForm from "../Appointments/AppointmentForm";
import EventForm from "../SpecialEvent/EventForm";
import RoutineForm from "../Routines/RoutineForm";
import { addEvent } from "@/store/schedule/eventSlice";

const formTypes = [
  { id: "todo", label: "Todo", component: TodoForm, icon: "✓" },
  {
    id: "appointment",
    label: "Appointment",
    component: AppointmentForm,
    icon: "🕒",
  },
  { id: "event", label: "Special Event", component: EventForm, icon: "🎉" },
  { id: "routine", label: "Routine", component: RoutineForm, icon: "🔁" },
] as const;

type FormType = (typeof formTypes)[number]["id"];

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<FormType>("todo");
  const dispatch = useDispatch();

  const handleFormSubmit = async (formType: FormType, data: any) => {
    try {
      switch (formType) {
        case "todo":
          dispatch(addTodo(data));
          break;
        case "appointment":
          dispatch(createAppointment(data));
          break;
        case "event":
          dispatch(addEvent(data));
          break;
        case "routine":
          dispatch(addRoutine(data));
          break;
        default:
          console.error("Unknown form type:", formType);
          return;
      }
      console.log(`${formType} added successfully!`);
      onClose();
    } catch (error) {
      console.error(`Failed to add ${formType}:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg rounded-lg bg-white p-2 dark:bg-gray-950">
        <DialogHeader className="bg-blue-100 p-4 dark:bg-slate-800 rounded-lg">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <Calendar className="mr-2 h-5 w-5" />
            <span>Schedule New Item</span>
          </DialogTitle>
          <p className="mt-2 dark:text-blue-200">
            Ready to create a new
            <span className="font-medium capitalize text-blue-700 ml-1 mr-1">
              {activeTab}
            </span>
            ? Add it to your calendar now!
          </p>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value: FormType) => setActiveTab(value)}
          className="w-full"
        >
          <TabsList className="flex w-full items-center justify-between bg-blue-50/60 rounded-lg shadow-sm dark:bg-gray-800/60 mb-4">
            {formTypes.map((type) => (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className="flex items-center justify-center rounded-lg py-2 px-4 transition-transform duration-200 ease-in-out transform hover:scale-105 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:text-gray-300 dark:data-[state=active]:bg-gray-700"
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-0">
            <AnimatePresence mode="wait">
              {formTypes.map((type) => (
                <TabsContent key={type.id} value={type.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800 dark:text-gray-200"
                  >
                    <type.component
                      onSubmit={(data: any) => handleFormSubmit(type.id, data)}
                    />
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
