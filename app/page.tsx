"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = () => {
    setIsLoading(true);
    router.push("/all-tasks");
  };

  return (
    <main className="flex flex-wrap min-h-svh items-center justify-center px-4">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          {/* Your logo/image here */}
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Manage Your Tasks Effectively
        </h1>
        <p className="text-muted-foreground mt-3 text-base text-balance sm:text-lg">
          Simple, powerful task management for everyone
        </p>
        <div className="mx-auto mt-6 flex flex-wrap max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleNavigation} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Let's Start!"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}