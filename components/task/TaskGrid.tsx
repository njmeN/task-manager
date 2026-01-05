"use client";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskCard } from "./task-cards";
import { TaskForm } from "./TaskForm";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import type { TaskWithCategory } from "@/lib/type/api";

interface TaskGridProps {
  tasks: TaskWithCategory[];
  editingTask: TaskWithCategory | null;
  onEditTask: (task: TaskWithCategory | null) => void;
  taskToDeleteId: string | null;
  onDeleteTask: (id: string | null) => void;
  onToggleStatus: (task: TaskWithCategory) => void;
  onConfirmDelete: () => void;
  isUpdating: (taskId: string) => boolean;
  isDeleting: boolean;
}

export function TaskGrid({
  tasks,
  editingTask,
  onEditTask,
  taskToDeleteId,
  onDeleteTask,
  onToggleStatus,
  onConfirmDelete,
  isUpdating,
  isDeleting,
}: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
        <div className="inline-flex flex-wrap h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No tasks found</h3>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleStatus={onToggleStatus}
            isUpdating={isUpdating(task.id)}
          />
        ))}
      </div>

      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && onEditTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm task={editingTask} onClose={() => onEditTask(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!taskToDeleteId}
        onOpenChange={(open) => !open && onDeleteTask(null)}
        title="Are you sure you want to delete this task?"
        description="This task will be permanently removed. This action cannot be undone."
        onConfirm={onConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}