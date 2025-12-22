import { auth } from "@/lib/auth";
import Navbar from "./Navbar";
import { unauthorized } from "next/navigation"
import { getServerSession } from "@/lib/get-session";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  const user = session?.user;
  
  if (!user) unauthorized();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {children}
    </div>
  );
}