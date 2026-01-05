"use client";
import { Search, X, Filter, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TaskStatus } from "@/lib/type/task-status";
import type { DateFilter } from "@/lib/utils/date-filters";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: TaskStatus | "ALL";
  onStatusFilterChange: (status: TaskStatus | "ALL") => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap flex-col md:flex-row items-start md:items-center gap-2 w-full xl:w-auto">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1 md:flex-none"
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "ALL"
                ? "All Status"
                : statusFilter === "INCOMPLETE"
                ? "Overdue"
                : statusFilter.replace("_", " ").toLowerCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Status Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusFilterChange("ALL")}>
              Show All
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusFilterChange(TaskStatus.IN_PROGRESS)}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusFilterChange(TaskStatus.COMPLETED)}
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onStatusFilterChange(TaskStatus.INCOMPLETE)}
            >
              Overdue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-wrap flex-1 md:flex-none"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {dateFilter === "ALL"
                ? "Anytime"
                : dateFilter === "NO_DEADLINE"
                ? "No Deadline"
                : dateFilter.replace("_", " ").toLowerCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Due Date Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDateFilterChange("ALL")}>
              Anytime
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("PAST")}>
              Past
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDateFilterChange("TODAY")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("WEEK")}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("MONTH")}>
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateFilterChange("YEAR")}>
              This Year
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDateFilterChange("NO_DEADLINE")}>
              Without Deadline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
