import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create or update user profile in Firestore
  async function ensureUserProfile(firebaseUser, displayName) {
    const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'data');
    const snap = await getDoc(profileRef);

    const today = new Date().toISOString().split('T')[0];

    if (!snap.exists()) {
      const newProfile = {
        name: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner',
        email: firebaseUser.email,
        streak: 1,
        lastActiveDate: today,
        joinedAt: serverTimestamp(),
      };
      await setDoc(profileRef, newProfile);
      setUserProfile(newProfile);
      return newProfile;
    } else {
      const profile = snap.data();
      // Update streak if day changed
      const updatedProfile = await updateStreakIfNeeded(firebaseUser.uid, profile, today);
      setUserProfile(updatedProfile);
      return updatedProfile;
    }
  }

  async function updateStreakIfNeeded(uid, profile, today) {
    const lastActive = profile.lastActiveDate;
    if (lastActive === today) return profile;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreak = lastActive === yesterdayStr ? (profile.streak || 0) + 1 : 1;
    const updated = { ...profile, streak: newStreak, lastActiveDate: today };

    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    await updateDoc(profileRef, { streak: newStreak, lastActiveDate: today });
    return updated;
  }

  // Auth methods
  async function login(email, password) {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(fbUser);
    return fbUser;
  }

  async function signup(email, password, name) {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName: name });
    await ensureUserProfile(fbUser, name);
    return fbUser;
  }

  async function loginWithGoogle() {
    const { user: fbUser } = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(fbUser);
    return fbUser;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
    const snap = await getDoc(profileRef);
    if (snap.exists()) setUserProfile(snap.data());
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        await ensureUserProfile(fbUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
