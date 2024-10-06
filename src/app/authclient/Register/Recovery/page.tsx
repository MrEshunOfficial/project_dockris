"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  ArrowRight,
  Shield,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

const Recovery: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(data);
      setIsSuccess(true);
      // Handle successful password recovery email sent
    } catch (error) {
      console.error("Password recovery email failed:", error);
      setError("Failed to send recovery email. Please try again later.");
    }
  };

  return (
    <main className="w-full min-h-[91vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container max-w-4xl flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="w-full md:w-1/2 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Forgot Your Password?</h2>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="ml-4"
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Switch>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <Mail className="h-6 w-6 text-blue-400" />
              <span>
                <strong className="text-blue-400">Enter Your Email:</strong>{" "}
                Provide the email associated with your account.
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <ArrowRight className="h-6 w-6 text-green-400" />
              <span>
                <strong className="text-green-400">Request Reset:</strong> Click
                the button to request a password reset link.
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <Shield className="h-6 w-6 text-yellow-400" />
              <span>
                <strong className="text-yellow-400">Check Your Inbox:</strong>{" "}
                {` We'll send you a secure link to reset your password.`}
              </span>
            </li>
            <li className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <RefreshCw className="h-6 w-6 text-purple-400" />
              <span>
                <strong className="text-purple-400">
                  Reset Your Password:
                </strong>{" "}
                Follow the link to create a new, secure password.
              </span>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`w-full ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Recovery Email"
              )}
            </Button>
          </form>
          {isSuccess && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Recovery email sent. Please check your inbox.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </main>
  );
};

export default Recovery;
