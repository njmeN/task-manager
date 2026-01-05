import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (user) redirect("/all-tasks");

  return (
    <main className="flex flex-wrap min-h-svh items-center justify-center px-4">
      <SignUpForm />
    </main>
  );
}
