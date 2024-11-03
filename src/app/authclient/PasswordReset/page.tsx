"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const generatePassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const PasswordReset: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    setSuggestedPassword(generatePassword());
  }, []);

  const handleSuggest = () => {
    const newPassword = generatePassword();
    setSuggestedPassword(newPassword);
    setValue("password", newPassword);
    setValue("confirmPassword", newPassword);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(data);
      // Handle successful password reset
    } catch (error) {
      console.error("Password reset failed:", error);
      // Handle error
    }
  };

  return (
    <main className="w-full min-h-[91vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container max-w-4xl flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="w-full md:w-1/2 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Reset Your Password</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <Lock className="h-6 w-6 text-blue-400" />
              <span>
                <strong className="text-blue-400">Create New Password:</strong>{" "}
                Choose a strong, unique password.
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <Shield className="h-6 w-6 text-green-400" />
              <span>
                <strong className="text-green-400">Meet Requirements:</strong>{" "}
                Ensure your password meets all security criteria.
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-400" />
              <span>
                <strong className="text-yellow-400">Confirm Password:</strong>{" "}
                Re-enter your new password to confirm.
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-purple-400" />
              <span>
                <strong className="text-purple-400">Stay Vigilant:</strong>{" "}
                Never share your password with anyone.
              </span>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                size={20}
              />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.password.message}</AlertDescription>
              </Alert>
            )}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                size={20}
              />
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errors.confirmPassword.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggest}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Suggest Password
              </Button>
              {suggestedPassword && (
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  Suggested: {showPassword ? suggestedPassword : "********"}
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Set new password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default PasswordReset;
