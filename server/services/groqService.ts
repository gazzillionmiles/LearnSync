import { Groq } from 'groq-sdk';
import { Feedback } from '../../shared/types';

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function evaluatePromptWithGroq(
  userPrompt: string,
  problemDescription: string,
  expectedPrompt: string,
  modelAnswer?: string
): Promise<{
  score: number;
  suggestions: string[];
  semanticSimilarity: number;
  sceneGenerated: boolean;
}> {
  if (!groq) {
    throw new Error('Groq client is not initialized. Please check your GROQ_API_KEY environment variable.');
  }

  try {
    // System prompt to guide the AI on how to evaluate
    const systemPrompt = `You are an expert in 3D scene generation and prompt engineering evaluation. 
Your task is to evaluate a user's prompt for creating 3D scenes based on these criteria:
1. 3D Scene Clarity: How clearly does the prompt specify geometric shapes, materials, and spatial relationships?
2. Technical Accuracy: Does it include proper 3D terminology (geometry, materials, lighting, animation)?
3. Visual Completeness: Are lighting, colors, and visual properties well-defined?
4. Animation & Effects: If applicable, are motion and particle effects clearly described?
5. Semantic Similarity: How closely does the intent match the expected outcome?

Rate the prompt on a scale of 1-10 and provide semantic similarity (0-1), scene generation feasibility (true/false), and 2-3 specific suggestions.
Respond in valid JSON format with fields: "score" (1-10), "semanticSimilarity" (0-1), "sceneGenerated" (boolean), "suggestions" (array of strings).`;

    // User message with the context and the prompt to evaluate
    const userMessage = `Problem: ${problemDescription}

Example prompt: ${expectedPrompt}
${modelAnswer ? `Model answer: ${modelAnswer}` : ''}

User's prompt: ${userPrompt}

Evaluate this prompt and provide a score (1-10) and 2-3 specific suggestions for improvement in JSON format.`;

    // Making the API call to Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    const content = response.choices[0].message.content;
    console.log('Groq API response:', content);

    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    // Parse the response JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Groq API');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    if (typeof parsedResponse.score !== 'number' || !Array.isArray(parsedResponse.suggestions)) {
      throw new Error('Invalid feedback format from Groq API');
    }

    return {
      score: parsedResponse.score,
      suggestions: parsedResponse.suggestions,
      semanticSimilarity: parsedResponse.semanticSimilarity || 0.5,
      sceneGenerated: parsedResponse.sceneGenerated || false
    };

  } catch (error) {
    console.error('Error in Groq evaluation:', error);
    throw error; // Let the caller handle the error
  }
}

// Fallback evaluation function if the API call fails
function generateFallbackFeedback(userPrompt: string, problemDescription: string, expectedPrompt: string): Feedback {
  // Simple evaluation based on prompt length and keyword matching
  const promptLength = userPrompt.length;
  const hasProblemKeywords = checkKeywordMatch(userPrompt, problemDescription);
  const hasExamplePattern = checkPatternMatch(userPrompt, expectedPrompt);

  let score = 0;
  const suggestions: string[] = [];

  // Basic length check
  if (promptLength < 20) {
    score = 3;
    suggestions.push("Your prompt is too short. Consider adding more specific instructions.");
  } else if (promptLength < 50) {
    score = 5;
    suggestions.push("Your prompt could be more detailed to get better results.");
  } else {
    score = 7;
  }

  // Keyword matching improves score
  if (hasProblemKeywords) {
    score += 1;
  } else {
    suggestions.push("Try including more specific terms related to the exercise problem.");
  }

  // Pattern matching from example improves score
  if (hasExamplePattern) {
    score += 2;
  } else {
    suggestions.push("Your prompt could benefit from following the pattern shown in the example.");
  }

  // Cap score at 10
  score = Math.min(score, 10);

  // For high scores, add positive feedback
  if (score >= 8 && suggestions.length < 3) {
    suggestions.push("Great job! Your prompt is clear and well-structured.");
  }

  // Add a note that this is fallback evaluation
  suggestions.push("Note: This is a simplified evaluation. Try again later for AI-powered feedback.");

  return {
    score,
    suggestions
  };
}

// Helper function to check for keyword matches
function checkKeywordMatch(userPrompt: string, problemDescription: string): boolean {
  const promptLower = userPrompt.toLowerCase();
  const problemWords = problemDescription.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 5) // Only consider significant words
    .slice(0, 5); // Take up to 5 significant words

  return problemWords.some(word => promptLower.includes(word));
}

// Helper function to check for pattern matches
function checkPatternMatch(userPrompt: string, expectedPrompt: string): boolean {
  const promptStructure = getTextStructure(userPrompt);
  const exampleStructure = getTextStructure(expectedPrompt);

  return promptStructure.some(s => exampleStructure.includes(s));
}

// Helper to identify text structure patterns
function getTextStructure(text: string): string[] {
  const patterns: string[] = [];

  // Check for numbered list
  if (/\d+\.\s/.test(text)) {
    patterns.push("numbered-list");
  }

  // Check for bullet points
  if (/•|\*|-\s/.test(text)) {
    patterns.push("bullet-points");
  }

  // Check for sections/headings
  if (/[A-Z][^.!?]*:/.test(text)) {
    patterns.push("section-headers");
  }

  // Check for question format
  if (/\?/.test(text)) {
    patterns.push("questions");
  }

  // Check for command/instruction format
  if (/^(write|create|generate|list|explain|analyze)/i.test(text)) {
    patterns.push("command");
  }

  return patterns.length ? patterns : ["plain-text"];
}