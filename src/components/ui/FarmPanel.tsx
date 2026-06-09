import { useGameStore, SEEDS_DATA } from '@/store/gameStore';
import type { FarmTool, CropType } from '@/types/game';

const TOOLS: { id: FarmTool; name: string; icon: string; cost?: number }[] = [
  { id: 'water', name: '浇水', icon: '💧' },
  { id: 'fertilizer', name: '施肥', icon: '✨', cost: 10 },
  { id: 'harvest', name: '收获', icon: '🧺' },
  { id: 'hoe', name: '锄头', icon: '🪓' },
];

const SEED_EMOJI: Record<CropType, string> = {
  lettuce: '🥬',
  carrot: '🥕',
  tomato: '🍅',
  corn: '🌽',
  potato: '🥔',
};

export function FarmPanel() {
  const farmMode = useGameStore((s) => s.farmMode);
  const toggleFarmMode = useGameStore((s) => s.toggleFarmMode);
  const selectedTool = useGameStore((s) => s.selectedTool);
  const selectedSeed = useGameStore((s) => s.selectedSeed);
  const selectTool = useGameStore((s) => s.selectTool);
  const selectSeed = useGameStore((s) => s.selectSeed);
  const gold = useGameStore((s) => s.gold);

  if (!farmMode) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="max-w-2xl mx-auto px-4 pb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/30">
          {/* 工具栏 */}
          <div className="px-4 py-3 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#5D4037] font-nunito">
                🛠️ 工具
              </h3>
              <span className="text-xs text-gray-500">金币：{gold} 🪙</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {TOOLS.map((tool) => {
                const isSelected = selectedTool === tool.id;
                const canAfford = !tool.cost || gold >= tool.cost;

                return (
                  <button
                    key={tool.id}
                    onClick={() => selectTool(isSelected ? null : tool.id)}
                    disabled={!!tool.cost && !canAfford}
                    className={`
                      flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px]
                      ${
                        isSelected
                          ? 'bg-[#A5D6A7] ring-2 ring-[#4CAF50] scale-105 shadow-md'
                          : tool.cost && !canAfford
                          ? 'bg-gray-100/80 opacity-50 cursor-not-allowed'
                          : 'bg-white/80 hover:bg-[#E8F5E9] hover:scale-105'
                      }
                    `}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-xs font-medium text-[#5D4037] font-nunito">
                      {tool.name}
                    </span>
                    {tool.cost && (
                      <span className="text-xs text-amber-600 font-bold">
                        {tool.cost}🪙
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 种子选择 */}
          <div className="px-4 py-3">
            <h3 className="text-sm font-bold text-[#5D4037] mb-2 font-nunito">
              🌱 种子商店
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SEEDS_DATA.map((seed) => {
                const isSelected = selectedSeed === seed.cropType;
                const canAfford = gold >= seed.cost;

                return (
                  <button
                    key={seed.cropType}
                    onClick={() => selectSeed(isSelected ? null : seed.cropType)}
                    disabled={!canAfford}
                    className={`
                      flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[72px]
                      ${
                        isSelected
                          ? 'bg-[#C8E6C9] ring-2 ring-[#4CAF50] scale-105 shadow-md'
                          : !canAfford
                          ? 'bg-gray-100/80 opacity-50 cursor-not-allowed'
                          : 'bg-white/80 hover:bg-[#E8F5E9] hover:scale-105'
                      }
                    `}
                  >
                    <span className="text-xl">{SEED_EMOJI[seed.cropType]}</span>
                    <span className="text-xs font-medium text-[#5D4037] font-nunito">
                      {seed.name}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-amber-600 font-bold">{seed.cost}🪙</span>
                      <span className="text-green-600 font-bold">+{seed.harvestReward}🪙</span>
                    </div>
                    <span className="text-xs text-gray-500">{seed.growTime}秒</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="px-4 py-2 bg-gray-50/50 flex items-center justify-between border-t border-gray-200/50">
            <span className="text-xs text-gray-500">
              {selectedTool
                ? `当前工具：${TOOLS.find(t => t.id === selectedTool)?.name || ''}`
                : selectedSeed
                ? `当前种子：${SEEDS_DATA.find(s => s.cropType === selectedSeed)?.name || ''}`
                : '点击作物查看详情'}
            </span>
            <button
              onClick={toggleFarmMode}
              className="px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
            >
              退出农场
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
