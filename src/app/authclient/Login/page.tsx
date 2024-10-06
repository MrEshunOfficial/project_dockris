"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { login, clearError, fetchCurrentUser } from "@/store/User/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const resultAction = await dispatch(login(data));
      if (login.fulfilled.match(resultAction)) {
        // Dispatch fetchCurrentUser after successful login
        await dispatch(fetchCurrentUser());
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
          duration: 10000,
        });
        reset();
        router.push("/Features");
      } else if (login.rejected.match(resultAction)) {
        toast({
          title: "Login Failed",
          description: error,
          duration: 10000,
          variant: "destructive",
        });
        dispatch(clearError());
      }
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error,
        duration: 10000,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Log in to your account
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Welcome back! Please enter your details.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="Your email"
                className="pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="pl-10 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Remember me
              </span>
            </label>
            <Link
              href="/authclient/Recovery"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <Button variant="outline" className="w-full">
            <FcGoogle size={24} className="mr-2" />
            Log in with Google
          </Button>
          <Button variant="outline" className="w-full">
            <FaFacebook size={24} className="mr-2 text-blue-500" />
            Log in with Facebook
          </Button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          {`Don't have an account ?`}
          <Link
            href="/authclient/Register"
            className="text-blue-600 dark:text-blue-400 hover:underline ml-2"
          >
            Sign up
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
};

export default Login;
