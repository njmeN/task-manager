

import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn() {
   const session = await getServerSession();
    const user = session?.user;
  
    if (user) redirect("/all-tasks");
  return (
    <main className="flex flex-wrap min-h-svh items-center justify-center px-4">
      <SignInForm />
    </main>
  );
}