import { useGameStore } from '@/store/gameStore';

export function ShopPanel() {
  const shopOpen = useGameStore((state) => state.shopOpen);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const foods = useGameStore((state) => state.foods);
  const unlockedFoods = useGameStore((state) => state.unlockedFoods);
  const gold = useGameStore((state) => state.gold);
  const buyFood = useGameStore((state) => state.buyFood);

  if (!shopOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 z-20"
        onClick={toggleShop}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white z-30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#5D4037] font-quicksand">
              🏪 商店
            </h2>
            <button
              onClick={toggleShop}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            金币：<span className="text-[#F59E0B] font-bold">{gold} 🪙</span>
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#8D6E63] mb-2">食物</h3>
          {foods.map((food) => {
            const isUnlocked = unlockedFoods.includes(food.id);
            const canAfford = gold >= food.unlockCost;

            return (
              <div
                key={food.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isUnlocked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{food.icon}</span>
                  <div>
                    <p className="font-medium text-[#5D4037]">{food.name}</p>
                    <p className="text-xs text-gray-500">
                      饱食 +{food.hungerRestore} | 心情 +{food.moodBoost}
                    </p>
                  </div>
                </div>

                {isUnlocked ? (
                  <span className="text-green-600 text-sm font-bold">
                    ✓ 已拥有
                  </span>
                ) : (
                  <button
                    onClick={() => buyFood(food.id)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      canAfford
                        ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {food.unlockCost} 🪙
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
