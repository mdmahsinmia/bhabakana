'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/hooks/use-chat';
import { Bot } from 'lucide-react';

const examplePrompts = [
  'What is the meaning of life?',
  'Explain quantum computing in simple terms.',
  'Write a short story about a robot who discovers music.',
  'How do I make a perfect omelette?',
];

export function EmptyScreen() {
  const { addMessage } = useChat();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="mx-auto w-full max-w-lg px-4">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-center font-headline text-3xl font-semibold">
            How can I help you today?
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {examplePrompts.map((prompt, i) => (
            <Card
              key={i}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => addMessage(prompt)}
            >
              <CardContent className="p-4">
                <p className="text-sm">{prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
