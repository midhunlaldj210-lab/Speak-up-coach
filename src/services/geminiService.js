// ══════════════════════════════════════════════════════════════
// AI Service — powered by OpenAI (gpt-4o-mini)
// All function signatures are identical to the previous
// geminiService.js so no other files need to change.
// ══════════════════════════════════════════════════════════════

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// ─── Core caller ─────────────────────────────────────────────

async function callAI(prompt, { temperature = 0.7, maxTokens = 1024, systemPrompt = 'You are a helpful AI assistant.' } = {}, retries = 3, delayMs = 1500) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add REACT_APP_OPENAI_API_KEY to Vercel environment variables.');
  }

  const body = {
    model: MODEL,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  };

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate-limited — exponential backoff
        await new Promise(r => setTimeout(r, delayMs));
        return callAI(prompt, { temperature, maxTokens, systemPrompt }, retries - 1, delayMs * 2);
      }
      const err = await response.json().catch(() => ({}));
      if (response.status === 401) throw new Error('Invalid OpenAI API key. Please check your Vercel environment variables.');
      if (response.status === 429) throw new Error('AI rate limit reached. Please wait a moment and try again.');
      if (response.status === 503) throw new Error('OpenAI is temporarily unavailable. Please try again.');
      throw new Error(err?.error?.message || 'AI is unavailable right now. Please try again.');
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('AI returned an empty response.');
    return text.trim();

  } catch (err) {
    if (err.message.includes('API key') || err.message.includes('rate limit') || err.message.includes('unavailable') || err.message.includes('empty')) {
      throw err;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
}

// ─── Response Parser (same format as before) ──────────────────

function parseResponse(text) {
  const sections = { correction: '', explanation: '', betterSentence: '', aiReply: '', raw: text };
  const patterns = {
    correction: /CORRECTION:\s*([\s\S]*?)(?=EXPLANATION:|$)/i,
    explanation: /EXPLANATION:\s*([\s\S]*?)(?=BETTER SENTENCE:|$)/i,
    betterSentence: /BETTER SENTENCE:\s*([\s\S]*?)(?=AI REPLY:|$)/i,
    aiReply: /AI REPLY:\s*([\s\S]*?)$/i,
  };
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) sections[key] = match[1].trim().replace(/^\(|\)$/g, '').trim();
  }
  return sections;
}

// ─── Speaking Coach ────────────────────────────────────────────

function buildPrompt(taskPrompt, userSpeech) {
  return `The student was given this speaking task: "${taskPrompt}". They said: "${userSpeech}".

Please respond with EXACTLY this format (keep the labels on separate lines):

CORRECTION: (fix any grammar mistakes, or write "No corrections needed" if the speech is perfect)
EXPLANATION: (briefly explain what was wrong and why, or write "Great job! Your sentence was grammatically correct." if no errors)
BETTER SENTENCE: (give a more natural, fluent version of what they said)
AI REPLY: (give a natural, friendly English reply as if you are the other person in the conversation, to keep the conversation going naturally)

Keep the tone encouraging, warm, and simple.`;
}

export async function getCoachFeedback(taskPrompt, userSpeech) {
  const prompt = buildPrompt(taskPrompt, userSpeech);
  const text = await callAI(prompt, {
    temperature: 0.7,
    systemPrompt: 'You are a friendly, encouraging English speaking coach for non-native speakers.'
  });
  return parseResponse(text);
}

// Alias used by PracticeScreen
export async function getAIFeedback(taskPrompt, userSpeech) {
  return await getCoachFeedback(taskPrompt, userSpeech);
}

// ─── Sentence Structure ────────────────────────────────────────

export async function getSentenceFeedback(words, userOrder, correctOrder) {
  const prompt = `A student is learning English sentence structure. 
Words available: ${words.join(', ')}
Correct order: "${correctOrder.join(' ')}"
Student's order: "${userOrder.join(' ')}"

In 2-3 short sentences, explain whether they got it right and WHY this sentence structure is correct (subject, verb, object, etc). Be encouraging.`;

  return await callAI(prompt, {
    temperature: 0.6,
    maxTokens: 256,
    systemPrompt: 'You are a concise English grammar coach. Explain sentence structure simply.'
  });
}

// ─── Grammar Trainer ───────────────────────────────────────────

export async function getGrammarQuestion(topic, difficulty) {
  const prompt = `Generate ONE English grammar exercise for level: ${difficulty}.
Topic: ${topic}

Return ONLY this JSON (no markdown, no extra text):
{"sentence": "The sentence with a _____ blank", "answer": "correct word", "options": ["correct word", "wrong1", "wrong2", "wrong3"], "explanation": "Why this answer is correct in 1-2 sentences.", "topic": "${topic}"}

Shuffle the options array randomly.`;

  const text = await callAI(prompt, {
    temperature: 0.8,
    maxTokens: 400,
    systemPrompt: 'You are an English grammar teacher. Always return valid JSON only.'
  });
  try {
    return JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
  } catch {
    throw new Error('Failed to generate grammar question. Please try again.');
  }
}

export async function getGrammarFeedback(question, userAnswer, correctAnswer) {
  const prompt = `English grammar exercise:
Question: "${question}"
Correct answer: "${correctAnswer}"
Student answered: "${userAnswer}"

Give 1-2 sentences of feedback. If wrong, explain clearly why "${correctAnswer}" is correct.`;

  return await callAI(prompt, {
    temperature: 0.5,
    maxTokens: 200,
    systemPrompt: 'You are a friendly English grammar coach. Be concise and clear.'
  });
}

// ─── Vocabulary ────────────────────────────────────────────────

export async function getVocabularyFeedback(word, userDefinition) {
  const prompt = `The student was asked to define the word: "${word}"
Their definition: "${userDefinition}"

In 2-3 sentences: Was their definition correct? Give the proper definition and an example sentence.`;

  return await callAI(prompt, {
    temperature: 0.5,
    maxTokens: 256,
    systemPrompt: 'You are a vocabulary coach. Be clear, encouraging and educational.'
  });
}

export async function getWordOfTheDay() {
  const prompt = `Give me one interesting English word that is useful for everyday conversation or professional settings.

Return ONLY this JSON (no markdown, no extra text):
{"word": "example", "pronunciation": "/ɪɡˈzɑːmpəl/", "partOfSpeech": "noun", "definition": "A thing characteristic of its kind or illustrating a general rule.", "exampleSentence": "This painting is a perfect example of his early style.", "synonyms": ["instance", "case", "illustration"]}`;

  const text = await callAI(prompt, {
    temperature: 0.9,
    maxTokens: 300,
    systemPrompt: 'You are a vocabulary teacher. Return only valid JSON.'
  });
  try {
    return JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
  } catch {
    return { word: 'Eloquent', pronunciation: '/ˈɛləkwənt/', partOfSpeech: 'adjective', definition: 'Fluent or persuasive in speaking or writing.', exampleSentence: 'She gave an eloquent speech that moved the audience.', synonyms: ['articulate', 'fluent', 'expressive'] };
  }
}

export async function getVocabMatchFeedback(word, userAnswer, correct) {
  const prompt = `Vocabulary exercise — word: "${word}"
Correct answer: "${correct}"
Student answered: "${userAnswer}"
${userAnswer === correct ? 'They got it right!' : 'They got it wrong.'}

Give 1-2 sentences of feedback. If wrong, explain the correct meaning simply. Be encouraging.`;

  return await callAI(prompt, {
    temperature: 0.5,
    maxTokens: 200,
    systemPrompt: 'You are a vocabulary coach. Be concise and encouraging.'
  });
}


// ─── Pronunciation ─────────────────────────────────────────────

export async function getPronunciationFeedback(targetText, spokenText) {
  const prompt = `A student is practicing pronunciation.
Target sentence: "${targetText}"
What they said (speech-to-text): "${spokenText}"

Score their accuracy from 0-100 and give 1-2 tips to improve. Format:
SCORE: (number 0-100)
FEEDBACK: (1-2 tips)`;

  return await callAI(prompt, {
    temperature: 0.4,
    maxTokens: 256,
    systemPrompt: 'You are a pronunciation coach. Be specific and encouraging.'
  });
}

// ─── Session Data ──────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════
// MASTERCLASS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export async function getMasterclassExerciseQuestion(exercisePrompt) {
  const prompt = `${exercisePrompt}

Ask ONE clear, engaging question or give ONE specific task based on the above context. Keep it under 4 lines. Ask only the question — do not give feedback yet.`;

  return await callAI(prompt, {
    temperature: 0.8,
    maxTokens: 200,
    systemPrompt: 'You are a masterclass coach for "Speak with Confidence & Clarity". Ask engaging, thought-provoking questions.'
  });
}

export async function getMasterclassExerciseFeedback(exercisePrompt, studentResponse) {
  const prompt = `Exercise context: ${exercisePrompt}

Student's response: "${studentResponse}"

Give warm, specific, actionable feedback in under 6 lines. Start directly with the feedback — no preamble like "Great response!" or "Thank you".`;

  return await callAI(prompt, {
    temperature: 0.7,
    maxTokens: 300,
    systemPrompt: 'You are a masterclass coach for "Speak with Confidence & Clarity". Give personal, specific, encouraging feedback.'
  });
}

export async function getMasterclassQuiz(quizTopic) {
  const prompt = `Generate exactly 5 multiple choice quiz questions testing knowledge of: ${quizTopic}

Return ONLY a valid JSON array. No markdown, no explanation, no extra text — just the raw JSON:
[
  {
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

Rules:
- "correct" must be the INDEX (0, 1, 2, or 3) of the correct option in the options array
- Make all 4 options plausible so it is not too easy
- Questions must be specific and based on the exact topics listed
- Return nothing except the JSON array`;

  const text = await callAI(prompt, {
    temperature: 0.5,
    maxTokens: 1200,
    systemPrompt: 'You are a quiz generator. You ONLY return valid JSON arrays. Never add markdown, explanation, or any text outside the JSON.'
  });

  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid quiz format');
    return parsed;
  } catch {
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

export async function evaluateCapstone(speechText) {
  const prompt = `You are evaluating a student's final capstone speech for a "Speak with Confidence & Clarity" masterclass.

Student's speech:
"${speechText}"

Score each of these 5 criteria out of 20 points each:
1. Opening Strength — Did they avoid "Good morning, my name is..."? Was the opening engaging and original?
2. Structure and Flow — Did they use a clear structure like Crisis-Hope? Does the speech flow logically?
3. Personal Storytelling — Is there a genuine, specific personal story or example?
4. Vocabulary and Word Choice — Is the language vivid, precise, and confident (not vague or generic)?
5. Closing Impact — Does it end with energy and a memorable line, not a fade?

Return ONLY this JSON (no markdown, no extra text):
{
  "scores": {
    "opening": 0,
    "structure": 0,
    "storytelling": 0,
    "vocabulary": 0,
    "closing": 0
  },
  "total": 0,
  "feedback": {
    "opening": "specific feedback here",
    "structure": "specific feedback here",
    "storytelling": "specific feedback here",
    "vocabulary": "specific feedback here",
    "closing": "specific feedback here"
  },
  "overallComment": "2-3 sentence overall summary",
  "certificateEligible": false
}

Set total = sum of all 5 scores. Set certificateEligible = true if total >= 70.`;

  const text = await callAI(prompt, {
    temperature: 0.4,
    maxTokens: 1000,
    systemPrompt: 'You are a senior communication coach. Evaluate speeches fairly and specifically. Return only valid JSON.'
  });

  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(clean);
    result.total = Object.values(result.scores).reduce((a, b) => a + b, 0);
    result.certificateEligible = result.total >= 70;
    return result;
  } catch {
    throw new Error('Failed to evaluate speech. Please try again.');
  }
}
