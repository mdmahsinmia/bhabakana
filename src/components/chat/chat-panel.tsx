'use client';

import { useChat } from '@/hooks/use-chat';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { EmptyScreen } from './empty-screen';

export function ChatPanel() {
  const { currentConversation } = useChat();

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-1 flex-col glass glass-dark smooth-transition">
      <div className="flex-1 overflow-y-auto">
        {currentConversation && currentConversation.messages.length > 0 ? (
          <ChatMessages />
        ) : (
          <EmptyScreen />
        )}
      </div>
      <div className="border-t glass glass-dark p-4 backdrop-blur-sm sm:p-6 smooth-transition">
        <ChatInput />
      </div>
    </div>
  );
}
