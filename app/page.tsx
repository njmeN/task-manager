
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-8 flex items-center justify-center gap-4">
       
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">
        Manage Your Tasks Effectively
        </h1>
        <p className="text-muted-foreground mt-3 text-base text-balance sm:text-lg">
        Simple, powerful task management for everyone
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/all-tasks">Lets Start!</Link>
          </Button>
          
        </div>
      </div>
    </main>
  );
}