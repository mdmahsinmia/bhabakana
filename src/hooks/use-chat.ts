'use client';

import { useContext } from 'react';
import { ChatContext, type ChatContextProps } from '@/contexts/chat-provider';

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
