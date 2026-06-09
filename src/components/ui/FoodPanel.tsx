import { useGameStore } from '@/store/gameStore';
import type { Food } from '@/types/game';

export function FoodPanel() {
  const foods = useGameStore((state) => state.foods);
  const unlockedFoods = useGameStore((state) => state.unlockedFoods);
  const selectedFoodId = useGameStore((state) => state.selectedFoodId);
  const selectFood = useGameStore((state) => state.selectFood);

  const handleFoodClick = (food: Food) => {
    if (!unlockedFoods.includes(food.id)) return;

    if (selectedFoodId === food.id) {
      selectFood(null);
    } else {
      selectFood(food.id);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
          <h3 className="text-sm font-bold text-[#5D4037] mb-2 font-nunito">
            {selectedFoodId ? '已选择食物，点击地面投放 🎯' : '选择食物投喂'}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {foods.map((food) => {
              const isUnlocked = unlockedFoods.includes(food.id);
              const isSelected = selectedFoodId === food.id;

              return (
                <button
                  key={food.id}
                  onClick={() => handleFoodClick(food)}
                  className={`
                    flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all
                    ${
                      isSelected
                        ? 'bg-[#A5D6A7] ring-2 ring-[#4CAF50] scale-105'
                        : isUnlocked
                        ? 'bg-white/80 hover:bg-[#E8F5E9]'
                        : 'bg-gray-100/80 opacity-60'
                    }
                  `}
                  disabled={!isUnlocked}
                >
                  <span className="text-2xl">{food.icon}</span>
                  <span className="text-xs font-medium text-[#5D4037] font-nunito">
                    {food.name}
                  </span>
                  {!isUnlocked && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      🔒 {food.unlockCost}🪙
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
