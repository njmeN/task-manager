"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Expand,
  Minimize,
  Send,
  Trash,
  X,
  Loader2,
  MessageSquare,
  Plus,
  Menu,
  ChevronLeft,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AIChatButton() {
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();

  return (
    <>
      <Button onClick={() => setChatOpen(true)} variant="outline">
        <Bot />
        <span>Ask AI</span>
      </Button>
      <AIChatBox
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        chatId={currentChatId}
        onChatIdChange={setCurrentChatId}
      />
    </>
  );
}

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
  chatId?: string;
  onChatIdChange: (chatId: string | undefined) => void;
}

function AIChatBox({ open, onClose, chatId, onChatIdChange }: AIChatBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
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
  };

  const handleDeleteChat = (id: string) => {
    deleteChat.mutate(id, {
      onSuccess: () => {
        if (chatId === id) {
          onChatIdChange(undefined);
        }
        toast.success("Chat deleted");
        setDeletingChatId(null);
      },
      onError: (error) => {
        toast.error("Failed to delete chat: " + error.message);
        setDeletingChatId(null);
      },
    });
  };

  if (!open) return null;

  const chatWidth = isExpanded ? "w-[550px]" : "w-80 sm:w-96";
  const totalWidth = sidebarOpen
    ? isExpanded
      ? "w-[800px]"
      : "w-[550px]"
    : chatWidth;

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-10 bg-card fixed right-4 bottom-4 z-50 flex rounded-lg border shadow-lg duration-300 2xl:right-16",
        isExpanded ? "h-[650px] max-h-[90vh]" : "h-[500px] max-h-[80vh]",
        totalWidth
      )}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="border-r flex flex-col w-[250px]">
          <div className="bg-primary text-primary-foreground flex items-center justify-between rounded-tl-lg border-b p-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <h3 className="font-medium">Chats</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          <div className="p-2">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start"
              variant="outline"
              size="sm"
            >
              <Plus className="size-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
            {chatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="space-y-1 pb-2">
                {chats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onChatIdChange(c.id)}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent",
                      chatId === c.id && "bg-accent"
                    )}
                  >
                    <div className="flex-1 truncate">
                      <p className="truncate font-medium">
                        {c.title || "Untitled Chat"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity cursor-pointer"
                        >
                          <Trash className="size-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this chat? This
                            action cannot be undone and all messages will be
                            permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(c.id);
                            }}
                            className="text-secondary bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <MessageSquare className="size-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No chats yet. Start a conversation!
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-primary text-primary-foreground flex items-center justify-between border-b p-3 rounded-tr-lg">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              >
                <Menu className="size-4" />
              </Button>
            )}
            <Bot size={18} />
            <h3 className="font-medium">Task Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
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
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize /> : <Expand />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
              title="New chat"
            >
              <Plus />
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

        {/* Chat Messages - با overflow-y-auto */}
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
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
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

        <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
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
        </form>
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