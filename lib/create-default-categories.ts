// lib/create-default-categories.ts
import  prisma  from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "./default-categories";

export async function createDefaultCategories(userId: string) {
  try {
    // Check if user already has categories
    const existingCount = await prisma.category.count({
      where: { userId },
    });

    // Only create if user has no categories
    if (existingCount === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          name: cat.name,
          color: cat.color,
          userId,
        })),
      });
    }
  } catch (error) {
    console.error("Error creating default categories:", error);
    // Don't throw - this is not critical
  }
}