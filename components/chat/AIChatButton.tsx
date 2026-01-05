"use client";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useState } from "react";
import { AIChatBox } from "./AIChatBox";

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