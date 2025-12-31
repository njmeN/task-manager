"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TaskFormSchema, type TaskFormInput } from "@/lib/validation";

import { useCategories } from "@/lib/hook/useCategories";
import { useCreateTask, useUpdateTask } from "@/lib/hook/useTasks";
import { toast } from "sonner";
import type { TaskWithCategory } from "@/lib/type/api";
import { TaskStatus } from "@/lib/type/task-status";

interface TaskFormProps {
  task?: TaskWithCategory;
  defaultCategoryId?: string;
  onClose: () => void;
}

export function TaskForm({ task, defaultCategoryId, onClose }: TaskFormProps) {
  const isEditMode = !!task;

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isPending = isEditMode
    ? updateTask.isPending
    : createTask.isPending;

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? TaskStatus.IN_PROGRESS,
      dueDate: task?.dueDate
        ? new Date(task.dueDate)
            .toLocaleString("sv-SE")
            .replace(" ", "T")
            .slice(0, 16)
        : "",
      categoryId: task?.categoryId ?? defaultCategoryId ?? "none",
    },
  });

  const onSubmit = (data: TaskFormInput) => {
    if (isPending) return;

    const payload = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString()
        : undefined,
      categoryId:
        data.categoryId === "none" ? undefined : data.categoryId,
    };

    if (isEditMode && task) {
      updateTask.mutate(
        { id: task.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Task updated successfully");
            onClose();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update task");
          },
        }
      );
    } else {
      createTask.mutate(payload, {
        onSuccess: () => {
          toast.success("Task created successfully");
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create task");
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Details..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date & Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
  control={form.control}
  name="categoryId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category (Optional)</FormLabel>
      <Select
        onValueChange={field.onChange}
        value={field.value || "none"}
        disabled={isCategoriesLoading || isCategoriesError}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="none">No Category</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
