import { Plus } from 'lucide-react';

export default function Prompts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Prompts</h1>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Prompt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
        <p>No saved prompts yet. Click "New Prompt" to create one.</p>
      </div>
    </div>
  );
}
