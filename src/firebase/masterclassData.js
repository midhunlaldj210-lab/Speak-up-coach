export const MASTERCLASS_MODULES = [
  {
    id: 1,
    title: "Build Your Foundation",
    subtitle: "Unlearn the myths. Understand the blockers. Start fresh.",
    unlockDay: 0,
    color: "#FFD700",
    icon: "🏛️",
    bullets: ["Unlearn 3 communication myths", "Identify your personal blockers", "Self-audit your speaking habits"],
    lessons: [
      {
        id: "1.1",
        title: "Clearing Your Fundamentals",
        content: `Most people think communication is about speaking more. It is not. It is about speaking with purpose. Before you can improve, you must unlearn three common myths: that good speakers are born not made, that you need a big vocabulary, and that confidence comes before action. The truth is the opposite of all three.\n\nGreat speakers are made through deliberate practice. Simple words spoken with conviction beat complex vocabulary every time. And confidence is not something you feel before you act — it is something you build by acting despite the fear.\n\nThe first step to becoming a better communicator is to stop waiting until you feel ready. You will never feel fully ready. The speaker who steps up anyway is the one who grows.`,
        exercisePrompt: `The student just learned about unlearning communication myths. Ask them ONE reflective question: "What is one belief about speaking you have held that might be holding you back? Describe it in 2-3 sentences." When they respond, give encouraging feedback and reframe their belief in a positive direction. Keep response under 5 lines.`
      },
      {
        id: "1.2",
        title: "Overcome Communication Challenges",
        content: `The 3 biggest communication blockers are: fear of judgment, speaking too fast when nervous, and losing your train of thought. Each one has a simple fix.\n\nFear of judgment disappears when you focus on your listener instead of yourself. The moment you shift from "how do I look?" to "how can I help them understand?" — the fear shrinks.\n\nSpeaking fast is cured by deliberate pausing. Silence is not awkward — it is powerful. A 2-second pause after a key point makes the point land harder, not weaker.\n\nLosing your thought is solved by structuring before you speak. Use a simple framework: Point → Reason → Example → Point again. This gives your brain a track to run on even when nerves kick in.`,
        exercisePrompt: `Ask the student: "Which of these 3 challenges affects you most: fear of judgment, speaking too fast, or losing your train of thought? Write 3 sentences about a situation where this happened to you." Analyze their response and give them 2 specific actionable tips for their exact challenge. Be personal and specific.`
      },
      {
        id: "1.3",
        title: "Common Mistakes & How to Avoid Them",
        content: `The 5 most common speaking mistakes:\n\n1. Starting with an apology ("Sorry, I am not a great speaker") — This immediately lowers the audience's trust before you say anything meaningful.\n\n2. Reading from slides word for word — If the audience can read it, why are you there? You become a slide reader, not a speaker.\n\n3. No eye contact — Eyes are the most powerful connection tool you have. Avoiding them signals that you do not believe what you are saying.\n\n4. Ending with "So yeah, that is it" — Your ending is what people remember most. A weak ending erases everything good that came before.\n\n5. Filler words: um, uh, like, you know — Each filler word signals that your brain is not yet ready to speak. Practice pausing instead.\n\nEach mistake signals low confidence even when you feel confident inside.`,
        exercisePrompt: `Tell the student: "Let us do a quick self-audit. Speak for 60 seconds on any topic, then type out exactly what you said." When they paste their text, analyze it for: filler words used (count them), how they started and ended, confidence signals in word choice. Give a score out of 10 and 3 improvement tips.`
      }
    ],
    quizTopic: "communication myths, the 3 communication blockers (fear of judgment, speaking fast, losing thoughts), and the 5 common speaking mistakes (apologies, reading slides, no eye contact, weak endings, filler words)"
  },
  {
    id: 2,
    title: "The Science Behind Communication",
    subtitle: "Why stories move people. What brands teach us about emotion.",
    unlockDay: 7,
    color: "#C084FC",
    icon: "🧪",
    bullets: ["The neuroscience of storytelling", "Study rhetoric as a warning tool", "Coca-Cola and Cadbury case studies"],
    lessons: [
      {
        id: "2.1",
        title: "The Science of Storytelling",
        content: `Stories trigger oxytocin in the brain — the trust hormone. Facts tell, stories sell. When you wrap your message in a story, people remember 22x more than facts alone.\n\nThe simplest story structure: Situation → Conflict → Resolution. Every great communicator uses this whether they know it or not. The Situation sets the scene. The Conflict creates tension and makes people lean in. The Resolution delivers the message in a way that feels earned.\n\nWhen you share data, people forget. When you make them feel something, they remember forever. A statistic says 1 in 5 children go to bed hungry. A story says "Her name was Maria. She was 7. She told her teacher she could not concentrate because she did not eat breakfast." The second version changes behavior. The first does not.`,
        exercisePrompt: `Ask the student to tell a short story from their life using the Situation → Conflict → Resolution structure. When they write it, evaluate: Did they follow the structure? Was it emotionally engaging? Was the resolution clear? Give feedback and rewrite one paragraph to show a stronger version.`
      },
      {
        id: "2.2",
        title: "Dissecting Communication Tactics (A Cautionary Study)",
        content: `Warning: This lesson studies persuasion rhetoric as a cautionary tale — to help you recognize manipulation, not replicate it.\n\nHistorical demagogues are studied by communication experts because they demonstrate how powerful the wrong use of communication can be. The tactics they used:\n\n1. Repetition to embed ideas — repeat a message enough times and people begin to accept it as truth\n2. Emotional escalation — start calm, build to a peak, let emotion override logic\n3. Simple language for complex ideas — reduces nuance, removes space for critical thinking\n4. Scapegoating to unify — give people an enemy and they will unite behind you\n5. Absolute certainty in tone — doubt invites questioning; false certainty shuts it down\n\nUnderstanding these tactics helps you recognize manipulation in media and politics today, and ensures you can never be misled without knowing it.`,
        exercisePrompt: `Ask the student: "Now that you understand manipulation tactics in communication, describe a time you saw someone use one of these tactics in real life — in a meeting, an advertisement, or in news. What tactic was it and how did it affect the audience?" Give thoughtful feedback connecting their example to the lesson.`
      },
      {
        id: "2.3",
        title: "Case Studies: Coca-Cola and Cadbury",
        content: `Coca-Cola does not sell sugar water. It sells happiness, togetherness, and nostalgia. Every advertisement shows people laughing together, not the ingredients.\n\nCadbury does not sell chocolate. It sells generosity and joy. Their iconic Gorilla ad had nothing to do with chocolate — and it is one of the most remembered ads in history.\n\nBoth brands communicate through emotion, not product features. Lesson: The best communicators never talk about what they are selling. They talk about how it makes you feel.\n\nThis applies to job interviews ("I do not just deliver code — I help teams ship faster and stress less"), sales pitches, and everyday conversations. Features are forgotten. Feelings are remembered.\n\nWhen you communicate, always ask: What do I want them to FEEL? Start there. Build the words around the feeling.`,
        exercisePrompt: `Tell the student: "Pick any product, service, or idea YOU want to communicate — yourself in an interview, your business, or a college project. Write 3 sentences selling it using emotion, NOT features." Evaluate their response and rewrite it showing the before (feature-based) vs after (emotion-based) version.`
      }
    ],
    quizTopic: "storytelling science (oxytocin, 22x memory, Situation-Conflict-Resolution), persuasion manipulation tactics (repetition, emotional escalation, scapegoating), and brand communication (Coca-Cola sells happiness, Cadbury sells joy, emotion over features)"
  },
  {
    id: 3,
    title: "Craft and Structure Your Message",
    subtitle: "The architecture of words that stick and persuade.",
    unlockDay: 14,
    color: "#34D399",
    icon: "🏗️",
    bullets: ["Hook → Value → CTA structure", "Golden Boat & Crisis-Hope", "5 proven opening styles"],
    lessons: [
      {
        id: "3.1",
        title: "Structure Your Message",
        content: `A message without structure is noise. The 3-part structure that always works:\n\nOpening (Hook) → Middle (Value) → End (Call to Action)\n\nYour opening must answer: Why should I listen to this?\nYour middle must answer: What do I gain from this?\nYour end must answer: What should I do now?\n\nMost speakers spend 90% of their time on the middle and forget the opening and ending — the two parts people remember most. Your first 30 seconds determine whether the audience gives you their full attention or their polite attention. Your last 30 seconds determine what they walk away believing.\n\nA strong CTA is specific. Not "think about it." But "do this one thing tonight."`,
        exercisePrompt: `Give the student a random speaking scenario (job interview, product pitch, or team meeting update). Ask them to write their message using the Hook → Value → CTA structure. Evaluate each section separately and give a score out of 10 for each section. Be specific about what worked and what to improve.`
      },
      {
        id: "3.2",
        title: "The Golden Boat and Crisis-Hope Structure",
        content: `The Golden Boat structure (used by master speakers):\nStart with a relatable struggle → Show the turning point → Reveal the transformation → Invite the audience into the same journey.\n\nThe listener hears themselves in your struggle. They want the transformation. You become the bridge.\n\nThe Crisis-Hope structure:\nPaint the current problem vividly (Crisis) → Show a better world is possible (Hope) → Position yourself or your idea as the bridge between the two.\n\nSimon Sinek uses this in every TED talk. His "Start With Why" talk opens with the crisis ("Most people and organizations communicate from the outside in — they tell you what, how, but never why") and immediately offers hope ("But there are a few leaders who think, act, and communicate from the inside out").\n\nYou can use Crisis-Hope in a job interview: "Most developers ship features. But teams that ship without clarity lose users. I have spent my career building the bridge between technical work and clear communication."`,
        exercisePrompt: `Ask the student to write a 1-minute speech introduction using the Crisis-Hope structure on any topic they care about. Evaluate: Did they paint the crisis vividly? Did the hope feel real and achievable? Rewrite their opening sentence to be stronger and explain exactly why the rewrite works better.`
      },
      {
        id: "3.3",
        title: "How Great Speakers Start Their Talks",
        content: `Simon Sinek starts with a question.\nBrené Brown starts with a confession.\nSteve Jobs started with a bold statement.\n\nThe 5 proven opening styles:\n\n1. Bold statement: "Everything you know about X is wrong"\n2. Question: "Have you ever wondered why some people walk into a room and everyone listens?"\n3. Story: "Three years ago I was fired. Standing in the car park, I made a decision that changed everything."\n4. Statistic: "Every 40 seconds, someone dies by suicide. That is the population of this room, every 40 minutes."\n5. Silence: Walk on stage. Stand. Say nothing for 5 full seconds. Then speak.\n\nNever start with: "Good morning everyone, my name is..." — This is the verbal equivalent of a grey wall. It signals that nothing interesting is about to happen.\n\nYour opening is the contract you make with the audience: This is the kind of talk this will be.`,
        exercisePrompt: `Give the student a presentation topic. Ask them to write 5 different opening lines for it — one for each of the 5 opening styles (bold statement, question, story, statistic, silence/pause description). Then ask which they would use and why. Evaluate all 5 and tell them which is strongest and why, with a detailed explanation.`
      }
    ],
    quizTopic: "message structure (Hook-Value-CTA), Golden Boat structure (struggle, turning point, transformation, invitation), Crisis-Hope structure, and the 5 proven opening styles (bold statement, question, story, statistic, silence)"
  },
  {
    id: 4,
    title: "Speak Fearlessly & Master Body Language",
    subtitle: "Your body speaks louder than your words. Make it say the right things.",
    unlockDay: 21,
    color: "#F87171",
    icon: "💪",
    bullets: ["The 55-38-7 communication rule", "Eye contact, posture, gestures", "Eliminate stage fear permanently"],
    lessons: [
      {
        id: "4.1",
        title: "Body Language's Role in Communication",
        content: `55% of communication is body language. 38% is tone of voice. Only 7% is the actual words you say. (Albert Mehrabian's research)\n\nThis means if your body says one thing and your words say another, people will always believe your body. You can say "I am confident about this" while your shoulders are slumped and your eyes dart to the floor — and the audience will feel your lack of confidence, not hear your words.\n\nCrossed arms signal closed off or defensive — even if you are just cold.\nSlouching signals low status and low energy — even if you feel fine inside.\nDirect eye contact signals confidence, honesty, and trust.\nSlow, measured movements signal calm authority.\nFast, jerky movements signal anxiety.\n\nThe body does not lie. The good news: You can train it.`,
        exercisePrompt: `Ask the student to reflect: "Based on the 55-38-7 rule, which area do you think is your weakest — body language, tone of voice, or word choice? Give one specific example from a recent conversation or presentation that shows this weakness." Give targeted advice and one specific daily practice to improve that area.`
      },
      {
        id: "4.2",
        title: "Eye Contact, Posture, and Gestures",
        content: `Eye contact rule: Hold eye contact for one complete thought, then shift naturally to another person. Never dart your eyes rapidly — it signals nervousness. Never stare unbroken — it feels aggressive. One thought, one person. Move. Repeat.\n\nPosture rule: Feet shoulder-width apart, weight evenly distributed, chin parallel to the floor. Never stand with feet together (looks timid) or too wide (looks aggressive). The moment you get this right, you will feel different inside — posture changes physiology.\n\nGesture rule: Keep gestures within the "power box" — the area between your shoulders and your belly button. Gestures outside this box look chaotic and uncontrolled. No gestures at all looks robotic and detached. Gestures inside the power box look natural and confident.\n\nRule of thumb: If you have to think about your gesture, it is probably too much.`,
        exercisePrompt: `Ask the student to stand in front of a mirror and describe what they notice about their own default posture and gestures. Then ask: What would you change after this lesson? Give them a 7-day body language challenge — one micro-habit per day, building from posture to eye contact to gestures. Make it specific and actionable.`
      },
      {
        id: "4.3",
        title: "Overcome Stage Fear with Practical Exercises",
        content: `Stage fear is your body preparing to perform — not warning you to stop. The adrenaline that makes your hands shake is the same adrenaline that makes athletes perform at their peak. The difference is the label you put on it.\n\nThe 3-step reset:\n\n1. Power pose for 2 minutes before speaking — Stand tall, hands on hips, chin up. Amy Cuddy's research shows this changes your hormone levels within 2 minutes. Testosterone (confidence) goes up. Cortisol (stress) goes down.\n\n2. Box breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times. This activates the parasympathetic nervous system — the body's calm-down mode.\n\n3. Reframe: Instead of saying "I am nervous," say "I am excited." Same physiological response. Completely different meaning. Your brain believes what you tell it.\n\nPractical exercise: Speak to yourself in the mirror for 2 minutes every day for 7 days. Rate your confidence each day from 1-10. Watch the number rise.`,
        exercisePrompt: `Ask the student: "Describe your biggest speaking fear in detail. When does it happen? What does it feel like physically — heart racing, hands shaking, mind going blank?" Give them a personalized 5-step plan to overcome their specific fear based exactly on what they describe. Be very personal and specific to their situation, not generic advice.`
      }
    ],
    quizTopic: "Mehrabian's 55-38-7 rule (body language, tone, words), eye contact rule (one thought per person), posture rule (feet shoulder-width, chin parallel), gesture power box, and the 3-step stage fear reset (power pose, box breathing, reframe nervous as excited)"
  },
  {
    id: 5,
    title: "Observe & Learn from Famous Speakers",
    subtitle: "Decode what the masters do and make it your own.",
    unlockDay: 28,
    color: "#60A5FA",
    icon: "🎓",
    bullets: ["Naval Ravikant's density principle", "Dandapani's silence technique", "Apollo Robbins & Justin Baldoni"],
    lessons: [
      {
        id: "5.1",
        title: "Learning from Naval Ravikant",
        content: `Naval speaks in short, dense sentences. Every word earns its place. There are no filler words. No repetition. No "basically" or "kind of." Every sentence is complete before the next begins.\n\nHis secret: He thinks for years before he speaks publicly. What sounds like a spontaneous insight is a refined idea — polished down from a long conversation or years of thinking into a single, memorable line.\n\n"You should be too busy to have coffee with someone, but if you value them, you'll make time." — One sentence. Packed with meaning.\n\nLesson: Depth beats breadth. Say less, mean more. Speak when you have something worth saying.\n\nPractice: Take any opinion you have. Write it in 10 sentences. Now cut it to 5. Now cut it to 1. That one sentence is your real message. Everything else was you warming up.`,
        exercisePrompt: `Ask the student to take one strong opinion they hold on any topic and write it in 10 sentences. Then tell them to cut it to 5. Then to 1. Share all three versions in their response. Evaluate: Does the final sentence actually capture the essence? Is it memorable? Is it dense with meaning? Give specific feedback on each version and suggest an even tighter version if possible.`
      },
      {
        id: "5.2",
        title: "Learning from Dandapani",
        content: `Dandapani speaks in extreme calm. He is a former Hindu monk and current speaker and entrepreneur. His power comes from what he does NOT do — no rush, no filler words, no apologies, no hedging.\n\nHis technique: Finish your sentence fully before thinking about the next one. Most people start forming their next thought while still speaking their current one. This is what creates the "um" and "uh" gaps — your mouth stops because your brain jumped ahead.\n\nDandapani's practice: Complete the sentence. Full stop. Breathe. Then begin the next.\n\nThis requires enormous discipline because silence feels uncomfortable. We are trained to fill it. But silence is not empty — it is full of presence. When you stop and breathe, the audience leans forward. They want to hear what comes next.\n\nThe pause is not a weakness. It is a weapon.`,
        exercisePrompt: `Ask the student to summarize what they have learned so far in the masterclass in exactly 5 sentences — no more, no less. Evaluate: Is each sentence complete before the next begins? Are there filler words? Is the summary clear to someone who never took the course? Give specific edits sentence by sentence and explain each change.`
      },
      {
        id: "5.3",
        title: "Analyzing Apollo Robbins and Justin Baldoni",
        content: `Apollo Robbins (master pickpocket turned speaker): Controls the audience's attention through misdirection and rhythm changes. He speeds up to build excitement, slows down to near silence to deliver a key point — and the audience follows every time.\n\nLesson: Vary your pace. Fast when building excitement, slow when delivering key points. Monotone pace is the audience's lullaby.\n\nJustin Baldoni (Man Enough TED talk — 10 million views): Opens with radical vulnerability. He stands on stage and admits, in front of millions, that he has struggled with what it means to be a man. He does not project strength. He admits confusion.\n\nLesson: Counterintuitively, admitting a real weakness builds more trust than projecting strength. The audience relaxes when you are real. They lean in. They trust you. Because you trusted them first.`,
        exercisePrompt: `Ask the student to choose one speaker from this module (Naval Ravikant, Dandapani, Apollo Robbins, or Justin Baldoni) who resonates most with them and explain why in 3-4 sentences. Then: What is one specific technique from that speaker you will use in your very next presentation or conversation? Give feedback and help them plan a concrete implementation strategy.`
      }
    ],
    quizTopic: "Naval Ravikant's density principle (cut to the essential sentence), Dandapani's complete sentence technique (finish before thinking of next), Apollo Robbins' pace variation (fast for excitement, slow for key points), and Justin Baldoni's vulnerability principle (admitting weakness builds trust)"
  },
  {
    id: 6,
    title: "Present Yourself Like a Leader",
    subtitle: "The final secrets. The capstone speech. Your certificate.",
    unlockDay: 35,
    color: "#FBBF24",
    icon: "👑",
    bullets: ["Best & worst public speaking practices", "Master PowerPoint like Apple", "Final capstone speech & certificate"],
    lessons: [
      {
        id: "6.1",
        title: "Best and Worst Practices for Public Speaking",
        content: `BEST practices that separate great speakers:\n\n• Know your first and last sentence by heart — everything else can flex, but your bookends must be locked in.\n• Pause after key points — silence signals confidence. The audience needs time to absorb what matters.\n• Speak to individuals, not the crowd — pick one person, complete a thought, move to the next person. You are having 300 individual conversations, not addressing a crowd.\n• Always end with energy, not a fade — your last words should land, not drift.\n• Rehearse out loud, not in your head — reading your speech silently is not practice. Your mouth needs to learn the words.\n\nWORST practices that undermine great content:\n\n• Reading from notes word for word — you lose eye contact, rhythm, and credibility simultaneously.\n• Ending with "Any questions?" as your last words — give a closing statement AFTER Q&A.\n• Apologizing for being nervous — never mention it. Most audiences cannot tell.\n• Going over your time limit — it tells the audience their time does not matter to you.`,
        exercisePrompt: `Ask the student: "Which of the BEST practices do you currently do? Which do you most need to work on? And which of the WORST practices have you been guilty of?" Ask them to be honest and specific. Give them a personalized action plan — 3 specific things to do in their next speaking opportunity based on their self-assessment.`
      },
      {
        id: "6.2",
        title: "Master PowerPoint Presentations",
        content: `The 3 rules of great slides (from Steve Jobs and the Apple design philosophy):\n\n1. One idea per slide — never more. If you have two ideas, you have two slides. The audience cannot read and listen simultaneously. Give them one thing to look at.\n\n2. Images over text — if you can show it, do not say it. A photo of a child's face communicates more than 50 words about childhood.\n\n3. Your slides support you — you are not a slide reader. The slide is the backdrop. You are the performance.\n\nThe worst slide ever created: A wall of bullet points read word for word. This turns a speaker into a teleprompter and the audience into hostages.\n\nThe best slide: A single powerful image. Five words or fewer. Let the speaker carry the meaning.\n\nAmazon's Jeff Bezos banned PowerPoint in all meetings. Replaced by: a 6-page written narrative read in silence for 30 minutes, then discussed. His reasoning: "The discipline of writing a narrative forces clear thinking. Bullet points hide muddled thinking behind the appearance of structure."`,
        exercisePrompt: `Give the student a presentation topic. Ask them to outline 5 slides for it — just the slide title and one key visual idea for each slide. No bullet points allowed in their answer. Evaluate: Does each slide have exactly one clear idea? Is the visual idea specific (not vague like "relevant image")? Rewrite any slide that breaks the one-idea rule and explain why.`
      },
      {
        id: "6.3",
        title: "Secret Ingredients of Great Speakers",
        content: `Tony Fadell (inventor of the iPod, Nest thermostat, and advisor to companies worldwide): Always teaches by contrast. He never shows the new thing without first showing the old, broken thing it replaces. He makes you feel the pain of the old world so deeply that the new solution feels like relief.\n\nLesson: Context makes your idea land harder. Show the before. Then the after. Never just the after.\n\nJeff Bezos: Obsessively positions the customer as the hero of every story. Every product pitch at Amazon starts not with the product, but with a press release written from the customer's perspective — the customer's problem, the customer's transformation, the customer's win.\n\nLesson: Your audience is always the hero, not you.\n\nThe final secret ingredient that ALL great speakers share — from Sinek to Jobs to Brené Brown to Obama:\n\nThey speak as if this is the most important thing they have ever said. And they make you feel like they are speaking only to you.\n\nThat is not a technique. That is a decision. You can make that decision right now.`,
        exercisePrompt: `This is the student's FINAL CAPSTONE EXERCISE of the entire masterclass. Ask them to write a 2-minute speech (250-300 words) on this topic: "The one thing I have learned about communication that will change how I speak forever." Requirements: Strong opening (NOT "Good morning my name is"), Crisis-Hope structure from Module 3, at least one personal story, and a powerful closing line. Evaluate on 5 criteria each scored out of 20: (1) Opening strength, (2) Structure and flow, (3) Personal storytelling, (4) Vocabulary and word choice, (5) Closing impact. Give total score out of 100. If 70+, congratulate them and confirm certificate eligibility. If below 70, give specific improvements for resubmission.`,
        isFinalCapstone: true
      }
    ],
    quizTopic: "best public speaking practices (know first/last sentence, pause, speak to individuals), worst practices (reading notes, weak endings, apologizing), the 3 slide rules (one idea, images over text, slides support speaker), Tony Fadell's contrast technique (before vs after), Jeff Bezos customer-as-hero principle, and the final ingredient (speaking as if it's the most important thing)"
  }
];

export const WHO_IS_THIS_FOR = [
  {
    icon: "💼",
    title: "Working Professionals",
    desc: "Speak up in meetings, present ideas with clarity, and get your next promotion."
  },
  {
    icon: "🏢",
    title: "Business Owners",
    desc: "Lead with confidence, build larger teams and drive sales through impactful communication."
  },
  {
    icon: "🎓",
    title: "Students",
    desc: "Speak with clarity, give great presentations, clear interviews and land your dream job."
  }
];
