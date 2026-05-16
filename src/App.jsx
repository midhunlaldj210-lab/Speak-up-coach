import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import PracticeScreen from './screens/PracticeScreen';
import ProgressScreen from './screens/ProgressScreen';
import SentenceStructureScreen from './screens/SentenceStructureScreen';
import GrammarTrainerScreen from './screens/GrammarTrainerScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import PronunciationScreen from './screens/PronunciationScreen';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/:taskId"
              element={
                <ProtectedRoute>
                  <PracticeScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressScreen />
                </ProtectedRoute>
              }
            />

            {/* Learning Hub Routes */}
            <Route
              path="/learn/sentence"
              element={<ProtectedRoute><SentenceStructureScreen /></ProtectedRoute>}
            />
            <Route
              path="/learn/grammar"
              element={<ProtectedRoute><GrammarTrainerScreen /></ProtectedRoute>}
            />
            <Route
              path="/learn/vocabulary"
              element={<ProtectedRoute><VocabularyScreen /></ProtectedRoute>}
            />
            <Route
              path="/learn/pronunciation"
              element={<ProtectedRoute><PronunciationScreen /></ProtectedRoute>}
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}
