import { useMemo } from 'react';
import { Flame, Trophy, FileText, Eye, Bookmark, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCatState } from '../hooks/useCatState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Stats() {
  const [entries] = useLocalStorage('content-cat-entries', []);
  const [tracking] = useLocalStorage('content-cat-prompt-tracking', { seen: [], saved: [], used: [] });
  const { streak, longestStreak } = useCatState();

  // ── Content by Type ──────────────────────────────────────

  const byType = useMemo(() => {
    const map = {};
    for (const e of entries) {
      const t = e.type || 'Unset';
      map[t] = (map[t] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [entries]);

  // ── Content by Platform ──────────────────────────────────

  const byPlatform = useMemo(() => {
    const map = {};
    for (const e of entries) {
      const p = e.platform || 'Unset';
      map[p] = (map[p] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [entries]);

  // ── Posts per week (last 8 weeks) ────────────────────────

  const perWeek = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = entries.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks.push({ name: label, posts: count });
    }
    return weeks;
  }, [entries]);

  // ── Most active day ──────────────────────────────────────

  const mostActiveDay = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const e of entries) {
      counts[new Date(e.createdAt).getDay()]++;
    }
    const maxIdx = counts.indexOf(Math.max(...counts));
    return entries.length > 0 ? DAYS[maxIdx] : '—';
  }, [entries]);

  const isEmpty = entries.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Stats</h1>

      {/* ── Overview cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <FileText className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
          <p className="text-xs text-gray-500">Total Entries</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <Flame className="w-6 h-6 mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{streak}</p>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{longestStreak}</p>
          <p className="text-xs text-gray-500">Longest Streak</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-lg font-bold text-gray-900 mt-1">{mostActiveDay}</p>
          <p className="text-xs text-gray-500 mt-0.5">Most Active Day</p>
        </div>
      </div>

      {/* ── Prompt engagement ─────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-lg font-bold text-gray-900">{tracking.seen.length}</p>
            <p className="text-xs text-gray-500">Prompts Seen</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <Bookmark className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-lg font-bold text-gray-900">{tracking.saved.length}</p>
            <p className="text-xs text-gray-500">Saved</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <ArrowRight className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-lg font-bold text-gray-900">{tracking.used.length}</p>
            <p className="text-xs text-gray-500">Used</p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          <p>Start logging content to see your charts here.</p>
        </div>
      ) : (
        <>
          {/* ── Content by Type ──────────────────────── */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content by Type</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Content by Platform ──────────────────── */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content by Platform</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byPlatform}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Posts per Week ───────────────────────── */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts per Week</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={perWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
