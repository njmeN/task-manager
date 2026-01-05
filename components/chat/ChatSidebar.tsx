"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  Loader2,
  Trash,
} from "lucide-react";
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

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: any[] | undefined;
  chatsLoading: boolean;
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export function ChatSidebar({
  isOpen,
  onClose,
  chats,
  chatsLoading,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "border-r flex flex-col bg-card z-10",
        "absolute inset-0 md:relative md:inset-auto",
        "w-full md:w-[250px]",
        "rounded-lg md:rounded-none md:rounded-l-lg"
      )}
    >
      <div className="bg-primary text-primary-foreground flex items-center justify-between rounded-t-lg md:rounded-tl-lg md:rounded-tr-none border-b p-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} />
          <h3 className="font-medium">Chats</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary/90 h-8 w-8"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div className="p-2">
        <Button
          onClick={onNewChat}
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
                onClick={() => onSelectChat(c.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent",
                  currentChatId === c.id && "bg-accent"
                )}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "h-7 w-7 transition-opacity cursor-pointer shrink-0",
                        "opacity-40 group-hover:opacity-100"
                      )}
                    >
                      <Trash className="size-3 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this chat? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id);
                        }}
                        className="text-secondary bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex-1 truncate min-w-0">
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
  );
}