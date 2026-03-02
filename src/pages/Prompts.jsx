import { useState, useMemo, useCallback } from 'react';
import {
  Shuffle, Bookmark, BookmarkCheck, ArrowRight,
  Sparkles, ChevronDown, ChevronUp, Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import curatedPrompts, { CATEGORIES } from '../data/curatedPrompts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCatState, XP_REWARDS } from '../hooks/useCatState';

// ── helpers ────────────────────────────────────────────────

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getPromptOfTheDay(allPrompts, seenIds) {
  // Deterministic per calendar day, avoids already-seen when possible
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const unseen = allPrompts.filter((p) => !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : allPrompts;
  const idx = Math.floor(seededRandom(seed) * pool.length);
  return pool[idx];
}

function pickRandom(allPrompts, excludeId, seenIds) {
  const unseen = allPrompts.filter((p) => p.id !== excludeId && !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : allPrompts.filter((p) => p.id !== excludeId);
  if (pool.length === 0) return allPrompts[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

const STATUS_BADGE = {
  seen: 'bg-gray-100 text-gray-500',
  saved: 'bg-indigo-100 text-indigo-700',
  used: 'bg-emerald-100 text-emerald-700',
};

// ── Prompt Card ────────────────────────────────────────────

function PromptCard({ prompt, tracking, onSave, onUse, onMarkSeen, compact }) {
  const isSaved = tracking.saved.includes(prompt.id);
  const isUsed = tracking.used.includes(prompt.id);

  return (
    <div className={`bg-white rounded-2xl shadow border border-gray-100 ${compact ? 'p-4' : 'p-6'}`}>
      <p className={`text-gray-900 ${compact ? 'text-sm' : 'text-lg'} font-medium leading-relaxed`}>
        &ldquo;{prompt.text}&rdquo;
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prompt.suggestedType}</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prompt.suggestedPlatform}</span>
        {prompt.categoryLabel && (
          <span className="bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{prompt.categoryLabel || prompt.category}</span>
        )}
        {tracking.seen.includes(prompt.id) && (
          <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE.seen}`}>Seen</span>
        )}
        {isSaved && <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE.saved}`}>Saved</span>}
        {isUsed && <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE.used}`}>Used</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            onSave(prompt.id);
            onMarkSeen(prompt.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isSaved
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => {
            onUse(prompt);
            onMarkSeen(prompt.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Use as Entry
        </button>
      </div>
    </div>
  );
}

// ── Prompt of the Day ──────────────────────────────────────

function PromptOfTheDay({ allPrompts, tracking, onSave, onUse, onMarkSeen }) {
  const [current, setCurrent] = useState(() => getPromptOfTheDay(allPrompts, tracking.seen));

  function handleAnother() {
    const next = pickRandom(allPrompts, current.id, tracking.seen);
    setCurrent(next);
    onMarkSeen(next.id);
  }

  if (!current) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">
        <Sparkles className="w-4 h-4" />
        Prompt of the Day
      </div>

      <p className="text-xl font-semibold leading-relaxed mb-1">
        &ldquo;{current.text}&rdquo;
      </p>

      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        <span className="bg-white/20 px-2 py-0.5 rounded-full">{current.suggestedType}</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full">{current.suggestedPlatform}</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full">{current.category}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => {
            onSave(current.id);
            onMarkSeen(current.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
        >
          {tracking.saved.includes(current.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {tracking.saved.includes(current.id) ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => {
            onUse(current);
            onMarkSeen(current.id);
          }}
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
          Give me another
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function Prompts() {
  const navigate = useNavigate();
  const { addXP } = useCatState();
  const [tracking, setTracking] = useLocalStorage('content-cat-prompt-tracking', {
    seen: [],
    saved: [],
    used: [],
  });
  const [customCategories] = useLocalStorage('content-cat-custom-categories', []);
  const [expandedCat, setExpandedCat] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'saved' | 'used'

  // Merge curated + custom prompts
  const allPrompts = useMemo(() => {
    const custom = customCategories.flatMap((cat) =>
      (cat.prompts || []).map((p) => ({
        ...p,
        category: cat.name,
        categoryLabel: cat.name,
      })),
    );
    return [...curatedPrompts, ...custom];
  }, [customCategories]);

  const allCategories = useMemo(() => {
    const custom = customCategories.map((c) => c.name);
    return [...CATEGORIES, ...custom];
  }, [customCategories]);

  // ── actions ──────────────────────────────────────────────

  const markSeen = useCallback(
    (id) => {
      setTracking((prev) => {
        if (prev.seen.includes(id)) return prev;
        return { ...prev, seen: [...prev.seen, id] };
      });
    },
    [setTracking],
  );

  const toggleSave = useCallback(
    (id) => {
      setTracking((prev) => ({
        ...prev,
        saved: prev.saved.includes(id) ? prev.saved.filter((x) => x !== id) : [...prev.saved, id],
      }));
    },
    [setTracking],
  );

  const convertToEntry = useCallback(
    (prompt) => {
      setTracking((prev) => ({
        ...prev,
        used: prev.used.includes(prompt.id) ? prev.used : [...prev.used, prompt.id],
      }));

      // Create a content entry in localStorage and navigate to log
      const raw = window.localStorage.getItem('content-cat-entries');
      const entries = raw ? JSON.parse(raw) : [];
      const newEntry = {
        id: crypto.randomUUID(),
        title: prompt.text,
        type: prompt.suggestedType || '',
        platform: prompt.suggestedPlatform || '',
        status: 'Idea',
        tags: [prompt.category],
        notes: `From prompt: "${prompt.text}"`,
        createdAt: new Date().toISOString(),
        postedAt: null,
      };
      entries.unshift(newEntry);
      window.localStorage.setItem('content-cat-entries', JSON.stringify(entries));
      addXP(XP_REWARDS.COMPLETE_PROMPT);
      navigate('/log');
    },
    [setTracking, navigate, addXP],
  );

  // ── filtered prompts for tabs ────────────────────────────

  const visiblePrompts = useMemo(() => {
    if (filterTab === 'saved') return allPrompts.filter((p) => tracking.saved.includes(p.id));
    if (filterTab === 'used') return allPrompts.filter((p) => tracking.used.includes(p.id));
    return allPrompts;
  }, [filterTab, allPrompts, tracking]);

  const groupedByCategory = useMemo(() => {
    const map = {};
    for (const p of visiblePrompts) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [visiblePrompts]);

  // ── stats bar ────────────────────────────────────────────

  const stats = {
    total: allPrompts.length,
    seen: tracking.seen.length,
    saved: tracking.saved.length,
    used: tracking.used.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Prompts</h1>
        <button
          onClick={() => navigate('/prompts/custom')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Custom Categories
        </button>
      </div>

      {/* Prompt of the Day */}
      {allPrompts.length > 0 && (
        <PromptOfTheDay
          allPrompts={allPrompts}
          tracking={tracking}
          onSave={toggleSave}
          onUse={convertToEntry}
          onMarkSeen={markSeen}
        />
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Eye className="w-4 h-4" /> {stats.seen} seen
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600">
          <Bookmark className="w-4 h-4" /> {stats.saved} saved
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <ArrowRight className="w-4 h-4" /> {stats.used} used
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'All Prompts' },
          { key: 'saved', label: 'Saved' },
          { key: 'used', label: 'Used' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterTab === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories accordion */}
      {allCategories.map((cat) => {
        const prompts = groupedByCategory[cat];
        if (!prompts || prompts.length === 0) return null;
        const isOpen = expandedCat === cat;

        return (
          <div key={cat} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedCat(isOpen ? null : cat)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{cat}</h2>
                <p className="text-sm text-gray-500">{prompts.length} prompts</p>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="px-6 pb-5 space-y-3 border-t border-gray-100 pt-4">
                {prompts.map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    tracking={tracking}
                    onSave={toggleSave}
                    onUse={convertToEntry}
                    onMarkSeen={markSeen}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state for filtered views */}
      {filterTab !== 'all' && Object.keys(groupedByCategory).length === 0 && (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          <p>No {filterTab} prompts yet.</p>
        </div>
      )}
    </div>
  );
}
