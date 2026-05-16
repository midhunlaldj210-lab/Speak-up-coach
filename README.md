# 🎙️ SpeakUp Coach — AI English Speaking Practice App

A full-stack English communication learning web app built with **React**, **Firebase**, and **Google Gemini AI**. Practice real English conversations with instant AI feedback.

---

## ✨ Features

- 🔐 **Authentication** — Email/password + Google Sign-In via Firebase Auth
- 🏠 **Dashboard** — Task cards grouped by Beginner / Intermediate / Advanced levels
- 🎙️ **Speaking Practice** — Mic → Speech-to-text → Gemini AI feedback → TTS auto-play
- 📈 **Progress Tracker** — Session history, streak counter, score tracking
- 🤖 **AI Coaching** — 4 feedback sections: Correction, Explanation, Better Sentence, AI Reply
- 🔥 **Streak System** — Daily login streak tracking

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Firebase project](https://console.firebase.google.com/) (free tier works)
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and fill in your keys:

```env
# Firebase (from Firebase Console → Project Settings → Your Apps → Web App)
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# Gemini (from https://aistudio.google.com/app/apikey)
REACT_APP_GEMINI_API_KEY=AIzaSy...
```

### 3. Firebase Setup

In the [Firebase Console](https://console.firebase.google.com/):

1. **Authentication** → Sign-in methods → Enable **Email/Password** and **Google**
2. **Firestore Database** → Create database → Start in **production mode**
3. Add this Firestore security rule:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public task reading
    match /tasks/{taskId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run Locally

```bash
npm start
```

App opens at `http://localhost:3000`

> **Note:** Tasks are automatically seeded to Firestore on first Dashboard load!

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push the project to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add all `REACT_APP_*` variables in Vercel's Environment Variables settings
4. Deploy!

### Firebase Hosting

```bash
npm install -g firebase-tools
npm run build
firebase init hosting
firebase deploy
```

---

## 🏗️ Project Structure

```
src/
├── firebase/
│   ├── config.js          # Firebase init (Auth + Firestore)
│   └── seed.js            # Sample tasks data + auto-seeder
├── contexts/
│   └── AuthContext.jsx    # Auth state, streak logic, profile management
├── hooks/
│   ├── useSpeechRecognition.js   # Web Speech API wrapper
│   └── useSpeechSynthesis.js     # TTS wrapper
├── services/
│   └── geminiService.js   # Gemini REST API + response parser
├── screens/
│   ├── LoginScreen.jsx    # Email/Google auth UI
│   ├── DashboardScreen.jsx # Task cards + level filters
│   ├── PracticeScreen.jsx  # CORE: mic → AI → feedback loop
│   └── ProgressScreen.jsx  # Session history + stats
├── components/
│   ├── ProtectedRoute.jsx  # Auth guard
│   ├── Navbar.jsx          # Sticky nav with streak badge
│   ├── MicButton.jsx       # Animated mic with pulse rings
│   ├── FeedbackCard.jsx    # 4-section colored AI feedback cards
│   ├── TaskCard.jsx        # Dashboard task card
│   ├── SessionSummary.jsx  # Post-session summary screen
│   └── LoadingSpinner.jsx  # Reusable spinner
├── App.jsx                # Router + providers
├── index.js               # React entry point
└── index.css              # Design system (tokens, animations, utilities)
```

---

## 🎨 Design System

- **Color Palette**: Dark navy backgrounds with teal/blue accents
- **Typography**: Inter (body) + Outfit (display) from Google Fonts
- **Animations**: framer-motion transitions + CSS pulse/wave animations
- **Components**: Glassmorphism cards with backdrop blur

---

## 🔑 Browser Requirements

- **Speech Recognition**: Requires Chrome or Edge (Web Speech API)
- The app shows a clear error message on unsupported browsers
- All other features work in any modern browser

---

## 📊 Firestore Collections

```
/tasks/{taskId}
  ├── title: string
  ├── level: "Beginner" | "Intermediate" | "Advanced"
  ├── prompt: string
  └── expectedVocabulary: string[]

/users/{uid}/profile/data
  ├── name: string
  ├── email: string
  ├── streak: number
  ├── lastActiveDate: string (ISO date)
  └── joinedAt: Timestamp

/users/{uid}/sessions/{sessionId}
  ├── taskTitle: string
  ├── taskId: string
  ├── taskLevel: string
  ├── date: Timestamp
  ├── exchanges: [{userSaid, aiReply}]
  ├── corrections: [{userSaid, correction, betterSentence, explanation}]
  ├── exchangeCount: number
  └── correctionCount: number
```

---

## 🤖 AI Coaching Prompt

The Gemini API receives this prompt for each speech exchange:

```
You are a friendly English speaking coach. The student was given this task: "{task}".
They said: "{speech}".

CORRECTION: (grammar fixes)
EXPLANATION: (why it was wrong)
BETTER SENTENCE: (more natural version)
AI REPLY: (continue the conversation naturally)
```

---

Made with ❤️ using React, Firebase & Google Gemini
