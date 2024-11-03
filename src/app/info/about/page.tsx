import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="w-full h-full flex flex-col items-center justify-center p-2 border  border-gray-300 dark:border-gray-700 rounded-lg">
      About Page
      <p className="mt-4">This is the get started page.</p>
      <Button variant={"default"}>
        <Link href={"/"}>Go to Home page</Link>
      </Button>
    </section>
  );
}
