'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Message } from './message';
import { TypingIndicator } from './typing-indicator';

export function ChatMessages() {
  const { currentConversation, isLoading } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentConversation?.messages, isLoading]);

  return (
    <div ref={scrollAreaRef} className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
        {currentConversation?.messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </div>
  );
}
