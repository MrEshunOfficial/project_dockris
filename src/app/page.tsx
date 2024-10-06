import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <section className="w-full h-[90vh] flex flex-col items-center justify-center p-2 border rounded-lg">
      Get Started
      <p className="mt-4">This is the get started page.</p>
      <Button variant={"default"}>
        <Link href={"/Features"}>Go to Features</Link>
      </Button>
    </section>
  );
}
