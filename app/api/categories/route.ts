// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils";
import { createCategorySchema } from "@/lib/validation";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        userId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}