import Link from "next/link";
import { SidebarUI } from "@/app/(main)/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="">
      <div className="flex flex-wrap max-w-7xl flex-wrap items-center gap-5 px-5 py-3 text-2xl font-bold">
        <SidebarUI />
        <Link href="/" className="text-primary">
          Home
        </Link>
        <ThemeToggle />
     
      </div>
    </header>
  );
}