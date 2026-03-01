import { BarChart3, FileText, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Welcome to Content Cat — your personal content tracker.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <FileText className="w-8 h-8 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500">Content Entries</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <MessageSquare className="w-8 h-8 text-emerald-500" />
          <div>
            <p className="text-sm text-gray-500">Saved Prompts</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
