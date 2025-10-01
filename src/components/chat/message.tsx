'use client';

import type { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { MessageActions } from './message-actions';
import { useEffect, useState } from 'react';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');

  useEffect(() => {
    if (message.role === 'assistant') {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedContent(message.content.substring(0, index + 1));
        index++;
        if (index > message.content.length) {
          clearInterval(interval);
        }
      }, 10); // Adjust for desired streaming speed
      return () => clearInterval(interval);
    }
  }, [message.content, message.role]);

  return (
    <div
      className={cn(
        'group flex items-start gap-4 smooth-transition',
        isUser && 'flex-row-reverse'
      )}
    >
      <Avatar
        className={cn(
          'h-8 w-8 shrink-0',
          isUser ? 'border-primary' : 'border-accent'
        )}
      >
        <AvatarFallback>
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'relative max-w-[80%] space-y-1 rounded-lg px-4 py-2.5 backdrop-blur-sm glass glass-dark smooth-transition',
          isUser
            ? 'rounded-br-none text-primary-foreground'
            : 'rounded-bl-none'
        )}
      >
        <div className="prose prose-sm whitespace-pre-wrap font-body text-sm leading-relaxed text-inherit">
          {displayedContent}
        </div>
        {!isUser && <MessageActions content={message.content} />}
      </div>
    </div>
  );
}
