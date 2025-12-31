import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils";
import { createTaskSchema, taskQuerySchema } from "@/lib/validation";
import { TaskStatus } from "@/lib/type/task-status";



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const now = new Date();

    await prisma.task.updateMany({
      where: {
        userId: session.user.id,
        status: "IN_PROGRESS",
        dueDate: {
          lt: now, 
        },
      },
      data: {
        status: "INCOMPLETE",
      },
    });

  
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as TaskStatus | null;
    const categoryIdParam = searchParams.get("categoryId");

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(statusParam && { status: statusParam }),
        ...(categoryIdParam && { categoryId: categoryIdParam }),
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const body = await request.json();
    

    if (body.categoryId === "none") body.categoryId = undefined;

    const validatedData = createTaskSchema.parse(body);


    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, userId: session.user.id },
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        status: validatedData.status,
      
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        categoryId: validatedData.categoryId || null,
        userId: session.user.id,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}