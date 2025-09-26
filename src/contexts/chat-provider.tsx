'use client';

import type { ReactNode } from 'react';
import React, { createContext, useCallback, useMemo } from 'react';
import type { Conversation, Message } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateResponseFromConversation } from '@/ai/flows/generate-response-from-conversation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export interface ChatContextProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  addMessage: (content: string) => Promise<void>;
  setCurrentConversationId: (id: string | null) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  clearConversations: () => void;
  regenerateResponse: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextProps | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('currentConversationId', null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const currentConversation = useMemo(() => {
    return conversations.find(c => c.id === currentConversationId) ?? null;
  }, [conversations, currentConversationId]);

  const createNewConversation = useCallback(() => {
    const newConversationId = uuidv4();
    setCurrentConversationId(newConversationId);
  }, [setCurrentConversationId]);

  const addMessage = useCallback(async (content: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setIsLoading(true);

    // optimistic update
    setConversations(prev => {
      // If there is no current conversation, create a new one
      if (!currentConversationId || !prev.find(c => c.id === currentConversationId)) {
        const newId = currentConversationId || uuidv4();
        if(!currentConversationId) setCurrentConversationId(newId);
        return [
          ...prev,
          {
            id: newId,
            title: content.substring(0, 30),
            messages: [userMessage],
            createdAt: new Date().toISOString(),
          },
        ];
      }
      // Otherwise, add the message to the existing conversation
      return prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      );
    });

    try {
      const currentHistory = conversations.find(c => c.id === currentConversationId)?.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })) || [];
      const { response } = await generateResponseFromConversation({
        conversationHistory: [...currentHistory, { role: 'user', content }],
      });
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        createdAt: new Date().toISOString(),
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c
        )
      );

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error generating response',
        description: 'An error occurred while communicating with the AI. Please try again.',
        variant: 'destructive',
      });
      // revert optimistic update on error
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversationId
            ? { ...c, messages: c.messages.slice(0, -1) }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentConversationId, conversations, setConversations, setCurrentConversationId, toast]);

  const regenerateResponse = useCallback(async () => {
    if (!currentConversation || isLoading) return;

    const userMessages = currentConversation.messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (!lastUserMessage) return;

    setIsLoading(true);
    
    // Remove last assistant response if it exists
    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: c.messages.filter(m => m.role === 'user' || m.id !== c.messages[c.messages.length - 1].id) }
          : c
      )
    );

    try {
        const historyWithoutLastResponse = currentConversation.messages.filter(m => m.role === 'user');
        const conversationHistoryForAI = historyWithoutLastResponse.map(m => ({ role: m.role, content: m.content }));
        
        const { response } = await generateResponseFromConversation({
            conversationHistory: conversationHistoryForAI,
        });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        createdAt: new Date().toISOString(),
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversationId
            ? { ...c, messages: [...historyWithoutLastResponse, assistantMessage] }
            : c
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error regenerating response',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, isLoading, currentConversationId, setConversations, toast]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remainingConversations = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
    }
    toast({ title: 'Conversation deleted' });
  }, [conversations, currentConversationId, setConversations, setCurrentConversationId, toast]);

  const clearConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversationId(null);
    toast({ title: 'All conversations cleared' });
  }, [setConversations, setCurrentConversationId, toast]);

  const contextValue = useMemo(() => ({
    conversations,
    currentConversation,
    isLoading,
    addMessage,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    clearConversations,
    regenerateResponse,
  }), [
    conversations,
    currentConversation,
    isLoading,
    addMessage,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    clearConversations,
    regenerateResponse,
  ]);

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
