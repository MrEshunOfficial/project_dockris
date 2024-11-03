// Login.tsx
"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomLogin from "@/components/ui/CustomLogin";
import SocialLogin from "@/components/ui/SocialLogin";
import Link from "next/link";

export default function Login() {
  return (
    <main className="min-h-full w-full flex flex-col lg:flex-row">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background to-muted -z-10" />

      {/* Left side - Login Form */}
      <section className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[60vh] lg:min-h-full">
        <Card className="w-full max-w-lg border-0 shadow-lg bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back
                <span className="block h-1 w-10 bg-primary mt-2" />
              </h1>
              <CardDescription className="text-base sm:text-lg">
                Choose your preferred sign in method to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <CustomLogin />
            <div className="relative">
              <Separator className="my-4" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                or continue with
              </span>
            </div>
            <SocialLogin />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <Button variant="link" className="px-1 h-auto">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="link" className="px-1 h-auto">
                Privacy Policy
              </Button>
            </p>
            <div className="w-full pt-2">
              <Separator className="my-4" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {`Don't have an account?`}
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Link href="/authclient/Register">Create an account</Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Right side - Hero/Branding */}
      <section className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-90" />
        <div className="relative w-full max-w-2xl mx-auto flex flex-col justify-center p-4 text-primary-foreground">
          <div className="space-y-3">
            <h2 className="text-4xl xl:text-5xl font-bold">
              Start your journey with us
            </h2>
            <p className="text-lg xl:text-xl leading-relaxed opacity-90">
              Join thousands of users who trust our platform for their needs.
              Get started in minutes with our simple sign-in process.
            </p>
          </div>

          <div className="grid gap-3 mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature Cards */}
              <div className="group p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
                <h3 className="font-semibold text-xl mb-3">
                  Secure Authentication
                </h3>
                <p className="opacity-50">
                  Industry-standard security protocols to protect your data
                </p>
              </div>
              <div className="group p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
                <h3 className="font-semibold text-xl mb-3">Easy Access</h3>
                <p className="opacity-50">
                  Multiple login options to suit your preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
