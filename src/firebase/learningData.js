// Learning Hub seed data — Sentence Structure, Grammar, Vocabulary, Pronunciation

// ─── SENTENCE STRUCTURE ──────────────────────────────────────────────
export const SENTENCE_EXERCISES = [
  // Beginner
  {
    id: 'ss1', level: 'Beginner',
    scrambled: ['every', 'I', 'morning', 'coffee', 'drink'],
    correct: 'I drink coffee every morning',
    parts: [
      { label: 'Subject', word: 'I' },
      { label: 'Verb', word: 'drink' },
      { label: 'Object', word: 'coffee' },
      { label: 'Time', word: 'every morning' },
    ],
  },
  {
    id: 'ss2', level: 'Beginner',
    scrambled: ['is', 'name', 'my', 'Sarah'],
    correct: 'My name is Sarah',
    parts: [
      { label: 'Subject', word: 'My name' },
      { label: 'Verb', word: 'is' },
      { label: 'Object', word: 'Sarah' },
    ],
  },
  {
    id: 'ss3', level: 'Beginner',
    scrambled: ['do', 'you', 'where', 'live'],
    correct: 'Where do you live',
    parts: [
      { label: 'Question', word: 'Where' },
      { label: 'Aux', word: 'do' },
      { label: 'Subject', word: 'you' },
      { label: 'Verb', word: 'live' },
    ],
  },
  {
    id: 'ss4', level: 'Beginner',
    scrambled: ['likes', 'she', 'movies', 'watching'],
    correct: 'She likes watching movies',
    parts: [
      { label: 'Subject', word: 'She' },
      { label: 'Verb', word: 'likes' },
      { label: 'Gerund', word: 'watching' },
      { label: 'Object', word: 'movies' },
    ],
  },
  // Intermediate
  {
    id: 'ss5', level: 'Intermediate',
    scrambled: ['been', 'have', 'I', 'three', 'for', 'working', 'years', 'here'],
    correct: 'I have been working here for three years',
    parts: [
      { label: 'Subject', word: 'I' },
      { label: 'Aux', word: 'have been' },
      { label: 'Verb', word: 'working' },
      { label: 'Place', word: 'here' },
      { label: 'Duration', word: 'for three years' },
    ],
  },
  {
    id: 'ss6', level: 'Intermediate',
    scrambled: ['finished', 'she', 'had', 'before', 'left', 'she', 'the work'],
    correct: 'She had finished the work before she left',
    parts: [
      { label: 'Subject', word: 'She' },
      { label: 'Aux', word: 'had' },
      { label: 'Verb', word: 'finished' },
      { label: 'Object', word: 'the work' },
      { label: 'Clause', word: 'before she left' },
    ],
  },
  // Advanced
  {
    id: 'ss7', level: 'Advanced',
    scrambled: ['were', 'the', 'announced', 'results', 'before', 'prepared', 'we', 'had'],
    correct: 'The results were announced before we had prepared',
    parts: [
      { label: 'Subject', word: 'The results' },
      { label: 'Passive', word: 'were announced' },
      { label: 'Clause', word: 'before we had prepared' },
    ],
  },
];

// ─── GRAMMAR QUESTIONS ───────────────────────────────────────────────
export const GRAMMAR_QUESTIONS = [
  // Tenses
  {
    id: 'gr1', category: 'Tenses',
    sentence: 'She ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correct: 1,
  },
  {
    id: 'gr2', category: 'Tenses',
    sentence: 'They ___ dinner when I called.',
    options: ['have', 'had', 'were having', 'are having'],
    correct: 2,
  },
  {
    id: 'gr3', category: 'Tenses',
    sentence: 'By next year, I ___ here for 10 years.',
    options: ['work', 'will work', 'will have worked', 'worked'],
    correct: 2,
  },
  {
    id: 'gr4', category: 'Tenses',
    sentence: 'He ___ football since he was a child.',
    options: ['plays', 'has played', 'is playing', 'had played'],
    correct: 1,
  },
  // Articles
  {
    id: 'gr5', category: 'Articles',
    sentence: 'I saw ___ elephant at the zoo.',
    options: ['a', 'an', 'the', 'no article'],
    correct: 1,
  },
  {
    id: 'gr6', category: 'Articles',
    sentence: '___ sun rises in the east.',
    options: ['A', 'An', 'The', 'no article'],
    correct: 2,
  },
  {
    id: 'gr7', category: 'Articles',
    sentence: 'She wants to become ___ engineer.',
    options: ['a', 'an', 'the', 'no article'],
    correct: 1,
  },
  // Prepositions
  {
    id: 'gr8', category: 'Prepositions',
    sentence: 'She is good ___ mathematics.',
    options: ['in', 'at', 'on', 'with'],
    correct: 1,
  },
  {
    id: 'gr9', category: 'Prepositions',
    sentence: 'The meeting is ___ Monday morning.',
    options: ['in', 'at', 'on', 'by'],
    correct: 2,
  },
  {
    id: 'gr10', category: 'Prepositions',
    sentence: 'We arrived ___ the airport early.',
    options: ['to', 'at', 'in', 'on'],
    correct: 1,
  },
];

// ─── VOCABULARY — WORD MATCH ──────────────────────────────────────────
export const WORD_MATCH_SETS = [
  {
    id: 'vm1',
    pairs: [
      { word: 'Eloquent',    def: 'Fluent and persuasive in speech' },
      { word: 'Meticulous',  def: 'Showing great attention to detail' },
      { word: 'Benevolent',  def: 'Well-meaning and kind' },
      { word: 'Tenacious',   def: 'Very determined; not giving up easily' },
      { word: 'Ambiguous',   def: 'Open to more than one interpretation' },
    ],
  },
  {
    id: 'vm2',
    pairs: [
      { word: 'Candid',      def: 'Truthful and straightforward' },
      { word: 'Profound',    def: 'Very great or intense; deep' },
      { word: 'Resilient',   def: 'Able to recover quickly from difficulties' },
      { word: 'Pragmatic',   def: 'Dealing with things sensibly and practically' },
      { word: 'Versatile',   def: 'Able to adapt to many different functions' },
    ],
  },
];

// ─── VOCABULARY — FILL IN THE STORY ──────────────────────────────────
export const FILL_STORIES = [
  {
    id: 'fs1',
    title: 'A Day at the Market',
    text: [
      'Last Saturday, Maria decided to visit the local [1].',
      'She wanted to buy some [2] vegetables for dinner.',
      'The market was very [3] with people shopping.',
      'She found a friendly vendor who gave her a [4] smile.',
      'Maria was [5] with all the colorful fruits she found.',
    ],
    blanks: [
      { id: 1, answer: 'market' },
      { id: 2, answer: 'fresh' },
      { id: 3, answer: 'crowded' },
      { id: 4, answer: 'warm' },
      { id: 5, answer: 'delighted' },
    ],
    wordBank: ['market', 'fresh', 'crowded', 'warm', 'delighted', 'expensive', 'boring', 'silent'],
  },
];

// ─── PRONUNCIATION TARGETS ────────────────────────────────────────────
export const PRONUNCIATION_TARGETS = [
  { id: 'pr1', text: 'Comfortable',               level: 'Word' },
  { id: 'pr2', text: 'February',                  level: 'Word' },
  { id: 'pr3', text: 'Specifically',              level: 'Word' },
  { id: 'pr4', text: 'Worcestershire',            level: 'Word' },
  { id: 'pr5', text: 'Particularly',              level: 'Word' },
  { id: 'pr6', text: 'The weather is getting better every day', level: 'Sentence' },
  { id: 'pr7', text: 'She sells seashells by the seashore',     level: 'Sentence' },
  { id: 'pr8', text: 'I would like a cup of coffee, please',    level: 'Sentence' },
  { id: 'pr9', text: 'How can I help you today',                level: 'Sentence' },
];
