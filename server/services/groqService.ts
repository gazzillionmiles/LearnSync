
import { Groq } from 'groq-sdk';
import { Feedback } from '../../shared/types';

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function evaluatePromptWithGroq(
  userPrompt: string,
  problem: string,
  example: string,
  modelAnswer?: string
): Promise<Feedback> {
  try {
    // System prompt to guide the AI on how to evaluate
    const systemPrompt = `You are an expert in prompt engineering evaluation. 
Your task is to evaluate a user's prompt engineering attempt based on the following criteria:
1. Clarity and specificity of instructions
2. Alignment with the given problem
3. Effectiveness of structure and formatting
4. Inclusion of necessary constraints and parameters
5. Overall quality compared to the example

Rate the prompt on a scale of 1-10 and provide 2-3 specific, constructive suggestions for improvement.
Respond in valid JSON format with two fields: "score" (number between 1-10) and "suggestions" (array of strings).`;

    // User message with the context and the prompt to evaluate
    const userMessage = `Problem: ${problem}
    
Example prompt: ${example}
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
    
    try {
      // Parse the response JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        return {
          score: parsedResponse.score || 5,
          suggestions: parsedResponse.suggestions || ["Groq API couldn't provide specific suggestions."]
        };
      }
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError);
    }
    
    // Fallback if we couldn't parse JSON from the response
    return generateFallbackFeedback(userPrompt, problem, example);
    
  } catch (error) {
    console.error('Error calling Groq API:', error);
    
    // Fallback to the basic evaluation if the API call fails
    return generateFallbackFeedback(userPrompt, problem, example);
  }
}

// Fallback evaluation function if the API call fails
function generateFallbackFeedback(userPrompt: string, problem: string, example: string): Feedback {
  // Simple evaluation based on prompt length and keyword matching
  const promptLength = userPrompt.length;
  const hasProblemKeywords = checkKeywordMatch(userPrompt, problem);
  const hasExamplePattern = checkPatternMatch(userPrompt, example);
  
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
function checkKeywordMatch(userPrompt: string, problem: string): boolean {
  const promptLower = userPrompt.toLowerCase();
  const problemWords = problem.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 5) // Only consider significant words
    .slice(0, 5); // Take up to 5 significant words
  
  return problemWords.some(word => promptLower.includes(word));
}

// Helper function to check for pattern matches
function checkPatternMatch(userPrompt: string, example: string): boolean {
  const promptStructure = getTextStructure(userPrompt);
  const exampleStructure = getTextStructure(example);
  
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
