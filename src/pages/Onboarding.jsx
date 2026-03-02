import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import VirtualCat from '../components/VirtualCat';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CATEGORIES } from '../data/curatedPrompts';

const STEPS = ['welcome', 'name', 'categories'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [, setCatState] = useLocalStorage('content-cat-state', null);
  const [, setOnboarded] = useLocalStorage('content-cat-onboarded', false);
  const [, setActiveCategories] = useLocalStorage('content-cat-active-categories', CATEGORIES);

  const [step, setStep] = useState(0);
  const [catName, setCatName] = useState('Whiskers');
  const [selected, setSelected] = useState(CATEGORIES.map(() => true));

  function toggleCategory(i) {
    setSelected((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function finish() {
    // Persist cat name into state
    setCatState((prev) => ({ ...(prev || {}), catName: catName.trim() || 'Whiskers' }));
    // Persist active categories
    const active = CATEGORIES.filter((_, i) => selected[i]);
    setActiveCategories(active.length > 0 ? active : CATEGORIES);
    setOnboarded(true);
    navigate('/');
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <>
            <VirtualCat level={1} mood="Happy" size={140} />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Content Cat!</h1>
            <p className="text-gray-600">
              Your personal content companion. Track ideas, get inspired by prompts,
              and level up your virtual cat as you create.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mx-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Step 1: Name your cat */}
        {step === 1 && (
          <>
            <VirtualCat level={1} mood="Thriving" size={120} />
            <h2 className="text-xl font-bold text-gray-900">Name Your Cat</h2>
            <p className="text-gray-600 text-sm">Give your content companion a name.</p>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              maxLength={20}
              className="w-full max-w-xs mx-auto rounded-lg border border-gray-300 px-4 py-2 text-center text-lg font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Whiskers"
            />
            <button
              onClick={() => setStep(2)}
              className="mx-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Step 2: Pick categories */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-gray-900">Pick Your Interests</h2>
            <p className="text-gray-600 text-sm">
              Choose which curated prompt categories interest you. You can change this later.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selected[i]
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {selected[i] && <Check className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="mx-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Let&rsquo;s Go! <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
