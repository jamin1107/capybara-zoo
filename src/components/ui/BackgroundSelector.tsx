import { useGameStore } from '@/store/gameStore';
import type { BackgroundType } from '@/types/game';

interface BackgroundOption {
  type: BackgroundType;
  name: string;
  color: string;
  gradient: string;
}

const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { type: 'default', name: '默认', color: '#87CEEB', gradient: 'from-sky-300 to-sky-100' },
  { type: 'sunset', name: '日落', color: '#FF6B35', gradient: 'from-orange-400 to-amber-200' },
  { type: 'night', name: '夜晚', color: '#0a0a2e', gradient: 'from-indigo-900 to-slate-800' },
  { type: 'cherry_blossom', name: '樱花', color: '#FFB6C1', gradient: 'from-pink-300 to-rose-100' },
  { type: 'snow', name: '雪景', color: '#B0C4DE', gradient: 'from-slate-300 to-blue-100' },
];

export function BackgroundSelector() {
  const currentBackground = useGameStore((state) => state.currentBackground);
  const setBackground = useGameStore((state) => state.setBackground);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {BACKGROUND_OPTIONS.map((bg) => {
        const isActive = currentBackground === bg.type;
        return (
          <button
            key={bg.type}
            onClick={() => setBackground(bg.type)}
            className={`
              flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
              ${
                isActive
                  ? 'bg-white/30 ring-2 ring-white/60 scale-105 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bg.gradient} border border-white/20 shadow-inner`}
            />
            <span className="text-xs font-medium text-white/90 drop-shadow-sm">
              {bg.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
