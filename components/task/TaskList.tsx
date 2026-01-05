"use client";
import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTasks, useUpdateTask, useDeleteTask } from "@/lib/hook/useTasks";
import { TaskForm } from "./TaskForm";
import { AddCategoryButton } from "@/components/add-category-button";
import { isWithinInterval, type DateFilter } from "@/lib/utils/date-filters";
import type { TaskWithCategory } from "@/lib/type/api";
import { TaskStatus } from "@/lib/type/task-status";
import { AIChatButton } from "../chat/AIChatButton";
import { TaskFilters } from "./TaskFilters";
import { TaskGrid } from "./TaskGrid";

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

  const handleToggleStatus = (task: TaskWithCategory) => {
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

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-12 text-red-500 font-medium">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 flex-wrap">
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto">
          <AIChatButton />
          {!categoryId && <AddCategoryButton />}
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto cursor-pointer shrink">
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

      <TaskGrid
        tasks={filteredTasks}
        editingTask={editingTask}
        onEditTask={setEditingTask}
        taskToDeleteId={taskToDeleteId}
        onDeleteTask={setTaskToDeleteId}
        onToggleStatus={handleToggleStatus}
        onConfirmDelete={handleDelete}
        isUpdating={(taskId) =>
          updateTask.isPending && updateTask.variables?.id === taskId
        }
        isDeleting={deleteTask.isPending}
      />
    </div>
  );
}