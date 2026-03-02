import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// ── XP thresholds ──────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 50, 150, 400, 1000]; // L1→L5

export function xpToLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(xp) {
  const level = xpToLevel(xp);
  if (level >= 5) return { current: xp, needed: LEVEL_THRESHOLDS[4], progress: 1 };
  const floor = LEVEL_THRESHOLDS[level - 1];
  const ceiling = LEVEL_THRESHOLDS[level];
  return {
    current: xp - floor,
    needed: ceiling - floor,
    progress: (xp - floor) / (ceiling - floor),
  };
}

// ── Mood logic ─────────────────────────────────────────────

const MOODS = ['Sad', 'Meh', 'Happy', 'Thriving', 'On Fire'];

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / 86400000);
}

export function computeMood(lastActiveDate) {
  if (!lastActiveDate) return 'Sad';
  const inactive = daysBetween(lastActiveDate, new Date().toISOString());
  // Mood index: start at Happy (2), decay by 1 per inactive day
  const idx = Math.max(0, 2 - inactive);
  return MOODS[idx];
}

export function setActiveMood() {
  // When user is active today, mood is Happy (or stays if already higher)
  return 'Happy';
}

// ── Streak logic ───────────────────────────────────────────

function isSameDay(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(a, b) {
  return daysBetween(a, b) === 1;
}

// ── Hook ───────────────────────────────────────────────────

const DEFAULT_STATE = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  moodOverride: null, // null means auto-compute
  catName: 'Whiskers',
};

export function useCatState() {
  const [state, setState] = useLocalStorage('content-cat-state', DEFAULT_STATE);

  const today = new Date().toISOString().slice(0, 10);
  const isActiveToday = state.lastActiveDate && isSameDay(state.lastActiveDate, today);

  // Auto-compute mood with decay
  const mood = useMemo(() => {
    if (isActiveToday) {
      // Active today: base is Happy, but can be boosted
      const streak = state.streak;
      if (streak >= 7) return 'On Fire';
      if (streak >= 3) return 'Thriving';
      return 'Happy';
    }
    return computeMood(state.lastActiveDate);
  }, [isActiveToday, state.lastActiveDate, state.streak]);

  const level = xpToLevel(state.xp);
  const xpProgress = xpForNextLevel(state.xp);

  // Record activity and grant XP
  const addXP = useCallback(
    (amount) => {
      setState((prev) => {
        const now = new Date().toISOString();
        let newStreak = prev.streak;
        let streakBonus = 0;

        if (!prev.lastActiveDate || !isSameDay(prev.lastActiveDate, now)) {
          // New day of activity
          if (prev.lastActiveDate && isYesterday(prev.lastActiveDate, now)) {
            newStreak = prev.streak + 1;
          } else if (!prev.lastActiveDate || !isSameDay(prev.lastActiveDate, now)) {
            newStreak = 1;
          }
          streakBonus = 5; // daily streak bonus
        }

        const newXP = prev.xp + amount + streakBonus;
        return {
          ...prev,
          xp: newXP,
          streak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastActiveDate: now,
        };
      });
    },
    [setState],
  );

  const setCatName = useCallback(
    (name) => setState((prev) => ({ ...prev, catName: name })),
    [setState],
  );

  return {
    ...state,
    mood,
    level,
    xpProgress,
    isActiveToday,
    addXP,
    setCatName,
    setState,
  };
}

export const XP_REWARDS = {
  LOG_CONTENT: 10,
  IN_PROGRESS: 5,
  POSTED: 20,
  COMPLETE_PROMPT: 15,
};
