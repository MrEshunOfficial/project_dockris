"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  User,
  CogIcon,
  FanIcon,
  CalendarCheck,
} from "lucide-react";
import { GrTask } from "react-icons/gr";

import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const Sidebar = () => {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { profile } = useSelector((state: RootState) => state.userProfile);

  const pathname = usePathname();

  const toggleNavWidth = () => setIsExpanded(!isExpanded);

  const navWidth = isExpanded ? "18rem" : "5rem";

  // Flattened navigation links
  const pageLinks = [
    {
      name: "To-do List",
      path: "/Features/Schedules/Todo",
      icon: <GrTask size={20} color="green" />,
    },
    {
      name: "Daily Routines",
      path: "/Features/Schedules/Routines",
      icon: <CogIcon size={20} color="red" />,
    },
    {
      name: "My Appointments",
      path: "/Features/Schedules/Appointments",
      icon: <CalendarCheck size={20} color="orange" />,
    },
    {
      name: "Special Event",
      path: "/Features/Schedules/SpecialEvent",
      icon: <FanIcon size={20} color="purple" />,
    },
    {
      name: "Settings",
      path: "/Features/settings",
      icon: <Settings size={20} color="grey" />,
    },
  ];

  return (
    <nav
      className={`p-3 h-full flex flex-col justify-between items-start gap-3 bg-white border dark:bg-black dark:border-gray-600 relative transition-all duration-300 ease-in-out rounded-xl`}
      style={{ width: navWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="h-1/6 border-b w-full p-3 flex items-center dark:border-gray-600 gap-3 justify-center">
        {isExpanded ? (
          <div className="w-full flex flex-col items-center gap-2 text-center font-semibold">
            <p>Welcome, </p>
            <p className="flex items-center justify-center gap-2 capitalize">
              <span>
                {profile?.fullName.firstName || session?.user?.name || "Guest"}
              </span>
              <span>
                {profile?.fullName.lastName || session?.user?.name || "Guest"}
              </span>
            </p>
          </div>
        ) : (
          <User size={24} />
        )}
      </div>

      {/* Calendar Button */}
      <Button
        variant="link"
        className="w-full rounded-md shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-[3rem] text-white font-bold hover:bg-gradient-to-br transition duration-300"
      >
        <Link href="/Features" className="w-full flex items-center">
          {isExpanded ? (
            <span className="w-full flex items-center justify-start gap-2">
              <CalendarIcon size={18} /> <span>Calendar</span>
            </span>
          ) : (
            <span className="w-full flex items-center justify-center">
              <CalendarIcon size={18} />
            </span>
          )}
        </Link>
      </Button>

      {/* Navigation Links */}
      <ul className="flex-1 w-full p-3 flex flex-col gap-2 overflow-y-auto">
        {pageLinks.map((link) => (
          <li key={link.name} className="w-full">
            <Link href={link.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  pathname === link.path ? "bg-gray-100 dark:bg-gray-800" : ""
                } ${isExpanded ? "px-3" : "px-0"}`}
              >
                {link.icon}
                {isExpanded && <span>{link.name}</span>}
              </Button>
            </Link>
          </li>
        ))}
      </ul>

      {/* User Profile Section */}
      <div className="h-auto border-t w-full p-3 flex flex-col dark:border-gray-600 items-center">
        {isExpanded && (
          <div className="w-full text-center">
            <div className="w-full flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    profile?.profilePicture || session?.user?.image || undefined
                  }
                />
                <AvatarFallback>
                  <User className="h-9 w-9" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-3 items-start">
                <p className="text-sm font-medium leading-none">
                  {profile?.username || session?.user?.name || "Guest"}
                </p>
                <p className="text-xs leading-none text-muted-foreground max-w-[10rem] truncate">
                  {profile?.email ||
                    session?.user?.email ||
                    "guest@example.com"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={toggleNavWidth}
        className={`absolute top-10 -right-6 border dark:border-gray-600 p-2 rounded-full transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </Button>
      <Toaster />
    </nav>
  );
};

export default Sidebar;
