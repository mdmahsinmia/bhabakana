'use server';

/**
 * @fileOverview Generates a short summary of a long AI response for easy sharing when copying to clipboard.
 *
 * - generateSummary - A function that takes a long text and generates a concise summary.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSummaryInputSchema = z.object({
  text: z
    .string()
    .describe('The long text content that needs to be summarized.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the input text.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'summaryPrompt',
  input: { schema: GenerateSummaryInputSchema },
  output: { schema: GenerateSummaryOutputSchema },
  prompt: `Summarize the following text in a concise manner, highlighting the key takeaways:\n\n{{{text}}}`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const { output } = await summaryPrompt(input);
    return output!;
  }
);
