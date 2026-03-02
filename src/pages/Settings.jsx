import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Check } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCatState } from '../hooks/useCatState';
import { CATEGORIES } from '../data/curatedPrompts';

const STORAGE_KEYS = [
  'content-cat-state',
  'content-cat-entries',
  'content-cat-prompt-tracking',
  'content-cat-custom-categories',
  'content-cat-active-categories',
  'content-cat-onboarded',
];

export default function Settings() {
  const { catName, setCatName } = useCatState();
  const [activeCategories, setActiveCategories] = useLocalStorage('content-cat-active-categories', CATEGORIES);
  const [nameInput, setNameInput] = useState(catName);
  const [showReset, setShowReset] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef(null);

  // ── Rename cat ──────────────────────────────────────────

  function handleRename() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== catName) {
      setCatName(trimmed);
    }
  }

  // ── Manage categories ───────────────────────────────────

  function toggleCategory(cat) {
    setActiveCategories((prev) => {
      if (prev.includes(cat)) {
        const next = prev.filter((c) => c !== cat);
        return next.length > 0 ? next : prev; // keep at least one
      }
      return [...prev, cat];
    });
  }

  // ── Export ───────────────────────────────────────────────

  function exportData() {
    const data = {};
    for (const key of STORAGE_KEYS) {
      const val = window.localStorage.getItem(key);
      if (val !== null) data[key] = JSON.parse(val);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-cat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ──────────────────────────────────────────────

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        for (const key of STORAGE_KEYS) {
          if (data[key] !== undefined) {
            window.localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
        setImportMsg('Data imported successfully! Reloading…');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        setImportMsg('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // ── Reset ───────────────────────────────────────────────

  function resetAll() {
    for (const key of STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl shadow divide-y">
        {/* ── Rename Cat ──────────────────────────────── */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Cat Name</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">Rename your content companion.</p>
          <div className="flex gap-2 max-w-xs">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleRename}
              disabled={!nameInput.trim() || nameInput.trim() === catName}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>

        {/* ── Active Categories ────────────────────────── */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Active Categories</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Choose which curated categories appear in prompt rotation.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Export ───────────────────────────────────── */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Export Data</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Download a JSON backup of all your data.
          </p>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        {/* ── Import ──────────────────────────────────── */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Import Data</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Restore from a previously exported JSON backup.
          </p>
          <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </button>
          {importMsg && <p className="text-sm text-green-600 mt-2">{importMsg}</p>}
        </div>

        {/* ── Danger Zone ─────────────────────────────── */}
        <div className="p-6">
          <h2 className="font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Clear all stored data. This action cannot be undone.
          </p>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-600 font-medium">Are you sure?</span>
              <button
                onClick={resetAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
