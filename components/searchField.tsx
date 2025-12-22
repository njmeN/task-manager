"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";

interface SearchFieldProps {
  onChange: (value: string) => void;
}

export default function SearchField({ onChange }: SearchFieldProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Input
        placeholder="Search tasks..."
        className="pe-10 h-9"
        onChange={(e) => onChange(e.target.value)}
      />
      <SearchIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer transform text-muted-foreground" />
    </div>
  );
}