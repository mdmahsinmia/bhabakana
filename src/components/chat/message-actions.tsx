'use client';

import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { generateSummary } from '@/ai/flows/copy-to-clipboard-with-summary';

interface MessageActionsProps {
  content: string;
}

export function MessageActions({ content }: MessageActionsProps) {
  const { regenerateResponse } = useChat();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const onCopy = async () => {
    setIsCopying(true);
    try {
      let textToCopy = content;
      if (content.length > 200) { // Only summarize longer texts
        const { summary } = await generateSummary({ text: content });
        textToCopy = `Summary:\n${summary}\n\nFull Response:\n${content}`;
      }
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    } finally {
        setIsCopying(false);
    }
  };

  return (
    <div className="absolute -bottom-2 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onCopy}
        disabled={isCopying}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">Copy message</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => regenerateResponse()}
      >
        <RefreshCw className="h-4 w-4" />
        <span className="sr-only">Regenerate response</span>
      </Button>
    </div>
  );
}
