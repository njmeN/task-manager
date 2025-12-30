import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { handleApiError, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await context.params;

    const existingChat = await prisma.chat.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingChat) return notFoundResponse("Chat");

    await prisma.chat.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}