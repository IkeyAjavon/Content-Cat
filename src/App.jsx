import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LevelUpCelebration from './components/LevelUpCelebration';
import Dashboard from './pages/Dashboard';
import ContentLog from './pages/ContentLog';
import Prompts from './pages/Prompts';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import CustomCategories from './pages/CustomCategories';
import Onboarding from './pages/Onboarding';
import { useLocalStorage } from './hooks/useLocalStorage';
import { xpToLevel } from './hooks/useCatState';

export default function App() {
  const [onboarded] = useLocalStorage('content-cat-onboarded', false);
  const [catState] = useLocalStorage('content-cat-state', { xp: 0 });
  const location = useLocation();

  // ── Level-up detection ───────────────────────────────────
  const currentLevel = xpToLevel(catState?.xp || 0);
  const [trackedLevel, setTrackedLevel] = useState(currentLevel);
  const [celebrateLevel, setCelebrateLevel] = useState(null);

  if (currentLevel !== trackedLevel) {
    if (currentLevel > trackedLevel && trackedLevel > 0) {
      setCelebrateLevel(currentLevel);
    }
    setTrackedLevel(currentLevel);
  }

  // Redirect to onboarding if not yet completed
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {location.pathname !== '/onboarding' && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<ContentLog />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/prompts/custom" element={<CustomCategories />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>

      {celebrateLevel && (
        <LevelUpCelebration
          level={celebrateLevel}
          onDismiss={() => setCelebrateLevel(null)}
        />
      )}
    </div>
  );
}
