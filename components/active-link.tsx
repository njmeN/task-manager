"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ActiveLink({ href, children }: { href: string, children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-wrap items-center gap-2 p-3 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-primary/10 text-primary shadow-sm" 
          : "hover:bg-accent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}