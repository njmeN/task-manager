import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export function useChat(chatId?: string) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) return null;
      
      const response = await fetch(`/api/chat?chatId=${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch chat");
      
      return response.json() as Promise<Chat>;
    },
    enabled: !!chatId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, message }: { chatId?: string; message: string }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat", data.chatId] });
    },
  });
}

export function useSyncEmbeddings() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/embeddings/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sync embeddings");
      }

      return response.json();
    },
  });
}


export function useChats() {
    return useQuery({
      queryKey: ["chats"],
      queryFn: async () => {
        const response = await fetch("/api/chat");
        if (!response.ok) throw new Error("Failed to fetch chats");
        
        return response.json() as Promise<Array<{
          id: string;
          title: string;
          createdAt: Date;
          updatedAt: Date;
        }>>;
      },
    });
  }
  
  export function useDeleteChat() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (chatId: string) => {
        const response = await fetch(`/api/chat/${chatId}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          throw new Error("Failed to delete chat");
        }
  
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      },
    });
  }