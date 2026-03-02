import { useEffect, useState } from 'react';
import VirtualCat from './VirtualCat';

const LEVEL_NAMES = { 1: 'Kitten', 2: 'Young Cat', 3: 'Cool Cat', 4: 'Wise Cat', 5: 'Legendary Cat' };

// Deterministic confetti — no Math.random needed
function seeded(i) {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  width: 6 + seeded(i) * 6,
  height: 6 + seeded(i + 20) * 6,
  left: `${seeded(i + 40) * 100}%`,
  top: `${seeded(i + 60) * 100}%`,
  bg: ['#818cf8', '#f59e0b', '#34d399', '#f472b6', '#6366f1'][i % 5],
  duration: 1.5 + seeded(i + 80) * 2,
  delay: seeded(i + 100) * 0.5,
}));

export default function LevelUpCelebration({ level, onDismiss }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  function handleDismiss() {
    setShow(false);
    setTimeout(onDismiss, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={handleDismiss} />

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transform transition-transform duration-500 ${
          show ? 'scale-100' : 'scale-75'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                width: c.width,
                height: c.height,
                left: c.left,
                top: c.top,
                backgroundColor: c.bg,
                opacity: 0.6,
                animation: `confetti-fall ${c.duration}s ease-in-out ${c.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes confetti-fall {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50%      { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
        `}</style>

        <div className="relative z-10">
          <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">Level Up!</p>
          <VirtualCat level={level} mood="On Fire" size={140} />
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            Level {level}: {LEVEL_NAMES[level]}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Your cat has evolved! Keep creating to reach the next level.
          </p>
          <button
            onClick={handleDismiss}
            className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
