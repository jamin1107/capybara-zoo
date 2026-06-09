import { useGameStore, SEEDS_DATA } from '@/store/gameStore';
import type { CropStage } from '@/types/game';

const STAGE_LABELS: Record<CropStage, string> = {
  seed: '🌰 种子',
  sprout: '🌱 发芽',
  growing: '🌿 生长中',
  mature: '🌾 可收获',
  withered: '💀 枯萎',
};

const SEED_EMOJI: Record<string, string> = {
  lettuce: '🥬',
  carrot: '🥕',
  tomato: '🍅',
  corn: '🌽',
  potato: '🥔',
};

export function FarmInfoCard() {
  const selectedPlotId = useGameStore((s) => s.selectedPlotId);
  const farmPlots = useGameStore((s) => s.farmPlots);
  const selectPlot = useGameStore((s) => s.selectPlot);
  const waterCrop = useGameStore((s) => s.waterCrop);
  const fertilizeCrop = useGameStore((s) => s.fertilizeCrop);
  const harvestCrop = useGameStore((s) => s.harvestCrop);
  const gold = useGameStore((s) => s.gold);

  const plot = farmPlots.find((p) => p.id === selectedPlotId);
  if (!plot || (!plot.cropType && !selectedPlotId)) return null;

  const seedData = plot.cropType ? SEEDS_DATA.find((s) => s.cropType === plot.cropType) : null;

  const handleBackdropClick = () => {
    selectPlot(null);
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={handleBackdropClick}
      />

      {/* 信息卡片 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/40">
          {/* 头部 */}
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {plot.cropType && (
                  <span className="text-2xl">
                    {SEED_EMOJI[plot.cropType]}
                  </span>
                )}
                <div>
                  <h3 className="text-base font-bold text-[#5D4037] font-nunito">
                    {plot.cropType ? seedData?.name : '空地'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {STAGE_LABELS[plot.stage]}
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackdropClick}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          {/* 内容 */}
          {plot.cropType ? (
            <div className="p-4 space-y-3">
              {/* 生长进度 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">生长进度</span>
                  <span className="font-bold text-[#5D4037]">
                    {Math.round(plot.growthProgress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${plot.growthProgress}%` }}
                  />
                </div>
              </div>

              {/* 水分进度 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">💧 水分</span>
                  <span
                    className={`font-bold ${
                      plot.waterLevel < 30 ? 'text-red-500' : 'text-blue-600'
                    }`}
                  >
                    {Math.round(plot.waterLevel)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      plot.waterLevel < 30
                        ? 'bg-gradient-to-r from-red-400 to-red-600'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                    style={{ width: `${plot.waterLevel}%` }}
                  />
                </div>
              </div>

              {/* 施肥状态 */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">✨ 施肥：</span>
                {plot.fertilized ? (
                  <span className="text-green-600 font-bold">已施肥 (生长速度×2)</span>
                ) : (
                  <span className="text-gray-400">未施肥</span>
                )}
              </div>

              {/* 收获信息 */}
              {seedData && (
                <div className="flex items-center justify-between text-xs bg-amber-50 rounded-lg px-3 py-2">
                  <span className="text-gray-600">收获奖励</span>
                  <span className="text-amber-600 font-bold">
                    +{seedData.harvestReward} 🪙
                  </span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-2">
                {plot.stage !== 'withered' && plot.stage !== 'mature' && (
                  <>
                    <button
                      onClick={() => waterCrop(plot.id)}
                      className="flex-1 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-sm transition-colors"
                    >
                      💧 浇水
                    </button>
                    {!plot.fertilized && (
                      <button
                        onClick={() => {
                          if (gold >= 10) fertilizeCrop(plot.id);
                        }}
                        disabled={gold < 10}
                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
                          gold >= 10
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        ✨ 施肥 (10🪙)
                      </button>
                    )}
                  </>
                )}

                {plot.stage === 'mature' && (
                  <button
                    onClick={() => harvestCrop(plot.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl"
                  >
                    🧺 收获 (+{seedData?.harvestReward} 🪙)
                  </button>
                )}

                {plot.stage === 'withered' && (
                  <button
                    onClick={handleBackdropClick}
                    className="w-full py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm transition-colors"
                  >
                    🪓 清理枯萎作物
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">这是一块空地</p>
              <p className="text-xs text-gray-400 mt-1">选择种子后点击这里种植</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
