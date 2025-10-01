'use client';

import type { ReactNode } from 'react';
import React, { createContext, useCallback, useMemo } from 'react';
import type { Conversation, Message } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { analyzeBanglaSentiment } from '@/services/nlp/bangla-sentiment';
import { banglaPatterns } from '@/services/nlp/bangla-patterns';
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
      let assistantContent = '';

      // Random delay 1-2 seconds for natural flow before any response generation
      const delay = Math.random() * 1000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check for specific Bangla patterns (exclude fallback)
      const specificMatch = banglaPatterns.find(rule => rule.type !== 'fallback' && rule.pattern.test(content));

      if (specificMatch) {
        // Select random response from matching rule
        assistantContent = specificMatch.responses[Math.floor(Math.random() * specificMatch.responses.length)];
      } else {
          // Fall back to local NLP sentiment analysis
          try {
            const sentimentResult = await analyzeBanglaSentiment(content);
            const sentimentResponses = {
              positive: [
                'আপনার কথা শুনে খুব ভালো লাগল! আরও কিছু বলুন।',
                'আপনার ইতিবাচক মনোভাব আমাকে উৎসাহিত করে। ধন্যবাদ!',
                'চমৎকার! আপনার মতামত আমার কাছে মূল্যবান।'
              ],
              negative: [
                'দুঃখিত যে আপনার এমন অনুভূতি হচ্ছে। আমি সাহায্য করতে চাই।',
                'আপনার কথা শুনে দুঃখ লাগল। কিভাবে উন্নত করতে পারি?',
                'আমি আপনার পাশে আছি। আরও বিস্তারিত বলুন।'
              ],
              neutral: [
                'আমি আপনার কথা শুনছি। আরও বিস্তারিত বলুন।',
                'আপনার বক্তব্য বুঝতে চেষ্টা করছি। কোনো নির্দিষ্ট প্রশ্ন আছে?',
                'আমি এখানে আছি আপনাকে সাহায্য করার জন্য।'
              ]
            };
            const responses = sentimentResponses[sentimentResult.sentiment] || sentimentResponses.neutral;
            assistantContent = responses[Math.floor(Math.random() * responses.length)];
          } catch (error) {
            console.error('Error in sentiment analysis:', error);
            assistantContent = 'আমি আপনার কথা শুনছি। আরও বিস্তারিত বলুন।'; // Default neutral response
          }
        }
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
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
  
      setIsLoading(true);
      
      // Get updated conversations after removing last assistant response
      let updatedConversations = conversations.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: c.messages.filter(m => m.role === 'user' || (m.role === 'assistant' && c.messages[c.messages.length - 1].id !== m.id)) }
          : c
      );
      setConversations(updatedConversations);
  
      const historyWithoutLastResponse = updatedConversations.find(c => c.id === currentConversationId)?.messages || [];
      const lastUserMessage = historyWithoutLastResponse[historyWithoutLastResponse.length - 1];
      const content = lastUserMessage ? lastUserMessage.content : '';
  
      if (!content) {
        setIsLoading(false);
        return;
      }
  
      try {
        // Random delay 1-2 seconds for natural flow
        const delay = Math.random() * 1000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        const sentimentResult = await analyzeBanglaSentiment(content);
        const sentimentResponses = {
          positive: [
            'আপনার কথা শুনে খুব ভালো লাগল! আরও কিছু বলুন।',
            'আপনার ইতিবাচক মনোভাব আমাকে উৎসাহিত করে। ধন্যবাদ!',
            'চমৎকার! আপনার মতামত আমার কাছে মূল্যবান।'
          ],
          negative: [
            'দুঃখিত যে আপনার এমন অনুভূতি হচ্ছে। আমি সাহায্য করতে চাই।',
            'আপনার কথা শুনে দুঃখ লাগল। কিভাবে উন্নত করতে পারি?',
            'আমি আপনার পাশে আছি। আরও বিস্তারিত বলুন।'
          ],
          neutral: [
            'আমি আপনার কথা শুনছি। আরও বিস্তারিত বলুন।',
            'আপনার বক্তব্য বুঝতে চেষ্টা করছি। কোনো নির্দিষ্ট প্রশ্ন আছে?',
            'আমি এখানে আছি আপনাকে সাহায্য করার জন্য।'
          ]
        };
        const responses = sentimentResponses[sentimentResult.sentiment] || sentimentResponses.neutral;
        const regeneratedResponse = responses[Math.floor(Math.random() * responses.length)];

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: regeneratedResponse,
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
        console.error('Error regenerating response:', error);
        toast({
          title: 'Error regenerating response',
          description: 'An error occurred. Please try again.',
          variant: 'destructive',
        });
        const fallbackResponse = 'আমি আপনার কথা শুনছি। আরও বিস্তারিত বলুন।';
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fallbackResponse,
          createdAt: new Date().toISOString(),
        };
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: [...historyWithoutLastResponse, assistantMessage] }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    }, [currentConversation, isLoading, currentConversationId, setConversations, conversations, toast]);

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
