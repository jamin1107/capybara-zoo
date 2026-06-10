import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { BackgroundType, Decoration } from '@/types/game';

type Tab = 'background' | 'decoration';

const BACKGROUND_OPTIONS: { type: BackgroundType; name: string; gradient: string; emoji: string }[] = [
  { type: 'default', name: '默认', gradient: 'from-sky-400 to-sky-200', emoji: '☀️' },
  { type: 'sunset', name: '日落', gradient: 'from-orange-500 to-amber-300', emoji: '' },
  { type: 'night', name: '夜晚', gradient: 'from-indigo-900 to-slate-800', emoji: '🌙' },
  { type: 'cherry_blossom', name: '樱花', gradient: 'from-pink-400 to-rose-200', emoji: '🌸' },
  { type: 'snow', name: '雪景', gradient: 'from-slate-300 to-blue-200', emoji: '❄️' },
];

export function DecorationPanel() {
  const panelOpen = useGameStore((state) => state.decorationPanelOpen);
  const togglePanel = useGameStore((state) => state.toggleDecorationPanel);
  const decorations = useGameStore((state) => state.decorations);
  const gold = useGameStore((state) => state.gold);
  const buyDecoration = useGameStore((state) => state.buyDecoration);
  const removeDecoration = useGameStore((state) => state.removeDecoration);
  const selectedDecorationId = useGameStore((state) => state.selectedDecorationId);
  const selectDecoration = useGameStore((state) => state.selectDecoration);
  const currentBackground = useGameStore((state) => state.currentBackground);
  const setBackground = useGameStore((state) => state.setBackground);

  const [activeTab, setActiveTab] = useState<Tab>('background');

  const placedDecorations = decorations.filter((d) => d.position);

  if (!panelOpen) return null;

  const handleBuy = (decoration: Decoration) => {
    if (gold >= decoration.cost && !decoration.owned) {
      buyDecoration(decoration.id);
    }
  };

  const handlePlace = (decoration: Decoration) => {
    if (decoration.owned) {
      if (selectedDecorationId === decoration.id) {
        selectDecoration(null);
      } else {
        selectDecoration(decoration.id);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 z-20" onClick={togglePanel} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white/80 backdrop-blur-xl z-30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-[#5D4037] font-quicksand">
               动物园装饰
            </h2>
            <button
              onClick={togglePanel}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            金币：<span className="text-[#F59E0B] font-bold">{gold} 🪙</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'background'
                ? 'text-[#5D4037] border-b-2 border-[#5D4037]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            背景
          </button>
          <button
            onClick={() => setActiveTab('decoration')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'decoration'
                ? 'text-[#5D4037] border-b-2 border-[#5D4037]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            装饰
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {activeTab === 'background' && (
            <div className="space-y-3">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.type}
                  onClick={() => setBackground(bg.type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    currentBackground === bg.type
                      ? 'bg-white/60 border-blue-300 ring-2 ring-blue-200 shadow-md'
                      : 'bg-white/30 border-gray-200 hover:bg-white/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bg.gradient} flex items-center justify-center text-xl shadow-inner`}>
                    {bg.emoji}
                  </div>
                  <span className="font-medium text-[#5D4037]">{bg.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'decoration' && (
            <div className="space-y-3">
              {/* Selection hint */}
              {selectedDecorationId && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
                  🎯 已选择装饰，点击地面放置
                </div>
              )}

              {/* Placed decorations */}
              {placedDecorations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">已放置</h3>
                  <div className="space-y-2 mb-4">
                    {placedDecorations.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{d.icon}</span>
                          <div>
                            <p className="font-medium text-[#5D4037]">{d.name}</p>
                            <p className="text-xs text-gray-500">
                              位置: ({d.position![0].toFixed(1)}, {d.position![2].toFixed(1)})
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDecoration(d.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        >
                          移除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available decorations */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">装饰商店</h3>
                <div className="grid grid-cols-2 gap-3">
                  {decorations.map((d) => {
                    const isOwned = d.owned;
                    const canAfford = gold >= d.cost;
                    const isPlaced = !!d.position;
                    const isSelected = selectedDecorationId === d.id;

                    return (
                      <div
                        key={d.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                            : isOwned
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{d.icon}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-[#5D4037] text-sm truncate">{d.name}</p>
                            <p className="text-xs text-gray-500">{d.cost} 🪙</p>
                          </div>
                        </div>

                        {isOwned ? (
                          <div className="flex gap-2">
                            {isPlaced ? (
                              <button
                                onClick={() => removeDecoration(d.id)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                              >
                                移除
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePlace(d)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  isSelected
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
                                }`}
                              >
                                {isSelected ? '放置中...' : '放置'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuy(d)}
                            disabled={!canAfford}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              canAfford
                                ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            购买
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
