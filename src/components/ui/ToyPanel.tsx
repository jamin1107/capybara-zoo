import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_TOYS } from '@/store/gameStore';
import type { Toy } from '@/types/game';

export function ToyPanel() {
  const [open, setOpen] = useState(false);
  const gold = useGameStore((state) => state.gold);
  const ownedToys = useGameStore((state) => state.ownedToys);
  const buyToy = useGameStore((state) => state.buyToy);
  const useToyOnCapybara = useGameStore((state) => state.useToyOnCapybara);
  const selectedCapybaraId = useGameStore((state) => state.selectedCapybaraId);

  const toyData = DEFAULT_TOYS;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-16 right-16 md:bottom-4 md:right-20 px-3 py-2 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 z-40"
        style={{
          background: 'rgba(139,92,60,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        🎾 玩具
      </button>
    );
  }

  return (
    <div className="absolute bottom-20 right-2 md:bottom-16 md:right-4 w-72 md:w-80 z-40" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(20,20,40,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-lg">🎾 玩具商店</h3>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {toyData.map((toy) => {
            const isOwned = ownedToys.includes(toy.id);
            return (
              <div
                key={toy.id}
                className="rounded-xl p-3 flex flex-col items-center gap-1"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-3xl">{toy.icon}</span>
                <span className="text-white text-sm font-medium">{toy.name}</span>
                <span className="text-yellow-400 text-xs">💰 {toy.cost}</span>

                {isOwned ? (
                  <button
                    onClick={() => {
                      if (selectedCapybaraId) {
                        useToyOnCapybara(selectedCapybaraId, toy.id);
                      }
                    }}
                    disabled={!selectedCapybaraId}
                    className="w-full mt-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-600/70 text-white hover:bg-green-600/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {selectedCapybaraId ? '使用' : '选择卡皮'}
                  </button>
                ) : (
                  <button
                    onClick={() => buyToy(toy.id)}
                    disabled={gold < toy.cost}
                    className="w-full mt-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-600/70 text-white hover:bg-blue-600/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    购买
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center text-white/50 text-xs">
          金币: 💰 {gold}
        </div>
      </div>
    </div>
  );
}
