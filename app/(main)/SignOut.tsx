"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message || "Something went wrong.");
    } else {
      toast.success("Signed out successfully");
      router.push("/sign-in");
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center justify-center gap-4 rounded cursor-pointer bg-red-500 text-white p-2 hover:bg-red-600"
    >
      <LogOut className="h-5 w-5" /> Sign Out
    </button>
  );
}