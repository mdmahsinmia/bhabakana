'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  );
}
