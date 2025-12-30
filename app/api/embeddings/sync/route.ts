import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils";
import { generateEmbedding } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: { 
        category: { 
          select: { name: true, color: true } 
        } 
      },
    });

    let syncedCount = 0;
    let updatedCount = 0;

    for (const task of tasks) {
      const taskText = `
Task: ${task.title}
Description: ${task.description || "No description provided"}
Status: ${task.status}
Category: ${task.category?.name || "Uncategorized"}
Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { 
  year: "numeric", 
  month: "long", 
  day: "numeric" 
}) : "No due date set"}
Created: ${task.createdAt.toLocaleDateString("en-US", { 
  year: "numeric", 
  month: "long", 
  day: "numeric" 
})}
      `.trim();

      const existingEmbedding = await prisma.taskEmbedding.findUnique({
        where: { taskId: task.id },
      });

      const needsUpdate = !existingEmbedding || 
        existingEmbedding.content !== taskText;

      if (needsUpdate) {
        const embedding = await generateEmbedding(taskText);
        
        await prisma.taskEmbedding.upsert({
          where: { taskId: task.id },
          create: {
            taskId: task.id,
            embedding: JSON.stringify(embedding),
            content: taskText,
          },
          update: {
            embedding: JSON.stringify(embedding),
            content: taskText,
            updatedAt: new Date(),
          },
        });

        if (existingEmbedding) {
          updatedCount++;
        } else {
          syncedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new tasks, updated ${updatedCount} tasks`,
      total: tasks.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}