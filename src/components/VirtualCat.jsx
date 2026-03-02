import { useId } from 'react';

// ── Level configs ──────────────────────────────────────────
// Each level defines visual tweaks that make the cat progressively
// more mature/impressive: size, ear style, whiskers, accessories.

const LEVEL_CONFIG = {
  1: { name: 'Kitten',        bodyScale: 0.82, earH: 18, eyeR: 9,  tailCurve: 15, whiskerLen: 18, crown: false, cape: false, aura: false },
  2: { name: 'Young Cat',     bodyScale: 0.90, earH: 22, eyeR: 8.5, tailCurve: 20, whiskerLen: 22, crown: false, cape: false, aura: false },
  3: { name: 'Cool Cat',      bodyScale: 0.96, earH: 24, eyeR: 8,  tailCurve: 25, whiskerLen: 26, crown: false, cape: false, aura: false },
  4: { name: 'Wise Cat',      bodyScale: 1.00, earH: 26, eyeR: 7.5, tailCurve: 28, whiskerLen: 30, crown: true,  cape: false, aura: false },
  5: { name: 'Legendary Cat', bodyScale: 1.04, earH: 28, eyeR: 7,  tailCurve: 30, whiskerLen: 34, crown: true,  cape: true,  aura: true },
};

// ── Mood configs ───────────────────────────────────────────

const MOOD_CONFIG = {
  Sad:      { mouthPath: 'M 86,128 Q 100,122 114,128', earDroop: 8,  pupilDY: 2,  sparkle: false, glow: false, blush: false, color: '#94a3b8' },
  Meh:      { mouthPath: 'M 88,126 L 112,126',         earDroop: 3,  pupilDY: 0,  sparkle: false, glow: false, blush: false, color: '#a1a1aa' },
  Happy:    { mouthPath: 'M 86,124 Q 100,134 114,124', earDroop: 0,  pupilDY: 0,  sparkle: false, glow: false, blush: true,  color: '#818cf8' },
  Thriving: { mouthPath: 'M 84,124 Q 100,138 116,124', earDroop: 0,  pupilDY: -1, sparkle: true,  glow: false, blush: true,  color: '#6366f1' },
  'On Fire':{ mouthPath: 'M 82,122 Q 100,140 118,122', earDroop: 0,  pupilDY: -1, sparkle: true,  glow: true,  blush: true,  color: '#f59e0b' },
};

export default function VirtualCat({ level = 1, mood = 'Happy', size = 200 }) {
  const lv = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const md = MOOD_CONFIG[mood] || MOOD_CONFIG.Happy;

  const viewBox = '0 0 200 200';

  // Unique ID prefix for gradients (React's useId is stable & SSR-safe)
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* CSS keyframes (scoped via uid class) */}
      <style>{`
        .${uid} .breathe { animation: ${uid}-breathe 3s ease-in-out infinite; }
        .${uid} .blink   { animation: ${uid}-blink 4s ease-in-out infinite; }
        .${uid} .tail    { animation: ${uid}-tail 2.5s ease-in-out infinite; transform-origin: 145px 145px; }
        .${uid} .sparkle { animation: ${uid}-sparkle 1.5s ease-in-out infinite; }
        .${uid} .glow    { animation: ${uid}-glow 2s ease-in-out infinite; }
        .${uid} .float   { animation: ${uid}-float 3s ease-in-out infinite; }

        @keyframes ${uid}-breathe {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.02); }
        }
        @keyframes ${uid}-blink {
          0%, 42%, 46%, 100% { transform: scaleY(1); }
          44%                { transform: scaleY(0.05); }
        }
        @keyframes ${uid}-tail {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(8deg); }
        }
        @keyframes ${uid}-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes ${uid}-glow {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        @keyframes ${uid}-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
      `}</style>

      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        className={uid}
        role="img"
        aria-label={`${lv.name} cat feeling ${mood}`}
      >
        <defs>
          <radialGradient id={`${uid}-body`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor={md.color} />
          </radialGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={mood === 'On Fire' ? '#fbbf24' : '#818cf8'} stopOpacity="0.6" />
            <stop offset="100%" stopColor={mood === 'On Fire' ? '#f59e0b' : '#6366f1'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Aura / glow background */}
        {md.glow && (
          <circle className="glow" cx="100" cy="110" r="80" fill={`url(#${uid}-glow)`} />
        )}

        <g className="float">
          {/* ── Tail ─────────────────────────── */}
          <path
            className="tail"
            d={`M 145,145 Q ${145 + lv.tailCurve},${145 - lv.tailCurve} ${140 + lv.tailCurve},${110 - lv.tailCurve}`}
            stroke={md.color}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* ── Cape (L5) ────────────────────── */}
          {lv.cape && (
            <path
              d="M 72,105 Q 60,140 75,165 L 100,155 L 125,165 Q 140,140 128,105"
              fill="#7c3aed"
              opacity="0.5"
            />
          )}

          {/* ── Body (breathing) ──────────────── */}
          <g className="breathe" style={{ transformOrigin: '100px 130px' }}>
            <ellipse
              cx="100"
              cy={130}
              rx={38 * lv.bodyScale}
              ry={42 * lv.bodyScale}
              fill={`url(#${uid}-body)`}
            />
            {/* Belly */}
            <ellipse
              cx="100"
              cy={138}
              rx={22 * lv.bodyScale}
              ry={26 * lv.bodyScale}
              fill="#e0e7ff"
              opacity="0.7"
            />
          </g>

          {/* ── Head ─────────────────────────── */}
          <circle cx="100" cy="95" r={32 * lv.bodyScale} fill={`url(#${uid}-body)`} />

          {/* ── Ears ─────────────────────────── */}
          <polygon
            points={`${72},${90 - lv.earH + md.earDroop} ${62},${95} ${82},${90}`}
            fill={md.color}
          />
          <polygon
            points={`${72},${90 - lv.earH + md.earDroop} ${65},${94} ${79},${91}`}
            fill="#fecdd3"
            opacity="0.6"
          />
          <polygon
            points={`${128},${90 - lv.earH + md.earDroop} ${118},${90} ${138},${95}`}
            fill={md.color}
          />
          <polygon
            points={`${128},${90 - lv.earH + md.earDroop} ${121},${91} ${135},${94}`}
            fill="#fecdd3"
            opacity="0.6"
          />

          {/* ── Eyes (blinking) ───────────────── */}
          <g className="blink" style={{ transformOrigin: '100px 92px' }}>
            {/* Left eye */}
            <circle cx="87" cy="92" r={lv.eyeR} fill="white" />
            <circle cx="87" cy={92 + md.pupilDY} r={lv.eyeR * 0.55} fill="#1e1b4b" />
            <circle cx="85" cy={90 + md.pupilDY} r={lv.eyeR * 0.2} fill="white" />

            {/* Right eye */}
            <circle cx="113" cy="92" r={lv.eyeR} fill="white" />
            <circle cx="113" cy={92 + md.pupilDY} r={lv.eyeR * 0.55} fill="#1e1b4b" />
            <circle cx="111" cy={90 + md.pupilDY} r={lv.eyeR * 0.2} fill="white" />
          </g>

          {/* ── Nose ─────────────────────────── */}
          <ellipse cx="100" cy="103" rx="3" ry="2.5" fill="#fda4af" />

          {/* ── Mouth (mood-driven) ──────────── */}
          <path d={md.mouthPath} stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* ── Whiskers ─────────────────────── */}
          <line x1={100 - lv.whiskerLen - 14} y1="100" x2={100 - 14} y2="103" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />
          <line x1={100 - lv.whiskerLen - 14} y1="106" x2={100 - 14} y2="106" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />
          <line x1={100 - lv.whiskerLen - 14} y1="112" x2={100 - 14} y2="109" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />
          <line x1={100 + lv.whiskerLen + 14} y1="100" x2={100 + 14} y2="103" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />
          <line x1={100 + lv.whiskerLen + 14} y1="106" x2={100 + 14} y2="106" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />
          <line x1={100 + lv.whiskerLen + 14} y1="112" x2={100 + 14} y2="109" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.4" />

          {/* ── Blush ────────────────────────── */}
          {md.blush && (
            <>
              <circle cx="76" cy="102" r="5" fill="#fecdd3" opacity="0.5" />
              <circle cx="124" cy="102" r="5" fill="#fecdd3" opacity="0.5" />
            </>
          )}

          {/* ── Paws ─────────────────────────── */}
          <ellipse cx="82" cy={168 * lv.bodyScale + 10} rx="9" ry="5" fill={md.color} />
          <ellipse cx="118" cy={168 * lv.bodyScale + 10} rx="9" ry="5" fill={md.color} />

          {/* ── Crown (L4+) ──────────────────── */}
          {lv.crown && (
            <g>
              <polygon
                points="85,66 90,54 95,63 100,48 105,63 110,54 115,66"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <circle cx="100" cy="52" r="2" fill="#f59e0b" />
            </g>
          )}

          {/* ── Sparkles (Thriving / On Fire) ── */}
          {md.sparkle && (
            <>
              <text className="sparkle" x="50" y="70" fontSize="12" style={{ animationDelay: '0s' }}>&#10022;</text>
              <text className="sparkle" x="140" y="78" fontSize="10" style={{ animationDelay: '0.5s' }}>&#10022;</text>
              <text className="sparkle" x="55" y="130" fontSize="8" style={{ animationDelay: '1s' }}>&#10022;</text>
              <text className="sparkle" x="148" y="125" fontSize="11" style={{ animationDelay: '0.3s' }}>&#10022;</text>
              {mood === 'On Fire' && (
                <>
                  <text className="sparkle" x="45" y="100" fontSize="14" fill="#f59e0b" style={{ animationDelay: '0.7s' }}>&#9733;</text>
                  <text className="sparkle" x="150" y="100" fontSize="14" fill="#f59e0b" style={{ animationDelay: '1.2s' }}>&#9733;</text>
                </>
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
