import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

const DEFAULT_MODULE_PROGRESS = (id) => ({
  unlocked: id === 1,
  completed: false,
  unlockedDate: id === 1 ? new Date().toISOString() : null,
  completedDate: null,
  quizScore: null,
  lessonsRead: [],
  exercisesDone: []
});

export function defaultMasterclassProgress() {
  const moduleProgress = {};
  for (let i = 1; i <= 6; i++) {
    moduleProgress[`module${i}`] = DEFAULT_MODULE_PROGRESS(i);
  }
  return {
    enrolledDate: new Date().toISOString(),
    currentModule: 1,
    overallProgress: 0,
    moduleProgress
  };
}

export async function getMasterclassProgress(uid) {
  const ref = doc(db, 'users', uid, 'masterclass', 'progress');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const init = defaultMasterclassProgress();
    await setDoc(ref, init);
    return init;
  }
  const data = snap.data();
  // Check time-based unlocks
  const updated = checkTimeUnlocks(data);
  if (updated.changed) {
    await updateDoc(ref, { moduleProgress: updated.moduleProgress, overallProgress: updated.overallProgress });
  }
  return updated;
}

function checkTimeUnlocks(data) {
  const { enrolledDate, moduleProgress } = data;
  const enrolled = new Date(enrolledDate);
  const now = new Date();
  const daysSince = Math.floor((now - enrolled) / (1000 * 60 * 60 * 24));
  const unlockDays = [0, 7, 14, 21, 28, 35];
  let changed = false;
  const mp = { ...moduleProgress };

  unlockDays.forEach((day, idx) => {
    const key = `module${idx + 1}`;
    if (!mp[key]?.unlocked && daysSince >= day) {
      mp[key] = { ...mp[key], unlocked: true, unlockedDate: new Date().toISOString() };
      changed = true;
    }
  });

  const total = Object.values(mp).filter(m => m.completed).length;
  const overallProgress = Math.round((total / 6) * 100);

  return { ...data, moduleProgress: mp, overallProgress, changed };
}

export async function markLessonRead(uid, moduleId, lessonId) {
  const ref = doc(db, 'users', uid, 'masterclass', 'progress');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const key = `module${moduleId}`;
  const lessons = data.moduleProgress[key]?.lessonsRead || [];
  if (!lessons.includes(lessonId)) {
    await updateDoc(ref, {
      [`moduleProgress.${key}.lessonsRead`]: [...lessons, lessonId],
      currentModule: moduleId
    });
  }
}

export async function markExerciseDone(uid, moduleId, exerciseId) {
  const ref = doc(db, 'users', uid, 'masterclass', 'progress');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const key = `module${moduleId}`;
  const done = data.moduleProgress[key]?.exercisesDone || [];
  if (!done.includes(exerciseId)) {
    await updateDoc(ref, {
      [`moduleProgress.${key}.exercisesDone`]: [...done, exerciseId]
    });
  }
}

export async function saveQuizScore(uid, moduleId, score) {
  const ref = doc(db, 'users', uid, 'masterclass', 'progress');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const key = `module${moduleId}`;
  const mp = data.moduleProgress;
  const lessons = mp[key]?.lessonsRead || [];
  const exercises = mp[key]?.exercisesDone || [];
  const totalLessons = 3;
  const allDone = lessons.length >= totalLessons && exercises.length >= totalLessons;
  const passed = score >= 60;
  const completed = allDone && passed;

  const updates = {
    [`moduleProgress.${key}.quizScore`]: score,
    [`moduleProgress.${key}.completed`]: completed
  };

  if (completed) {
    updates[`moduleProgress.${key}.completedDate`] = new Date().toISOString();
    // Unlock next module
    if (moduleId < 6) {
      const nextKey = `module${moduleId + 1}`;
      updates[`moduleProgress.${nextKey}.unlocked`] = true;
      updates[`moduleProgress.${nextKey}.unlockedDate`] = new Date().toISOString();
    }
    const completedCount = Object.values(mp).filter(m => m.completed).length + 1;
    updates['overallProgress'] = Math.round((completedCount / 6) * 100);
  }

  await updateDoc(ref, updates);
  return completed;
}

export async function issueCertificate(uid, userName, finalScore) {
  const certId = 'SPK-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const ref = doc(db, 'users', uid, 'certificate', 'data');
  await setDoc(ref, {
    issued: true,
    issuedDate: new Date().toISOString(),
    certificateId: certId,
    finalScore,
    userName
  });
  return certId;
}

export async function getCertificate(uid) {
  const ref = doc(db, 'users', uid, 'certificate', 'data');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
