'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8 shrink-0 border-accent">
        <AvatarFallback>
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] space-y-1 rounded-lg rounded-bl-none bg-card px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.3s]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
