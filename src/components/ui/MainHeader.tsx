"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Bell, Moon, Sun, Laptop, User } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import ProfileComponent from "./ProfileDisplay";

const MainHeader: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);

  const isActive = (path: string): boolean => pathname === path;

  const navItems: Array<{ name: string; path: string }> = [
    { name: "Home", path: "/" },
    { name: "About", path: "/Info/about" },
    { name: "Contact", path: "/Info/contact" },
    { name: "Location", path: "/Info/location" },
    { name: "Support", path: "/Info/support" },
  ];
  const [profileImage, setProfileImage] = useState<File | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full py-4 px-6 flex justify-between items-center bg-background shadow-md"
    >
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
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={isActive(item.path) ? "text-primary" : ""}
                    >
                      {item.name}
                    </motion.span>
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
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have 3 unread messages.
                </p>
              </div>
              {/* Add more notification content here */}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="grid gap-4">
              <Button
                variant="ghost"
                onClick={() => setTheme("light")}
                className="justify-start"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme("dark")}
                className="justify-start"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme("system")}
                className="justify-start"
              >
                <Laptop className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Link href={"/Profile"}>
          <Avatar>
            {profileImage ? (
              <AvatarImage
                src={URL.createObjectURL(profileImage)}
                alt="Profile"
              />
            ) : (
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      </div>
    </motion.header>
  );
};

export default MainHeader;
