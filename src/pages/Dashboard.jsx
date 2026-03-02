import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Plus, ArrowRight, Sparkles, Shuffle,
  Bookmark, BookmarkCheck,
} from 'lucide-react';
import VirtualCat from '../components/VirtualCat';
import { useCatState, XP_REWARDS } from '../hooks/useCatState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import curatedPrompts, { CATEGORIES } from '../data/curatedPrompts';

// ── helpers ────────────────────────────────────────────────

const LEVEL_NAMES = { 1: 'Kitten', 2: 'Young Cat', 3: 'Cool Cat', 4: 'Wise Cat', 5: 'Legendary Cat' };

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getPromptOfTheDay(allPrompts, seenIds) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const unseen = allPrompts.filter((p) => !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : allPrompts;
  return pool[Math.floor(seededRandom(seed) * pool.length)];
}

function pickRandom(allPrompts, excludeId, seenIds) {
  const unseen = allPrompts.filter((p) => p.id !== excludeId && !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : allPrompts.filter((p) => p.id !== excludeId);
  if (pool.length === 0) return allPrompts[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

const STATUS_STYLES = {
  Idea: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Posted: 'bg-emerald-100 text-emerald-700',
};

// ── Dashboard ──────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const catState = useCatState();
  const { catName, xp, level, mood, streak, xpProgress, addXP } = catState;
  const [entries] = useLocalStorage('content-cat-entries', []);
  const [tracking, setTracking] = useLocalStorage('content-cat-prompt-tracking', {
    seen: [],
    saved: [],
    used: [],
  });
  const [customCategories] = useLocalStorage('content-cat-custom-categories', []);

  // Merge curated + custom prompts
  const allPrompts = useMemo(() => {
    const custom = customCategories.flatMap((cat) =>
      (cat.prompts || []).map((p) => ({ ...p, category: cat.name })),
    );
    return [...curatedPrompts, ...custom];
  }, [customCategories]);

  const [potd, setPotd] = useState(() => getPromptOfTheDay(allPrompts, tracking.seen));

  // 3 most recent entries
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 3);
  }, [entries]);

  // ── POTD actions ─────────────────────────────────────────

  const markSeen = useCallback(
    (id) => setTracking((prev) => {
      if (prev.seen.includes(id)) return prev;
      return { ...prev, seen: [...prev.seen, id] };
    }),
    [setTracking],
  );

  const toggleSave = useCallback(
    (id) => setTracking((prev) => ({
      ...prev,
      saved: prev.saved.includes(id) ? prev.saved.filter((x) => x !== id) : [...prev.saved, id],
    })),
    [setTracking],
  );

  const convertToEntry = useCallback(
    (prompt) => {
      setTracking((prev) => ({
        ...prev,
        used: prev.used.includes(prompt.id) ? prev.used : [...prev.used, prompt.id],
      }));
      const raw = window.localStorage.getItem('content-cat-entries');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: crypto.randomUUID(),
        title: prompt.text,
        type: prompt.suggestedType || '',
        platform: prompt.suggestedPlatform || '',
        status: 'Idea',
        tags: [prompt.category],
        notes: `From prompt: "${prompt.text}"`,
        createdAt: new Date().toISOString(),
        postedAt: null,
      });
      window.localStorage.setItem('content-cat-entries', JSON.stringify(list));
      addXP(XP_REWARDS.COMPLETE_PROMPT);
      navigate('/log');
    },
    [setTracking, navigate, addXP],
  );

  const handleAnother = () => {
    const next = pickRandom(allPrompts, potd?.id, tracking.seen);
    setPotd(next);
    if (next) markSeen(next.id);
  };

  const isSaved = potd && tracking.saved.includes(potd.id);

  return (
    <div className="space-y-6">
      {/* ── Cat hero section ──────────────────────────── */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row items-center gap-6">
        <VirtualCat level={level} mood={mood} size={160} />

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{catName}</h1>
          <p className="text-sm text-gray-500">
            Level {level} · {LEVEL_NAMES[level]}
          </p>

          {/* XP bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{xp} XP</span>
              {level < 5 ? (
                <span>{xpProgress.current} / {xpProgress.needed} to Level {level + 1}</span>
              ) : (
                <span>Max Level!</span>
              )}
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round(xpProgress.progress * 100)}%` }}
              />
            </div>
          </div>

          {/* Streak + mood */}
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Flame className="w-4 h-4" />
              {streak} day streak
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Mood: {mood}</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions row ─────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/log')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
        <button
          onClick={() => navigate('/prompts')}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Browse Prompts
        </button>
      </div>

      {/* ── Prompt of the Day ─────────────────────────── */}
      {potd && (
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">
            <Sparkles className="w-4 h-4" />
            Prompt of the Day
          </div>
          <p className="text-lg font-semibold leading-relaxed">
            &ldquo;{potd.text}&rdquo;
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{potd.suggestedType}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{potd.suggestedPlatform}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => { toggleSave(potd.id); markSeen(potd.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => { convertToEntry(potd); markSeen(potd.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Use as Entry
            </button>
            <button
              onClick={handleAnother}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors ml-auto"
            >
              <Shuffle className="w-4 h-4" />
              Another
            </button>
          </div>
        </div>
      )}

      {/* ── Recent entries ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
          {entries.length > 3 && (
            <button
              onClick={() => navigate('/log')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all
            </button>
          )}
        </div>
        {recentEntries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500 text-sm">
            No entries yet. Add your first one!
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate('/log')}
                className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                  <p className="text-xs text-gray-400">
                    {entry.type || 'No type'} · {entry.platform || 'No platform'}
                    {entry.createdAt && <> · {new Date(entry.createdAt).toLocaleDateString()}</>}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[entry.status] || 'bg-gray-100 text-gray-500'}`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
