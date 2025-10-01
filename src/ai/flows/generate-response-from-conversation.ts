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
import { analyzeBanglaSentiment } from '@/services/nlp/bangla-sentiment';

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

// Remove the prompt definition
// const prompt = ai.definePrompt({...});

const generateResponseFromConversationFlow = ai.defineFlow(
  {
    name: 'generateResponseFromConversationFlow',
    inputSchema: GenerateResponseFromConversationInputSchema,
    outputSchema: GenerateResponseFromConversationOutputSchema,
  },
  async (input) => {
    // Manually format the conversation history
    // Get the latest user message for sentiment analysis
    const latestUserMessage = input.conversationHistory
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';

    const sentiment = analyzeBanglaSentiment(latestUserMessage);
    let sentimentContext = '';
    if (sentiment.sentiment === 'positive') {
      sentimentContext = 'The user seems positive and enthusiastic. Respond in a warm, engaging manner.';
    } else if (sentiment.sentiment === 'negative') {
      sentimentContext = 'The user seems concerned or negative. Respond empathetically and helpfully.';
    } else {
      sentimentContext = 'The user is neutral. Provide a standard helpful response.';
    }

    const formattedHistory = input.conversationHistory.map(msg =>
      ` ${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const promptText = `You are a helpful assistant. ${sentimentContext} Generate a response based on the following conversation history:\n\n${formattedHistory}\n\nAssistant: `;

    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: promptText,
    }, {
      outputSchema: GenerateResponseFromConversationOutputSchema,
    });

    return { response: result.response || result.text };
  }
);
