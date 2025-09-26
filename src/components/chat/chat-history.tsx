'use client';

import { useChat } from '@/hooks/use-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { MessageSquare, Trash2 } from 'lucide-react';

export function ChatHistory() {
  const { conversations, currentConversation, setCurrentConversationId, deleteConversation } = useChat();

  if (!conversations.length) {
    return (
      <div className="mt-4 flex flex-col gap-2 p-4 text-center text-sm text-muted-foreground">
        <p>No chat history yet.</p>
        <p>Start a new conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full flex-1 px-2">
      <SidebarMenu className="py-4">
        {conversations.map(conversation => (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton
              isActive={currentConversation?.id === conversation.id}
              onClick={() => setCurrentConversationId(conversation.id)}
              tooltip={conversation.title}
            >
              <MessageSquare />
              <span>{conversation.title}</span>
            </SidebarMenuButton>
            <SidebarMenuAction
              aria-label="Delete conversation"
              onClick={e => {
                e.stopPropagation();
                deleteConversation(conversation.id);
              }}
              showOnHover
            >
              <Trash2 />
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </ScrollArea>
  );
}
