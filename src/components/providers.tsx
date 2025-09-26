'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/theme-provider';
import { ChatProvider } from '@/contexts/chat-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delayDuration={0}>
        <ChatProvider>{children}</ChatProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
