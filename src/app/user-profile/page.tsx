"use client";
import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  LoadingPageSkeleton,
} from "@/components/ui/LoadingContent";
import ProfileForm from "@/app/user-profile/ProfileForm";
import { AppDispatch, RootState } from "@/store";
import {
  deleteUserProfile,
  IUserProfile,
  updateProfilePicture,
} from "@/store/userProfileSlice";
import {
  Trash2,
  User,
  Camera,
  Settings,
  Users,
  ThumbsUp,
  ChevronDown,
  Edit,
  Lock,
  Shield,
  BoltIcon,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import ProfileDetails from "./ProfileDetails";
import CreateProfileAtNull from "./CreateProfileAtNull";
import Logout from "@/components/ui/Logout";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Bell, Mail, Star } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";

const UserProfileComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(
    (state: RootState) => state.userProfile
  );
  const [editForm, setEditForm] = useState(false);
  const [userProfileEdit, setUserProfileEdit] = useState<IUserProfile | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  if (loading === "pending") return <LoadingPageSkeleton />;
  if (profile !== null && error) return <ErrorState error={error} />;
  if (profile === null)
    return (
      <CreateProfileAtNull setEditForm={setEditForm} editForm={editForm} />
    );

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await dispatch(updateProfilePicture(file)).unwrap();
        toast({
          title: "Image Uploaded",
          description: "Your profile image has been successfully uploaded.",
          duration: 5000,
        });
        window.location.reload();
        event.target.value = "";
      } catch (error) {
        toast({
          title: "Failed to upload image",
          description: `Image upload unsuccessful, ${error}.`,
          duration: 5000,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6 sticky top-0 z-20">
          <UserProfileHeader
            setUserProfileEdit={setUserProfileEdit}
            setEditForm={setEditForm}
            profile={profile}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-1/4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex flex-col items-center capitalize">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-primary-500 rounded-full shadow-lg">
                    <AvatarImage
                      src={
                        profile.profilePicture ||
                        session?.user?.image ||
                        undefined
                      }
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
                    onClick={handleProfilePictureClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile.fullName.firstName} {profile.fullName.lastName}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                  @{profile.username}
                </p>
                <div className="w-full space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings size={18} className="mr-2" />
                    Account Settings
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      dispatch(deleteUserProfile()).unwrap();
                      toast({
                        title: "Account Deleted",
                        description:
                          "Your account has been successfully deleted.",
                        duration: 5000,
                        variant: "destructive",
                      });
                      window.location.reload();
                    }}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete Account
                  </Button>
                  <Logout />
                </div>
              </div>
            </motion.div>
          </aside>
          <main className="flex-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              {editForm ? (
                <ProfileForm
                  userProfileEdit={userProfileEdit}
                  setEditForm={setEditForm}
                />
              ) : (
                <ProfileDetails profile={profile} />
              )}
            </motion.div>
          </main>
        </div>
      </div>
      <Toaster />
    </motion.section>
  );
};

interface UserProfileHeaderProps {
  profile: IUserProfile;
  setUserProfileEdit: React.Dispatch<React.SetStateAction<IUserProfile | null>>;
  setEditForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  profile,
  setUserProfileEdit,
  setEditForm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleEditProfile = (profile: IUserProfile) => {
    setUserProfileEdit(profile);
    setEditForm((prev) => !prev);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {profile.fullName.firstName}&apos;s Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {profile.fullName.firstName}!
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell size={18} className="text-gray-500 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail size={18} className="text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <BoltIcon
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
                <span>Quick Actions</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-max mt-1 border-gray-300 dark:border-gray-700 p-2 rounded-lg shadow-md bg-white dark:bg-gray-950">
              <ul className="list-none cursor-pointer p-0 space-y-2 text-sm">
                <li
                  className="flex items-center space-x-2 dark:hover:bg-gray-800 hover:bg-gray-300 p-2 rounded-md"
                  onClick={() => handleEditProfile(profile)}
                >
                  <Edit className="text-blue-500" size={16} />
                  <span>Edit Profile</span>
                </li>
                <li className="flex items-center space-x-2 dark:hover:bg-gray-800 hover:bg-gray-300 p-2 rounded-md">
                  <Lock className="text-green-500" size={16} />
                  <span>Change Password</span>
                </li>
                <li className="flex items-center space-x-2 dark:hover:bg-gray-800 hover:bg-gray-300 p-2 rounded-md">
                  <Shield className="text-red-500" size={16} />
                  <span>Privacy Settings</span>
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        className="overflow-hidden mt-4"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <StatCard icon={<Star />} label="Total Posts" value="42" />
              <StatCard icon={<Users />} label="Followers" value="1,337" />
              <StatCard icon={<ThumbsUp />} label="Likes" value="9,001" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 w-full flex justify-center items-center"
      >
        {isOpen ? "Hide Stats" : "Show Stats"}
        <ChevronDown
          size={16}
          className={`ml-2 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>
    </motion.header>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
    <div className="text-blue-500 dark:text-blue-400">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);
export default UserProfileComponent;
