import { Category } from "@prisma/client";

export type CategoryOption = Pick<Category, "id" | "name" | "color">;
