import prisma from "./prisma";
import { TaskStatus } from "@prisma/client";

export async function updateOverdueTasks(userId: string) {
  const now = new Date();

  const result = await prisma.task.updateMany({
    where: {
      userId,
      status: TaskStatus.IN_PROGRESS,
      dueDate: { lt: now }, 
    },
    data: { status: TaskStatus.INCOMPLETE }, 
  });

  return result.count;
}
