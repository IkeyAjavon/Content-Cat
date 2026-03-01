import { BarChart3 } from 'lucide-react';

export default function Stats() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Stats</h1>

      <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Stats will appear here once you start logging content.</p>
      </div>
    </div>
  );
}
