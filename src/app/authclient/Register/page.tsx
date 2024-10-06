"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "@/store/User/authSlice";
import { useToast } from "@/components/ui/use-toast";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

const schema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
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

const Registration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const resultAction = await dispatch(registerUser(data));

      if (registerUser.fulfilled.match(resultAction)) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
          duration: 5000,
        });
        reset();
        alert("Registration successful! Redirecting to login page...");
        router.push("/authclient/Login");
      } else if (registerUser.rejected.match(resultAction)) {
        toast({
          title: "Registration Failed",
          description: error,
          duration: 5000,
          variant: "destructive",
        });
        dispatch(clearError());
      }
    } catch (err) {
      console.error("Unexpected error during registration:", err);
    }
  };

  const generatePasswordSuggestion = async () => {
    setIsGeneratingPassword(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const password = Math.random().toString(36).slice(-10) + "A1!";
      setValue("password", password);
      setValue("confirmPassword", password);
    } catch (error) {
      console.error("Password generation failed:", error);
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  return (
    <div
      className={`min-h-[91vh] bg-gray-100 flex items-center justify-center p-4 dark:bg-gray-900`}
    >
      <div
        className={`w-full max-w-md dark:bg-gray-800 bg-white p-8 rounded-lg shadow-md`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-2xl font-bold dark:text-white text-gray-900"
            `}
          >
            Create an account
          </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className={`block text-sm font-medium dark:text-gray-300  text-gray-700`}
            >
              Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
                className={`pl-10 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`block text-sm font-medium dark:text-gray-300 text-gray-700`}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                size={20}
              />
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="Your email"
                className={`pl-10 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className={`block text-sm font-medium dark:text-gray-300 text-gray-700`}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                id="password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className={`pl-10 pr-10 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-medium dark:text-gray-300 text-gray-700`}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                id="confirmPassword"
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={generatePasswordSuggestion}
            disabled={isGeneratingPassword}
            className="w-full"
          >
            {isGeneratingPassword ? "Generating..." : "Suggest Password"}
          </Button>

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 size={20} className="mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <Button variant="outline" className="w-full">
            <FcGoogle size={24} className="mr-2" />
            Sign up with Google
          </Button>
          <Button variant="outline" className="w-full">
            <FaFacebook size={24} className="mr-2 text-blue-500" />
            Sign up with Facebook
          </Button>
        </div>

        <p
          className={`text-center mt-8 text-sm dark:bg-gray-700 dark:text-white bg-white text-gray-900 p-2`}
        >
          Already have an account ?
          <a
            href="/authclient/Login"
            className="text-blue-600 hover:underline ml-2"
          >
            Log in
          </a>
        </p>
      </div>
      <Toaster />
    </div>
  );
};

export default Registration;
