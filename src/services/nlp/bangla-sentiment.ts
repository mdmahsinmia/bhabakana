// Client-side compatible async loading of word lists from public/
let positiveWordsSet: Set<string> | null = null;
let negativeWordsSet: Set<string> | null = null;

async function loadWordLists(): Promise<void> {
  // Cache to avoid repeated fetches
  if (positiveWordsSet && negativeWordsSet) return;

  try {
    const [positiveRes, negativeRes] = await Promise.all([
      fetch('/positive_words.txt'),
      fetch('/negative_words.txt')
    ]);

    if (!positiveRes.ok) {
      throw new Error(`Failed to load positive words: ${positiveRes.statusText}`);
    }
    if (!negativeRes.ok) {
      throw new Error(`Failed to load negative words: ${negativeRes.statusText}`);
    }

    const positiveText = await positiveRes.text();
    const negativeText = await negativeRes.text();

    positiveWordsSet = new Set();
    negativeWordsSet = new Set();

    const loadSet = (text: string, set: Set<string>) => {
      text.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
          set.add(trimmed.toLowerCase());
        }
      });
    };

    loadSet(positiveText, positiveWordsSet);
    loadSet(negativeText, negativeWordsSet);
  } catch (error) {
    console.error('Failed to load word lists:', error);
    // Fallback to empty sets
    positiveWordsSet = new Set();
    negativeWordsSet = new Set();
  }
}

// Simple tokenizer (split by spaces and punctuation)
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export async function analyzeBanglaSentiment(text: string): Promise<SentimentResult> {
  await loadWordLists();

  if (!positiveWordsSet || !negativeWordsSet) {
    return { sentiment: 'neutral', score: 0 };
  }

  const tokens = tokenize(text);
  let posScore = 0;
  let negScore = 0;

  tokens.forEach(token => {
    if (positiveWordsSet.has(token)) {
      posScore += 1;
    } else if (negativeWordsSet.has(token)) {
      negScore += 1;
    }
  });

  const total = posScore + negScore;
  const score = total > 0 ? (posScore - negScore) / total : 0;

  if (score > 0.1) {
    return { sentiment: 'positive', score };
  } else if (score < -0.1) {
    return { sentiment: 'negative', score };
  } else {
    return { sentiment: 'neutral', score };
  }
}