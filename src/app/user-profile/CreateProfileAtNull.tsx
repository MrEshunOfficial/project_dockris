import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileForm from "./ProfileForm"; // Ensure this import path is correct

interface Props {
  editForm: boolean;
  setEditForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateProfileAtNull({ editForm, setEditForm }: Props) {
  const [userProfileEdit, setUserProfileEdit] = useState<any>(null);

  return (
    <section className="w-screen h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {editForm ? (
        <div className="text-center space-y-6 max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <AlertTriangle className="h-16 w-16 text-primary-500 mx-auto animate-pulse" />
          <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            No Profile Created Yet!
          </h3>
          <p className="text-md text-gray-600 dark:text-gray-400">
            {`Let's set up your amazing profile`}
          </p>
          <Button
            variant="outline"
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center space-x-2"
            onClick={() => setEditForm((prev: boolean) => !prev)}
          >
            <span>Create Profile</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      ) : (
        <ProfileForm
          userProfileEdit={userProfileEdit}
          setEditForm={setEditForm}
        />
      )}
    </section>
  );
}
