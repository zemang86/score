// Answer checker utility for short answer questions
import { OpenAI } from "openai";

/**
 * Normalizes text by removing punctuation, converting to lowercase, and standardizing whitespace
 * @param {string} text - The text to normalize
 * @returns {string} - Normalized text
 */
export function normalize(text) {
  if (!text) return "";
  return text.trim().toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
}

/**
 * Calculates Levenshtein distance between two strings for fuzzy matching
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - The edit distance between the strings
 */
export function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Main function to check if a student's short answer is correct
 * Uses a three-step approach: exact match, fuzzy match, and AI-based checking
 * 
 * @param {string} studentAnswer - The student's answer to check
 * @param {string} correctAnswer - The correct answer to compare against
 * @param {Object} options - Optional configuration
 * @param {number} options.fuzzyThreshold - Maximum Levenshtein distance for fuzzy matching (default: 2)
 * @param {string} options.openaiApiKey - OpenAI API key (required for AI checking)
 * @param {string} options.openaiModel - OpenAI model to use (default: "gpt-4o-mini")
 * @returns {Promise<Object>} - Result object with { result, method, reason }
 */
export async function checkShortAnswer(studentAnswer, correctAnswer, options = {}) {
  // Default options
  const {
    fuzzyThreshold = 2,
    openaiApiKey = process.env.OPENAI_API_KEY,
    openaiModel = "gpt-4o-mini"
  } = options;

  // Validate inputs
  if (!studentAnswer || !correctAnswer) {
    return { 
      result: "incorrect", 
      method: "validation", 
      reason: "Missing student answer or correct answer" 
    };
  }

  // Step 1: Exact match (case-insensitive, punctuation-insensitive)
  const normStudent = normalize(studentAnswer);
  const normCorrect = normalize(correctAnswer);

  if (normStudent === normCorrect) {
    return { 
      result: "correct", 
      method: "exact",
      reason: "Exact match after normalization" 
    };
  }

  // Step 2: Fuzzy match using Levenshtein distance
  const distance = levenshtein(normStudent, normCorrect);
  if (distance <= fuzzyThreshold) {
    return { 
      result: "correct", 
      method: "fuzzy",
      reason: `Fuzzy match with distance ${distance}` 
    };
  }

  // Step 3: AI-based checking (only if API key is provided)
  if (!openaiApiKey) {
    return { 
      result: "unknown", 
      method: "none",
      reason: "Cannot perform AI check without API key" 
    };
  }

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const prompt = `
You are an automated answer checker for a student quiz.
The correct answer is: "${correctAnswer}"
The student's answer is: "${studentAnswer}"

If the student's answer means the same thing as the correct answer, even with small spelling errors or synonyms, mark it as correct.
Otherwise, mark as incorrect.

Return only "correct" or "incorrect" and a one-sentence reason.
`;

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: "You are an expert quiz answer checker." },
        { role: "user", content: prompt }
      ],
      max_tokens: 50,
      temperature: 0,
    });

    // Parse the AI output
    const text = completion.choices[0].message.content.toLowerCase();
    const isCorrect = text.includes("correct");
    
    // Extract reason (everything after the first space)
    const reason = text.includes(" ") ? text.substring(text.indexOf(" ") + 1) : text;

    return { 
      result: isCorrect ? "correct" : "incorrect", 
      method: "ai", 
      reason 
    };
  } catch (error) {
    console.error("Error during AI check:", error);
    return { 
      result: "unknown", 
      method: "error",
      reason: `AI check failed: ${error.message}` 
    };
  }
}

/**
 * Example usage:
 * 
 * // With environment variable OPENAI_API_KEY set
 * const result = await checkShortAnswer("fotosintesis", "Photosynthesis");
 * console.log(result);
 * 
 * // With explicit API key
 * const result = await checkShortAnswer("fotosintesis", "Photosynthesis", {
 *   openaiApiKey: "your-api-key-here"
 * });
 * console.log(result);
 */