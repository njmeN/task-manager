"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bot,
  Expand,
  Minimize,
  Send,
  X,
  Loader2,
  Plus,
  Menu,
  RefreshCw,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
  useChat,
  useSendMessage,
  useSyncEmbeddings,
  useChats,
  useDeleteChat,
} from "@/lib/hook/useChat";
import { toast } from "sonner";
import { ChatSidebar } from "./ChatSidebar";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
  chatId?: string;
  onChatIdChange: (chatId: string | undefined) => void;
}

export function AIChatBox({ open, onClose, chatId, onChatIdChange }: AIChatBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: chats, isLoading: chatsLoading } = useChats();
  const sendMessage = useSendMessage();
  const syncEmbeddings = useSyncEmbeddings();
  const deleteChat = useDeleteChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (open && !chatId) {
      syncEmbeddings.mutate(undefined, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error("Failed to sync tasks: " + error.message);
        },
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessage.isPending) return;

    const message = inputMessage.trim();
    setInputMessage("");

    sendMessage.mutate(
      { chatId, message },
      {
        onSuccess: (data) => {
          if (!chatId) {
            onChatIdChange(data.chatId);
          }
        },
        onError: (error) => {
          toast.error("Failed to send message: " + error.message);
        },
      }
    );
  };

  const handleNewChat = () => {
    onChatIdChange(undefined);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    onChatIdChange(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (id: string) => {
    deleteChat.mutate(id, {
      onSuccess: () => {
        if (chatId === id) {
          onChatIdChange(undefined);
        }
        toast.success("Chat deleted");
      },
      onError: (error) => {
        toast.error("Failed to delete chat: " + error.message);
      },
    });
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-10 bg-card fixed bottom-4 z-50 flex rounded-lg border shadow-lg duration-300",
        "left-4 right-4 md:left-auto md:right-4 2xl:right-16",
        isExpanded ? "h-[650px] max-h-[90vh]" : "h-[500px] max-h-[80vh]",
        "md:w-96 lg:w-[550px]",
        sidebarOpen && "lg:w-[800px]"
      )}
    >
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        chatsLoading={chatsLoading}
        currentChatId={chatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-primary text-primary-foreground flex items-center justify-between border-b p-3 rounded-tr-lg">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8 shrink-0"
            >
              <Menu className="size-4" />
            </Button>
            <Bot size={18} className="shrink-0" />
            <h3 className="font-medium truncate">Task Assistant</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                syncEmbeddings.mutate(undefined, {
                  onSuccess: (data) => toast.success(data.message),
                  onError: (error) => toast.error("Sync failed: " + error.message),
                });
              }}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              title="Sync tasks"
              disabled={syncEmbeddings.isPending}
            >
              {syncEmbeddings.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8 hidden sm:flex"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize className="size-4" /> : <Expand className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              title="New chat"
            >
              <Plus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-4">
            {syncEmbeddings.isPending && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Syncing your tasks...
                </span>
              </div>
            )}

            {!chatId && !syncEmbeddings.isPending && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bot className="size-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">Welcome to Task Assistant!</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Ask me anything about your tasks. I can help you find,
                  organize, and analyze them.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground max-w-sm">
                  <p className="flex items-start gap-2">
                    <RefreshCw className="size-3.5 mt-0.5 shrink-0" />
                    <span>
                      <strong>Tip:</strong> Tasks are synced when you first open the chat. 
                      If you create, update, or delete tasks, click the{" "}
                      <RefreshCw className="size-3 inline" /> button in the header to sync them.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {chatLoading && chatId && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            )}

            {chat?.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap wrap-break-words">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {sendMessage.isPending && <Loader />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex gap-2 border-t p-3">
          <Textarea
            placeholder="Ask about your tasks..."
            className="max-h-[120px] min-h-10 resize-none overflow-y-auto"
            maxLength={1000}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={sendMessage.isPending || syncEmbeddings.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0"
            onClick={handleSubmit}
            disabled={
              !inputMessage.trim() ||
              sendMessage.isPending ||
              syncEmbeddings.isPending
            }
          >
            {sendMessage.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <div className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <div className="bg-primary size-2 animate-bounce rounded-full" />
        </div>
      </div>
    </div>
  );
}