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
import MasterclassScreen from './screens/MasterclassScreen';
import ModuleScreen from './screens/ModuleScreen';
import CertificateScreen from './screens/CertificateScreen';
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

            {/* Masterclass Routes */}
            <Route path="/masterclass" element={<ProtectedRoute><MasterclassScreen /></ProtectedRoute>} />
            <Route path="/masterclass/module/:id" element={<ProtectedRoute><ModuleScreen /></ProtectedRoute>} />
            <Route path="/masterclass/certificate" element={<ProtectedRoute><CertificateScreen /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}
