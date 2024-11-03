"use client";
import React from "react";
import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import NotificationUi from "./NotificationUi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Logout from "./Logout";

const MainHeader = () => {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();

  const { profile } = useSelector((state: RootState) => state.userProfile);

  const navItems: Array<{ name: string; path: string }> = [
    { name: "Home", path: "/" },
    { name: "About", path: "/info/about" },
    { name: "Contact", path: "/info/contact" },
    { name: "Location", path: "/info/location" },
    { name: "Support", path: "/info/support" },
  ];

  return (
    <>
      <div className="flex items-center space-x-8">
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          PlanZen
        </h2>

        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <Link href={item.path} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {item.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="border-none p-0 mt-4 mr-2 w-80">
            <NotificationUi />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full border-2 border-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            className="w-36 rounded-lg p-2 mt-4 shadow-md border-gray-300 dark:border-gray-700"
          >
            <Button
              onClick={() => setTheme("light")}
              className="flex w-full items-center justify-start gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              data-active={theme === "light"}
              variant="ghost"
            >
              <Sun className="h-5 w-5 shrink-0 text-yellow-500" />
              <span className="text-primary-700 dark:text-primary-300">
                Light
              </span>
            </Button>
            <Button
              onClick={() => setTheme("dark")}
              className="flex w-full items-center justify-start gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 my-1"
              data-active={theme === "dark"}
              variant="ghost"
            >
              <Moon className="h-5 w-5 shrink-0 text-blue-500" />
              <span className="text-primary-700 dark:text-primary-300">
                Dark
              </span>
            </Button>
            <Button
              onClick={() => setTheme("system")}
              className="flex w-full items-center justify-start gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              data-active={theme === "system"}
              variant="ghost"
            >
              <Laptop className="h-5 w-5 shrink-0 text-green-500" />
              <span className="text-primary-700 dark:text-primary-300">
                System
              </span>
            </Button>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User profile">
              <Avatar className="h-10 w-10 border border-primary-500 rounded-full shadow-md">
                <AvatarImage
                  src={
                    profile?.profilePicture || session?.user?.image || undefined
                  }
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-max border-gray-300 dark:border-gray-700 mt-5 mr-2 p-2">
            {session?.user ? (
              <div className="flex flex-col items-center justify-center gap-3 p-3">
                <Avatar className="h-10 w-10 border border-primary-500 rounded-full shadow-md">
                  <AvatarImage
                    src={
                      profile?.profilePicture ||
                      session?.user?.image ||
                      undefined
                    }
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-start flex flex-col items-center gap-1 my-2">
                    <h4 className="font-semibold text-md">
                      {profile?.username || session.user.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {profile?.email || session.user.email}
                    </p>
                  </div>
                  <Button variant={"secondary"} className="w-full">
                    <Link
                      href="/user-profile"
                      className="w-full text-center text-sm hover:underline"
                    >
                      {profile ? "View Profile Details" : "Create Profile"}
                    </Link>
                  </Button>
                  {!profile && <Logout />}
                </div>
              </div>
            ) : (
              <div className="p-3 text-center">
                <h4 className="font-semibold text-lg mb-2">
                  Welcome to PlanZen
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to access your account
                </p>
                <Button asChild className="w-full">
                  <Link href="/authclient/Login">Sign In</Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default MainHeader;
