"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ShoppingCart,
  DollarSign,
  Users,
  Group,
  ShoppingBag,
  LucideShoppingBag,
  ServerIcon,
  CogIcon,
  FanIcon,
  CalendarCheck,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NextResponse } from "next/server";
import { FaMoneyBill, FaQuestionCircle, FaShippingFast } from "react-icons/fa";
import { GiBank } from "react-icons/gi";
import { FcDebt, FcMoneyTransfer, FcPrivacy } from "react-icons/fc";
import { RiRefund2Line } from "react-icons/ri";
import { GrTask } from "react-icons/gr";
import { logout } from "@/store/User/authSlice";

import { fetchCurrentUser } from "@/store/User/authSlice";
import { RootState, AppDispatch } from "@/store";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const DashboardNavigation = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleNavWidth = () => setIsExpanded(!isExpanded);
  const toggleSubMenu = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  const navWidth = isExpanded ? "18rem" : "5rem";

  const pageLinks = [
    {
      name: "Schedules",
      icon: <Home size={20} />,
      subMenu: [
        {
          name: "Calendar",
          path: "Schedules/Calendar",
          icon: <CalendarIcon size={20} />,
        },
        {
          name: "To-do List",
          path: "Schedules/Todo",
          icon: <GrTask size={16} />,
        },
        {
          name: "Special Event",
          path: "Schedules/SpecialEvent",
          icon: <FanIcon size={16} />,
        },
        {
          name: "My Appointments",
          path: "Schedules/Appointments",
          icon: <CalendarCheck size={16} />,
        },
        {
          name: "Daily Routines",
          path: "Schedules/Routines",
          icon: <CogIcon size={16} />,
        },
      ],
    },
    {
      name: "Financial Management",
      icon: <DollarSign size={20} />,
      subMenu: [
        {
          name: "Budgeting",
          path: "Financial/Budgets",
          icon: <GiBank size={16} />,
        },
        {
          name: "Expenses Tracking",
          path: "Financial/Expenses",
          icon: <FaMoneyBill size={16} />,
        },
        {
          name: "Income Tracking",
          path: "Financial/Income",
          icon: <FcMoneyTransfer size={16} />,
        },
        {
          name: "Debt Management",
          path: "Financial/Debts",
          icon: <FcDebt size={16} />,
        },
      ],
    },
    {
      name: "Social Circles",
      icon: <Users size={20} />,
      subMenu: [
        {
          name: "Start a Conversation",
          path: "conversations",
          icon: <Group size={16} />,
        },
      ],
    },
    {
      name: "Shopping",
      icon: <ShoppingCart size={20} />,
      subMenu: [
        {
          name: "My Shopping List",
          path: "Shopping/ShoppingList",
          icon: <LucideShoppingBag size={16} />,
        },
        {
          name: "My Wishlist",
          path: "Shopping/WishList",
          icon: <ShoppingBag size={16} />,
        },
      ],
    },
    {
      name: "Settings",
      path: "settings",
      icon: <Settings size={20} />,
      subMenu: [],
    },
    {
      name: "Help",
      icon: <HelpCircle size={20} />,
      subMenu: [
        {
          name: "FAQ",
          path: "help/faq",
          icon: <FaQuestionCircle size={16} />,
        },
        {
          name: "Terms of Service",
          path: "help/terms",
          icon: <ServerIcon size={16} />,
        },
        {
          name: "Privacy Policy",
          path: "help/privacy",
          icon: <FcPrivacy size={16} />,
        },
        {
          name: "Refund Policy",
          path: "help/refund",
          icon: <RiRefund2Line size={16} />,
        },
        {
          name: "Shipping Policy",
          path: "help/shipping",
          icon: <FaShippingFast size={16} />,
        },
      ],
    },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  const onLogout = async () => {
    try {
      dispatch(logout());
      router.push("/authclient/Login");
      toast({
        title: "Logged out Successfully",
        description: "You have been logged out successfully.",
        duration: 10000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { message: "Internal server error", success: false },
        { status: 500 }
      );
    }
  };

  return (
    <nav
      className={`p-3 h-full flex flex-col justify-between items-start gap-3 bg-white border dark:bg-black dark:border-gray-600 relative transition-all duration-300 ease-in-out rounded-xl`}
      style={{ width: navWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-1/6 border-b w-full p-3 flex items-center dark:border-gray-600 gap-3 justify-center">
        {isExpanded ? (
          <span className="w-full text-center font-semibold">
            Welcome, {currentUser?.name}
          </span>
        ) : (
          <Star size={24} />
        )}
      </div>
      <ul className="flex-1 w-full p-3 flex flex-col gap-2 overflow-y-auto">
        {pageLinks.map((link) => (
          <li key={link.name} className="w-full">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                isExpanded ? "px-3" : "px-0"
              }`}
              onClick={() =>
                link.subMenu.length > 0 && toggleSubMenu(link.name)
              }
            >
              {link.icon}
              {isExpanded && (
                <>
                  <span>{link.name}</span>
                  {link.subMenu.length > 0 && (
                    <ChevronDown
                      size={16}
                      className={`ml-auto transition-transform duration-200 ${
                        activeSubmenu === link.name
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  )}
                </>
              )}
            </Button>
            {link.subMenu.length > 0 && (
              <ul
                className={`ml-6 mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded && activeSubmenu === link.name
                    ? "max-h-96"
                    : "max-h-0"
                }`}
              >
                {link.subMenu.map((subLink) => (
                  <li key={subLink.name}>
                    <Link
                      href={`/Features/${subLink.path}`}
                      className={`flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md ${
                        pathname === subLink.path
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      {isExpanded ? (
                        <>
                          {subLink.icon}
                          <span>{subLink.name}</span>
                        </>
                      ) : (
                        subLink.icon
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="h-auto border-t w-full p-3 flex flex-col dark:border-gray-600 items-center">
        {isExpanded ? (
          <div className="w-full text-center">
            <div className="w-full flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@username"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-3 items-start">
                <p className="text-sm font-medium leading-none">
                  {currentUser?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground max-w-[10rem] truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <div className="w-full mt-4 flex justify-between text-xs text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Terms
              </Link>
              <Link href="/support" className="hover:text-gray-900">
                Support
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="hover:text-gray-900 p-0 -mt-3"
              >
                <LogOut size={14} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut size={20} />
          </Button>
        )}
      </div>
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

export default DashboardNavigation;
