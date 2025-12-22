// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { 
  handleApiError, 
  unauthorizedResponse, 
  notFoundResponse 
} from "@/lib/api-utils";
import { updateCategorySchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!category) {
      return notFoundResponse("Category");
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/categories/[id] - Update a category
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    // Check category ownership
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return notFoundResponse("Category");
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check for duplicate name if name is being changed
    if (validatedData.name && validatedData.name !== category.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: validatedData.name,
          userId: session.user.id,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.color !== undefined && { color: validatedData.color }),
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    // Check category ownership
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return notFoundResponse("Category");
    }

    // Delete category (tasks will have categoryId set to null due to onDelete: SetNull)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error) {
    return handleApiError(error);
  }
}