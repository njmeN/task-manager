"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 items-end focus:outline-none focus-visible:outline-none cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0">
        Theme <ChevronDown className="h-6 w-6" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          className="focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={() => setTheme("system")}
        >
          <Monitor className="mr-2 size-4" />
          System default
          {theme === "system" && <Check className="ms-2 size-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
          {theme === "light" && <Check className="ms-2 size-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
          {theme === "dark" && <Check className="ms-2 size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}