import { useState } from 'react';
import { Plus, Trash2, Pencil, X, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

const EMPTY_CATEGORY = { name: '', description: '', prompts: [] };

// ── Prompt list editor ─────────────────────────────────────

function PromptEditor({ prompts, onChange }) {
  const [draft, setDraft] = useState({ text: '', suggestedType: '', suggestedPlatform: '' });

  function addPrompt() {
    if (!draft.text.trim()) return;
    onChange([
      ...prompts,
      {
        id: `custom-${crypto.randomUUID()}`,
        text: draft.text.trim(),
        suggestedType: draft.suggestedType || 'Short-Form Video',
        suggestedPlatform: draft.suggestedPlatform || 'TikTok',
      },
    ]);
    setDraft({ text: '', suggestedType: '', suggestedPlatform: '' });
  }

  return (
    <div className="space-y-3">
      {prompts.map((p, i) => (
        <div key={p.id} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 flex-1">&ldquo;{p.text}&rdquo;</p>
          <div className="flex flex-col items-end gap-1 text-xs text-gray-400 shrink-0">
            <span>{p.suggestedType}</span>
            <span>{p.suggestedPlatform}</span>
          </div>
          <button
            onClick={() => onChange(prompts.filter((_, j) => j !== i))}
            className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add new prompt */}
      <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
        <textarea
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          placeholder="Write a thought-provoking prompt…"
          rows={2}
          className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={draft.suggestedType}
            onChange={(e) => setDraft({ ...draft, suggestedType: e.target.value })}
            className="text-sm rounded-lg border border-gray-300 px-2 py-1 bg-white outline-none"
          >
            <option value="">Type…</option>
            <option>Photography</option>
            <option>Short-Form Video</option>
            <option>Long-Form Video</option>
            <option>Blog Post</option>
          </select>
          <select
            value={draft.suggestedPlatform}
            onChange={(e) => setDraft({ ...draft, suggestedPlatform: e.target.value })}
            className="text-sm rounded-lg border border-gray-300 px-2 py-1 bg-white outline-none"
          >
            <option value="">Platform…</option>
            <option>Instagram</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>LinkedIn</option>
            <option>Substack</option>
          </select>
          <button
            onClick={addPrompt}
            disabled={!draft.text.trim()}
            className="ml-auto flex items-center gap-1 px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Form Modal ────────────────────────────────────

function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState(
    category || { ...EMPTY_CATEGORY, prompts: [] },
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      id: form.id || `cat-${crypto.randomUUID()}`,
      name: form.name.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12 px-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Tech & Innovation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="A short description of this category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompts ({form.prompts.length})
            </label>
            <PromptEditor
              prompts={form.prompts}
              onChange={(prompts) => setForm({ ...form, prompts })}
            />
          </div>
        </div>

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
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function CustomCategories() {
  const [categories, setCategories] = useLocalStorage('content-cat-custom-categories', []);
  const [editing, setEditing] = useState(null); // null | 'new' | category object
  const [expanded, setExpanded] = useState(null);

  function saveCategory(form) {
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === form.id);
      if (exists) return prev.map((c) => (c.id === form.id ? form : c));
      return [...prev, form];
    });
    setEditing(null);
  }

  function deleteCategory(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/prompts" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex-1">Custom Categories</h1>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          <p>No custom categories yet. Create one to add your own prompts to the rotation.</p>
        </div>
      ) : (
        categories.map((cat) => {
          const isOpen = expanded === cat.id;
          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4">
                <button
                  onClick={() => setExpanded(isOpen ? null : cat.id)}
                  className="flex-1 text-left"
                >
                  <h2 className="text-lg font-semibold text-gray-900">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{cat.prompts.length} prompts</p>
                </button>

                <button
                  onClick={() => setEditing(cat)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setExpanded(isOpen ? null : cat.id)} className="text-gray-400">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {isOpen && cat.prompts.length > 0 && (
                <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-2">
                  {cat.prompts.map((p) => (
                    <div key={p.id} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 flex-1">&ldquo;{p.text}&rdquo;</p>
                      <div className="text-xs text-gray-400 shrink-0 text-right">
                        <span>{p.suggestedType}</span>
                        <br />
                        <span>{p.suggestedPlatform}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal */}
      {editing && (
        <CategoryModal
          category={editing === 'new' ? null : editing}
          onSave={saveCategory}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
