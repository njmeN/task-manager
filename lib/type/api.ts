// types/api.ts
import { Task, Category, TaskStatus } from "@prisma/client";

export type TaskWithCategory = Task & {
  category: Pick<Category, "id" | "name" | "color"> | null;
};

export type TaskWithRelations = Task & {
  category: Pick<Category, "id" | "name" | "color"> | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type CategoryWithCount = Category & {
  _count: {
    tasks: number;
  };
};

export type ApiError = {
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
};

export type ApiSuccess<T = unknown> = {
  success: true;
  data?: T;
  message?: string;
};