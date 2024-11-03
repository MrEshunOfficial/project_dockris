import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ReactNode } from "react";
import MainHeader from "@/components/ui/MainHeader";
import "aos/dist/aos.css";
import "react-datepicker/dist/react-datepicker.css";
import { SessionProvider } from "next-auth/react";
import UnifiedFetch from "@/components/UnifiedFetch";

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlanZen",
  description: "Plan, Track, and Prosper",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.className} antialiased`}>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UnifiedFetch>
                <div className="min-h-screen flex flex-col">
                  {/* Header container with responsive padding */}
                  <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2">
                    <header className="w-full p-2 sm:p-4 flex justify-between items-center bg-background shadow-md rounded-lg">
                      <MainHeader />
                    </header>
                  </div>

                  {/* Main content container with responsive layout */}
                  <div className="flex-1 w-full px-2 sm:px-4 md:px-6 lg:px-8 mt-2">
                    <main className="h-[calc(100vh-theme(spacing.24))] sm:h-[calc(100vh-theme(spacing.28))] overflow-auto rounded-lg">
                      {children}
                    </main>
                  </div>
                </div>
              </UnifiedFetch>
            </ThemeProvider>
          </ReduxProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
