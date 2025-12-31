"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, Filter, CalendarDays, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { useTasks, useUpdateTask, useDeleteTask } from "@/lib/hook/useTasks";
import { TaskForm } from "./TaskForm";
import { TaskCard } from "./task-cards";
import { AddCategoryButton } from "@/components/add-category-button";
import { isWithinInterval, type DateFilter } from "@/lib/utils/date-filters";
import type { TaskWithCategory } from "@/lib/type/api";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { AIChatButton } from "@/app/(main)/ai-chat-button";
import { TaskStatus } from "@/lib/type/task-status";


export function TaskList({ categoryId }: { categoryId?: string }) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useTasks(categoryId ? { categoryId } : undefined);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : task.status === statusFilter;
      const matchesDate = isWithinInterval(task.dueDate, dateFilter);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [tasks, statusFilter, dateFilter, searchQuery]);

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  if (isError) {
    return (
      <div className="text-center p-12 text-red-500 font-medium">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  const handleToggleStatus = (task: TaskWithCategory) => {
    // If completed, move back to IN_PROGRESS.
    // If IN_PROGRESS or INCOMPLETE, move to COMPLETED.
    const newStatus: TaskStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.IN_PROGRESS
        : TaskStatus.COMPLETED;

    updateTask.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(
            newStatus === TaskStatus.COMPLETED
              ? "Task completed!"
              : "Task reactivated"
          ),
        onError: () => {
          toast.error("Failed to update status");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!taskToDeleteId) return;

    deleteTask.mutate(taskToDeleteId, {
      onSuccess: () => {
        toast.success("Task deleted");
        setTaskToDeleteId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete task");
        setTaskToDeleteId(null);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full xl:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
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
                <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                  Show All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
                >
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(TaskStatus.COMPLETED)}
                >
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setStatusFilter(TaskStatus.INCOMPLETE)}
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
                  className="h-9 flex-1 md:flex-none"
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

                <DropdownMenuItem onClick={() => setDateFilter("ALL")}>
                  Anytime
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDateFilter("PAST")}>
                  Past
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setDateFilter("TODAY")}>
                  Today
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDateFilter("WEEK")}>
                  This Week
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDateFilter("MONTH")}>
                  This Month
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDateFilter("YEAR")}>
                  This Year
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setDateFilter("NO_DEADLINE")}>
                  Without Deadline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <AIChatButton/>
          {!categoryId && <AddCategoryButton />}
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full xl:w-auto cursor-pointer">
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                defaultCategoryId={categoryId}
                onClose={() => setTaskDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={setTaskToDeleteId}
              onToggleStatus={handleToggleStatus}
              isUpdating={
                updateTask.isPending && updateTask.variables?.id === task.id
              }
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!taskToDeleteId}
        onOpenChange={(open) => !open && setTaskToDeleteId(null)}
        title="Are you sure you want to delete this task?"
        description="This task will be permanently removed. This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}