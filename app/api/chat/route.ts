import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { handleApiError, unauthorizedResponse } from "@/lib/api-utils";
import { sendMessageSchema } from "@/lib/validation";
import { findRelevantTasks, generateChatResponse } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const body = await request.json();
    const { chatId, message } = sendMessageSchema.parse(body);

    let chat;
    if (!chatId) {
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50),
        },
      });
    } else {
      chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: session.user.id },
      });
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    }

    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: message,
      },
    });

    const taskEmbeddings = await prisma.taskEmbedding.findMany({
      where: {
        task: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        taskId: true,
        embedding: true,
        content: true,
      },
    });

    const embeddingsWithVectors = taskEmbeddings.map((emb) => ({
      id: emb.taskId,
      embedding: JSON.parse(emb.embedding) as number[],
      content: emb.content,
    }));

    const relevantTasks = await findRelevantTasks(
      message,
      embeddingsWithVectors,
      5
    );

    const context = relevantTasks
      .map((task, i) => `[Task ${i + 1}] (Relevance: ${(task.similarity * 100).toFixed(1)}%)\n${task.content}`)
      .join("\n\n---\n\n");

    const chatHistory = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: {
        role: true,
        content: true,
      },
    });

    const aiResponse = await generateChatResponse(
      message,
      context || "No relevant tasks found.",
      chatHistory.slice(0, -1)
    );

    const assistantMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    return NextResponse.json({
      chatId: chat.id,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      const chats = await prisma.chat.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return NextResponse.json(chats);
    }

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return handleApiError(error);
  }
}