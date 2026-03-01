import { useState, useMemo } from 'react';
import { Plus, X, Search, ArrowUpDown, Pencil, Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CONTENT_TYPES = ['Photography', 'Short-Form Video', 'Long-Form Video', 'Blog Post'];
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Substack'];
const STATUSES = ['Idea', 'In Progress', 'Posted'];

const TYPE_TO_PLATFORM = {
  'Photography': 'Instagram',
  'Short-Form Video': 'TikTok',
  'Long-Form Video': 'YouTube',
  'Blog Post': 'Substack',
};

const STATUS_STYLES = {
  'Idea': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Posted': 'bg-emerald-100 text-emerald-700',
};

const EMPTY_ENTRY = {
  title: '',
  type: '',
  platform: '',
  status: 'Idea',
  tags: [],
  notes: '',
};

// ── Tag Input ──────────────────────────────────────────────

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  function addTag(value) {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm px-2.5 py-0.5 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="hover:text-indigo-900"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={tags.length ? '' : 'Type and press Enter…'}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}

// ── Entry Form Modal ───────────────────────────────────────

function EntryFormModal({ entry, onSave, onClose }) {
  const [form, setForm] = useState(entry || EMPTY_ENTRY);

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-suggest platform when type changes and platform hasn't been manually set
      if (field === 'type' && TYPE_TO_PLATFORM[value]) {
        if (!prev.platform || prev.platform === TYPE_TO_PLATFORM[prev.type]) {
          next.platform = TYPE_TO_PLATFORM[value];
        }
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  const isEditing = !!entry?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12 px-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. Morning routine reel"
            />
          </div>

          {/* Type & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="">Select…</option>
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
                {form.type && TYPE_TO_PLATFORM[form.type] === form.platform && (
                  <span className="ml-1 text-xs text-indigo-500 font-normal">(suggested)</span>
                )}
              </label>
              <select
                value={form.platform}
                onChange={(e) => set('platform', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="">Select…</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.status === s
                      ? STATUS_STYLES[s]
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <TagInput tags={form.tags} onChange={(tags) => set('tags', tags)} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="Any additional notes…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function ContentLog() {
  const [entries, setEntries] = useLocalStorage('content-cat-entries', []);
  const [editing, setEditing] = useState(null);   // null | 'new' | entry object
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // ── Helpers ────────────────────────────────────────────

  function saveEntry(form) {
    if (editing && editing.id) {
      // Update existing
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== editing.id) return e;
          const updated = { ...e, ...form };
          // Track postedAt
          if (form.status === 'Posted' && e.status !== 'Posted') {
            updated.postedAt = new Date().toISOString();
          } else if (form.status !== 'Posted') {
            updated.postedAt = null;
          }
          return updated;
        }),
      );
    } else {
      // Create new
      const newEntry = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        postedAt: form.status === 'Posted' ? new Date().toISOString() : null,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
    setEditing(null);
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  // ── Filtered & sorted list ─────────────────────────────

  const filtered = useMemo(() => {
    let list = entries;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.notes.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filterType) list = list.filter((e) => e.type === filterType);
    if (filterPlatform) list = list.filter((e) => e.platform === filterPlatform);
    if (filterStatus) list = list.filter((e) => e.status === filterStatus);

    list = [...list].sort((a, b) => {
      let av = a[sortField] || '';
      let bv = b[sortField] || '';
      if (sortField === 'createdAt' || sortField === 'postedAt') {
        av = av || '0';
        bv = bv || '0';
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [entries, search, filterType, filterPlatform, filterStatus, sortField, sortDir]);

  const hasActiveFilters = filterType || filterPlatform || filterStatus;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Log</h1>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Search & Filter bar */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, notes, or tags…"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </button>
          </div>

          {/* Dropdown filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Types</option>
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterPlatform('');
                    setFilterStatus('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          <p>No content entries yet. Click &ldquo;Add Entry&rdquo; to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          <p>No entries match your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_140px_120px_100px_48px] gap-4 items-center px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button onClick={() => toggleSort('title')} className="flex items-center gap-1 text-left hover:text-gray-700">
              Title <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => toggleSort('type')} className="flex items-center gap-1 text-left hover:text-gray-700">
              Type <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => toggleSort('platform')} className="flex items-center gap-1 text-left hover:text-gray-700">
              Platform <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-left hover:text-gray-700">
              Status <ArrowUpDown className="w-3 h-3" />
            </button>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="group grid grid-cols-1 sm:grid-cols-[1fr_140px_120px_100px_48px] gap-y-1 sm:gap-4 items-center px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setEditing(entry)}
            >
              {/* Title + meta */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString()}
                  {entry.postedAt && (
                    <> · Posted {new Date(entry.postedAt).toLocaleDateString()}</>
                  )}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Type */}
              <span className="text-sm text-gray-600 hidden sm:block truncate">{entry.type || '—'}</span>

              {/* Platform */}
              <span className="text-sm text-gray-600 hidden sm:block">{entry.platform || '—'}</span>

              {/* Status badge */}
              <span className={`inline-flex self-start sm:self-center text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[entry.status]}`}>
                {entry.status}
              </span>

              {/* Edit icon */}
              <Pencil className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 hidden sm:block transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {entries.length > 0 && (
        <p className="text-sm text-gray-400 text-right">
          Showing {filtered.length} of {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      )}

      {/* Modal */}
      {editing && (
        <EntryFormModal
          entry={editing === 'new' ? null : editing}
          onSave={saveEntry}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
