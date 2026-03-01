export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl shadow divide-y">
        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Data Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            All data is stored locally in your browser using localStorage.
          </p>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-gray-800">Export Data</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Download a JSON backup of all your data.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Export JSON
          </button>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Clear all stored data. This action cannot be undone.
          </p>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
