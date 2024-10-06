"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingPageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 gap-1 border rounded-lg">
      <div className="w-full p-2 border rounded-lg flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="w-full flex-1 flex items-center justify-between gap-1">
        <div className="w-2/5 flex flex-col h-full border rounded-lg p-2 gap-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 h-full flex flex-col items-center justify-between gap-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="w-72 h-full flex flex-col gap-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
};

// Error State Component
interface ErrorStateProps {
  error: string | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        {error || "An unexpected error occurred"}
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
};
