"use client";

import { EmptyScreen } from "./empty-screen";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessage, addMessage, updateStreamingMessage, createNewConversation } from "@/store/features/chat/chatSlice";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [useStreaming, setUseStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const currentConversationId = useAppSelector(state => state.chat.currentConversationId);
  const currentConversation = useAppSelector(state => 
    state.chat.conversations.find(conv => conv.id === currentConversationId)
  );
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const messages = currentConversation?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message after conversation creation
  useEffect(() => {
    if (currentConversationId && pendingMessage) {
      const message = pendingMessage;
      setPendingMessage(null);
      
      dispatch(addMessage({
        conversationId: currentConversationId,
        message: { role: "user", content: message }
      }));

      dispatch(sendMessage({
        message,
        sessionId: currentConversationId,
        useStreaming
      })).unwrap()
        .then(result => {
          if (useStreaming && result.streaming) {
            handleStreamingResponse(result.response);
          }
        })
        .catch(error => {
          console.error("Error:", error);
          dispatch(addMessage({
            conversationId: currentConversationId,
            message: {
              role: "assistant",
              content: "Sorry, there was an error processing your request."
            }
          }));
        });
    }
  }, [currentConversationId, pendingMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");

    // Create a new conversation if none exists
    if (!currentConversationId) {
      setPendingMessage(message);
      dispatch(createNewConversation());
      return;
    }

    // Add user message
    dispatch(addMessage({
      conversationId: currentConversationId,
      message: { role: "user", content: message }
    }));

    try {
      const result = await dispatch(sendMessage({
        message,
        sessionId: currentConversationId,
        useStreaming
      })).unwrap();

      if (useStreaming && result.streaming) {
        await handleStreamingResponse(result.response);
      }
    } catch (error) {
      console.error("Error:", error);
      dispatch(addMessage({
        conversationId: currentConversationId,
        message: {
          role: "assistant",
          content: "Sorry, there was an error processing your request."
        }
      }));
    }
  };

  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let assistantMessage = "";
    let messageAdded = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.content) {
              assistantMessage += data.content;

              if (currentConversationId) {
                dispatch(updateStreamingMessage({
                  conversationId: currentConversationId,
                  content: assistantMessage
                }));
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-theme(spacing.14))] flex-1 flex-col dark:glass dark:glass-dark smooth-transition">
      {/* Header */}
      <header className="absolute top-2 right-2">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              className="w-4 h-4"
            />
            Streaming
          </label>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <>
            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </Card>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="bg-muted p-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>
          </>
        ) : (
          <EmptyScreen />
        )}
      </div>

      {/* Input */}
      <footer className="border-t bg-card p-4">
        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center justify-center w-full gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="h-[44px] resize-none pr-12"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
