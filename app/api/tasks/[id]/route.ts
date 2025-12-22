import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { 
  handleApiError, 
  unauthorizedResponse, 
  notFoundResponse 
} from "@/lib/api-utils";
import {  updateTaskSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};


export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await context.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    if (!task) return notFoundResponse("Task");
    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await context.params;


    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existingTask) return notFoundResponse("Task");

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);


    const dataToUpdate: any = { ...validatedData };

  
    if (validatedData.dueDate !== undefined) {
      dataToUpdate.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

 
    const now = new Date();

    const finalDate = dataToUpdate.dueDate !== undefined ? dataToUpdate.dueDate : existingTask.dueDate;
    const finalStatus = validatedData.status || existingTask.status;

 
    if (finalStatus !== "COMPLETED") {
      if (finalDate && new Date(finalDate) < now) {
        dataToUpdate.status = "INCOMPLETE"; 
      } else {
        dataToUpdate.status = "IN_PROGRESS"; 
      }
    }


    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate, 
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return handleApiError(error);
  }
}


// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existingTask) return notFoundResponse("Task");

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}