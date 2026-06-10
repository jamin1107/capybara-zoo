import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { CommandType } from '@/types/game';

const COMMANDS_DATA: { type: CommandType; name: string; icon: string }[] = [
  { type: 'sit', name: '坐下', icon: '🪑' },
  { type: 'shake', name: '握手', icon: '🤝' },
  { type: 'spin', name: '转圈', icon: '🔄' },
  { type: 'roll', name: '打滚', icon: '🌀' },
];

export function CommandPanel() {
  const [open, setOpen] = useState(false);
  const selectedCapybaraId = useGameStore((state) => state.selectedCapybaraId);
  const capybaras = useGameStore((state) => state.capybaras);
  const teachCommand = useGameStore((state) => state.teachCommand);
  const executeCommand = useGameStore((state) => state.executeCommand);
  const gold = useGameStore((state) => state.gold);

  if (!selectedCapybaraId) {
    return null;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-16 left-2 md:bottom-32 md:left-4 px-3 py-2 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 z-40"
        style={{
          background: 'rgba(139,92,60,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        🎓 训练
      </button>
    );
  }

  const capy = capybaras.find((c) => c.id === selectedCapybaraId);
  if (!capy) return null;

  return (
    <div className="absolute bottom-20 left-2 md:bottom-32 md:left-4 w-60 md:w-64 z-40 max-h-[50vh] overflow-y-auto">
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(20,20,40,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-lg">🎓 命令训练</h3>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl">
            ✕
          </button>
        </div>
        <p className="text-white/50 text-xs mb-2">选择: {capy.name}</p>

        <div className="space-y-2">
          {COMMANDS_DATA.map((cmd) => {
            const learned = capy.learnedCommands.find((lc) => lc.type === cmd.type);
            const isMastered = learned && learned.level >= 1;

            return (
              <div
                key={cmd.type}
                className="rounded-xl p-2 flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-lg">{cmd.icon}</span>
                <div className="flex-1">
                  <div className="text-white text-sm">{cmd.name}</div>
                  {learned && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${(learned.timesPerformed / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/60">Lv.{learned.level}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {!isMastered ? (
                    <button
                      onClick={() => teachCommand(capy.id, cmd.type)}
                      disabled={gold < 10}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-600/70 text-white hover:bg-yellow-600/90 disabled:opacity-40"
                    >
                      训练
                    </button>
                  ) : (
                    <button
                      onClick={() => executeCommand(capy.id, cmd.type)}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-green-600/70 text-white hover:bg-green-600/90"
                    >
                      执行
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center text-white/50 text-xs">
          金币: 💰 {gold} | 训练费: 10/次
        </div>
      </div>
    </div>
  );
}
