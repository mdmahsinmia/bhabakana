'use server';
/**
 * @fileOverview An AI agent that generates coherent and contextually relevant AI responses based on the previous turns of the conversation.
 *
 * - generateResponseFromConversation - A function that handles the AI response generation process.
 * - GenerateResponseFromConversationInput - The input type for the generateResponseFromConversation function.
 * - GenerateResponseFromConversationOutput - The return type for the generateResponseFromConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseFromConversationInputSchema = z.object({
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation, including the roles and content of each message.'),
});
export type GenerateResponseFromConversationInput = z.infer<
  typeof GenerateResponseFromConversationInputSchema
>;

const GenerateResponseFromConversationOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type GenerateResponseFromConversationOutput = z.infer<
  typeof GenerateResponseFromConversationOutputSchema
>;

export async function generateResponseFromConversation(
  input: GenerateResponseFromConversationInput
): Promise<GenerateResponseFromConversationOutput> {
  return generateResponseFromConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponseFromConversationPrompt',
  input: {schema: GenerateResponseFromConversationInputSchema},
  output: {schema: GenerateResponseFromConversationOutputSchema},
  prompt: `You are a helpful assistant. Generate a response based on the following conversation history:

  {{#each conversationHistory}}
  {{#if (eq role \"user\")}}User: {{content}}{{/if}}
  {{#if (eq role \"assistant\")}}Assistant: {{content}}{{/if}}
  {{/each}}

  Assistant: `,
});

const generateResponseFromConversationFlow = ai.defineFlow(
  {
    name: 'generateResponseFromConversationFlow',
    inputSchema: GenerateResponseFromConversationInputSchema,
    outputSchema: GenerateResponseFromConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
