import { db } from './config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const SAMPLE_TASKS = [
  // Beginner
  {
    id: 'b1',
    title: 'First Meeting Introduction',
    level: 'Beginner',
    prompt: 'You meet someone new at a party. Greet them for the first time and introduce yourself. Tell them your name, where you are from, and what you do.',
    expectedVocabulary: ['hello', 'nice to meet you', 'my name is', 'I am from', 'I work as', 'pleased'],
  },
  {
    id: 'b2',
    title: 'Order Coffee at a Café',
    level: 'Beginner',
    prompt: 'You walk into a café. Greet the waiter, order a coffee with specific preferences (size, milk type, sugar), and ask for the bill at the end.',
    expectedVocabulary: ['good morning', 'I would like', 'please', 'medium', 'large', 'milk', 'sugar', 'how much'],
  },
  {
    id: 'b3',
    title: 'Ask for Directions',
    level: 'Beginner',
    prompt: 'You are lost in the city and need to find the nearest pharmacy. Stop a stranger and politely ask for directions.',
    expectedVocabulary: ['excuse me', 'could you help me', 'nearest', 'pharmacy', 'turn left', 'turn right', 'straight ahead', 'thank you'],
  },
  // Intermediate
  {
    id: 'i1',
    title: 'Hotel Room Booking',
    level: 'Intermediate',
    prompt: 'Call a hotel and book a room for 2 nights. Ask about room types, pricing, breakfast options, and confirm your check-in and check-out dates.',
    expectedVocabulary: ['availability', 'double room', 'twin room', 'per night', 'check-in', 'check-out', 'confirmation', 'included'],
  },
  {
    id: 'i2',
    title: 'Describe Your Daily Routine',
    level: 'Intermediate',
    prompt: 'Tell a new friend about your typical day. Describe what you do from morning to night, including work, hobbies, and habits. Use time expressions and sequencing words.',
    expectedVocabulary: ['wake up', 'usually', 'then', 'after that', 'in the morning', 'in the evening', 'I tend to', 'normally'],
  },
  {
    id: 'i3',
    title: 'Polite Restaurant Complaint',
    level: 'Intermediate',
    prompt: 'You are at a restaurant and the waiter brought you the wrong order. Politely explain the mistake to the manager and request the correct dish.',
    expectedVocabulary: ['excuse me', 'I ordered', 'instead', 'unfortunately', 'could you please', 'I am afraid', 'mistake', 'appreciate'],
  },
  // Advanced
  {
    id: 'a1',
    title: 'Job Interview Salary Negotiation',
    level: 'Advanced',
    prompt: 'You are in a job interview and the hiring manager asks about your salary expectations. Negotiate confidently for a higher salary, justify your ask with your experience, and handle any pushback professionally.',
    expectedVocabulary: ['based on my experience', 'market rate', 'value', 'negotiate', 'compensation', 'open to discussion', 'flexible', 'worth'],
  },
  {
    id: 'a2',
    title: 'Social Media Debate',
    level: 'Advanced',
    prompt: 'Debate whether social media is good or bad for society. Present arguments for both sides and give your personal opinion with strong reasoning and examples.',
    expectedVocabulary: ['on one hand', 'however', 'in contrast', 'argument', 'evidence', 'mental health', 'connectivity', 'misinformation', 'in conclusion'],
  },
  {
    id: 'a3',
    title: 'Investor Business Pitch',
    level: 'Advanced',
    prompt: 'Present your business idea to an investor in 60 seconds. Include the problem you are solving, your solution, target market, and what you need from the investor.',
    expectedVocabulary: ['market gap', 'solution', 'target audience', 'revenue model', 'scalable', 'ROI', 'investment', 'growth potential', 'disruptive'],
  },
];

export async function seedTasks() {
  try {
    const tasksRef = collection(db, 'tasks');
    const existing = await getDocs(tasksRef);

    if (!existing.empty) {
      console.log('Tasks already seeded. Skipping.');
      return { status: 'skipped', count: existing.size };
    }

    let count = 0;
    for (const task of SAMPLE_TASKS) {
      await setDoc(doc(db, 'tasks', task.id), task);
      count++;
    }

    console.log(`✅ Seeded ${count} tasks to Firestore.`);
    return { status: 'success', count };
  } catch (error) {
    console.error('Error seeding tasks:', error);
    return { status: 'error', error: error.message };
  }
}

export { SAMPLE_TASKS };
