const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

/**
 * Build the coaching prompt from task and user speech
 */
function buildPrompt(taskPrompt, userSpeech) {
  return `You are a friendly English speaking coach. The student was given this task: "${taskPrompt}". They said: "${userSpeech}".

Please respond with EXACTLY this format (keep the labels on separate lines):

CORRECTION: (fix any grammar mistakes, or write "No corrections needed" if the speech is perfect)
EXPLANATION: (briefly explain what was wrong and why, or write "Great job! Your sentence was grammatically correct." if no errors)
BETTER SENTENCE: (give a more natural, fluent version of what they said)
AI REPLY: (give a natural, friendly English reply as if you are the other person in the conversation, to keep the conversation going naturally)

Keep the tone encouraging, warm, and simple. If the speech was good, celebrate it and still give a better sentence with richer vocabulary.`;
}

/**
 * Parse the structured Gemini response into sections
 */
function parseGeminiResponse(text) {
  const sections = {
    correction: '',
    explanation: '',
    betterSentence: '',
    aiReply: '',
    raw: text,
  };

  const patterns = {
    correction: /CORRECTION:\s*([\s\S]*?)(?=EXPLANATION:|$)/i,
    explanation: /EXPLANATION:\s*([\s\S]*?)(?=BETTER SENTENCE:|$)/i,
    betterSentence: /BETTER SENTENCE:\s*([\s\S]*?)(?=AI REPLY:|$)/i,
    aiReply: /AI REPLY:\s*([\s\S]*?)$/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      sections[key] = match[1]
        .trim()
        .replace(/^\(|\)$/g, '')
        .trim();
    }
  }

  return sections;
}

async function callGemini(prompt, customConfig = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
      ...customConfig,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) throw new Error('Invalid request to AI. Please try again.');
    if (response.status === 403) throw new Error('Invalid Gemini API key. Please check your configuration.');
    if (response.status === 429) throw new Error('AI rate limit reached. Please wait a moment and try again.');
    throw new Error(errorData?.error?.message || 'AI is unavailable right now. Please try again.');
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) throw new Error('No response from AI.');
  const candidate = data.candidates[0];
  if (candidate.finishReason === 'SAFETY') throw new Error('Your message was flagged. Please rephrase and try again.');
  const text = candidate.content?.parts?.[0]?.text;
  if (!text) throw new Error('AI returned an empty response.');
  
  return text;
}

/**
 * Call the Gemini API and return parsed feedback for Conversation
 */
export async function getAIFeedback(taskPrompt, userSpeech) {
  const prompt = buildPrompt(taskPrompt, userSpeech);
  const text = await callGemini(prompt);
  return parseGeminiResponse(text);
}

// ─── LEARNING HUB FUNCTIONS ──────────────────────────────────────────

export async function getSentenceFeedback(scrambled, studentAnswer, correctAnswer) {
  const prompt = `The student was given this scrambled sentence: "${scrambled}"
They arranged it as: "${studentAnswer}"
The correct answer is: "${correctAnswer}"

If correct: Explain the sentence structure (subject, verb, object, adverb etc.) in simple terms. Give 2 more similar example sentences.
If wrong: Tell them which words are in the wrong place and why. Give a hint without giving the full answer.
Keep explanation under 4 sentences. Be encouraging.`;
  return await callGemini(prompt);
}

export async function getGrammarFeedback(questionSentence, options, correctIdx, studentChoiceIdx) {
  const prompt = `Grammar question: "${questionSentence}"
Options given: A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}
Correct answer: ${options[correctIdx]}
Student chose: ${options[studentChoiceIdx]}

Explain in simple English:
1. Why the correct answer is right (grammar rule name + explanation)
2. Why each wrong option is incorrect (one line each)
3. Give one more example sentence using the same grammar rule

Keep it simple, max 6 lines total.`;
  return await callGemini(prompt);
}

export async function getVocabMatchFeedback(words) {
  const prompt = `Give me exactly ONE simple example sentence for each of these words: ${words}.
Keep sentences short and easy to understand for an English learner.
Format as a bulleted list.`;
  return await callGemini(prompt);
}

export async function getWordOfTheDay(level) {
  const prompt = `Generate a Word of the Day for an English learner at ${level} level.
Return ONLY this JSON format, no markdown tags:
{
  "word": "",
  "pronunciation": "",
  "partOfSpeech": "",
  "definition": "",
  "examples": ["", "", ""],
  "speakingChallenge": "Use this word in a sentence about your day"
}`;
  const text = await callGemini(prompt, { temperature: 0.9 });
  try {
    return JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
  } catch(e) {
    throw new Error('Failed to parse Word of the Day');
  }
}

export async function getWordUsageFeedback(word, userSpeech) {
  const prompt = `The target word is "${word}".
The student said: "${userSpeech}".
Did they use the word correctly in context? If so, praise them. If not, explain why and give an example. Keep it under 3 sentences.`;
  return await callGemini(prompt);
}

/**
 * Save session to Firestore
 */
export async function buildSessionData(taskTitle, taskId, exchanges, corrections) {
  return {
    taskTitle,
    taskId,
    date: new Date().toISOString(),
    exchanges,
    corrections,
    exchangeCount: exchanges.length,
    correctionCount: corrections.filter(
      (c) => c.correction && !c.correction.toLowerCase().includes('no correction')
    ).length,
  };
}
