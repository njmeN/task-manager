import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "@prisma/client";
import type { TaskWithCategory } from "@/lib/type/api";
import type { TaskFormInput } from "@/lib/validation";

interface TaskFilters {
  categoryId?: string;
  status?: TaskStatus;
}


// hooks/useTasks.ts
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categoryId) params.append("categoryId", filters.categoryId);
      if (filters?.status) params.append("status", filters.status);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const data: TaskWithCategory[] = await response.json();
      const now = new Date();
      return data.map(task => {
        if (task.status === "IN_PROGRESS" && task.dueDate && new Date(task.dueDate) < now) {
          return { ...task, status: "INCOMPLETE" as TaskStatus };
        }
        return task;
      });
    },
  });
}


export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormInput) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}


export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TaskFormInput> & { id: string }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update task");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}


export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}