"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";


interface SidebarClientProps {
  children: ReactNode;
}

export default function SidebarClient({ children }: SidebarClientProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const buttonStyles = "p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-sm";

  if (!mounted) {
    return (
      <button className={buttonStyles} type="button">
        <Menu className="size-6 cursor-pointer" />
      </button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className={buttonStyles} type="button" aria-label="Open Menu">
          <Menu className="size-6 cursor-pointer" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col gap-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
     
        {children}
        
      </SheetContent>
    </Sheet>
  );
}