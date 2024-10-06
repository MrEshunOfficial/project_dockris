"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const LoadingPageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4 border rounded-lg bg-gray-50">
      <div className="w-full p-4 border rounded-lg flex items-center justify-between mb-6 bg-white shadow-sm">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="w-full flex-1 flex items-stretch justify-between gap-4">
        <div className="w-2/5 flex flex-col h-full border rounded-lg p-4 gap-4 bg-white shadow-sm">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="flex justify-end gap-2 mt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="flex-1 h-full flex flex-col items-center justify-between gap-4 bg-white border rounded-lg p-4 shadow-sm">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="w-full flex justify-between items-center mt-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="w-72 h-full flex flex-col gap-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Error State Component
interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
      <Alert variant="destructive" className="mb-6 max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "An unexpected error occurred"}
        </AlertDescription>
      </Alert>
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {`We're sorry, but it looks like there was a problem loading the page.
        Please try again or contact support if the issue persists.`}
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};
