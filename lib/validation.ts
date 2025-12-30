// lib/validations/task.ts
import { z } from "zod";
import { TaskStatus } from "@prisma/client";


export const TaskFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(TaskStatus), 
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
});

export type TaskFormInput = z.infer<typeof TaskFormSchema>;

export const passwordSchema = z
  .string()
  .min(1, { message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });


  export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().max(1000, "Description is too long").optional(),
    status: z.enum(TaskStatus).default(TaskStatus.IN_PROGRESS),
    dueDate: z.iso.datetime().optional(),
    categoryId: z.string().optional(),
  });
  

  export const taskQuerySchema = z.object({
    categoryId: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  });
  
  export type CreateTaskInput = z.infer<typeof createTaskSchema>;
  
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
  
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(TaskStatus).optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
});


export const sendMessageSchema = z.object({
  chatId: z.string().optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;