import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const embeddingModel = genAI.getGenerativeModel({ 
  model: "models/text-embedding-004" 
});

const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash"
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function findRelevantTasks(
  query: string,
  taskEmbeddings: Array<{ id: string; embedding: number[]; content: string }>,
  topK: number = 5
) {
  const queryEmbedding = await generateEmbedding(query);
  
  const similarities = taskEmbeddings.map((task) => ({
    ...task,
    similarity: cosineSimilarity(queryEmbedding, task.embedding),
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

export async function generateChatResponse(
  userMessage: string,
  relevantContext: string,
  chatHistory: Array<{ role: string; content: string }> = []
) {
  const systemPrompt = `You are an insightful task management assistant and productivity coach. 
Your goal is to help users not just track tasks, but optimize their workflow and provide feedback on their planning.

Here is the relevant context from the user's tasks:
${relevantContext}

Instructions:
- Answer in the same language as the user's question.
- Be helpful, proactive, and encouraging.
- If a user asks for your opinion or advice on their tasks, analyze the context provided (e.g., deadlines, task density, or clarity) and offer constructive suggestions.
- If the context doesn't contain the specific information needed, provide a general best-practice response while noting the limitation.
- Use the task information to provide specific, actionable answers.
- Format dates in a readable way.`;

  const chat = chatModel.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'll help you with your tasks based on the context provided." }],
      },
      ...chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}