import { useGameStore } from '@/store/gameStore';

export function TopBar() {
  const gold = useGameStore((state) => state.gold);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const toggleDecorationPanel = useGameStore((state) => state.toggleDecorationPanel);
  const toggleFarmMode = useGameStore((state) => state.toggleFarmMode);
  const farmMode = useGameStore((state) => state.farmMode);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg">
          <span className="text-2xl">🦫</span>
          <h1 className="text-lg font-bold text-[#5D4037] font-quicksand">
            卡皮巴拉动物园
          </h1>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg">
          <span className="text-xl">🪙</span>
          <span className="text-lg font-bold text-[#F59E0B] font-nunito">
            {gold}
          </span>
        </div>

        {/* Shop & Decoration & Farm Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShop}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          >
            <span className="text-xl">🏪</span>
          </button>
          <button
            onClick={toggleDecorationPanel}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          >
            <span className="text-xl">🌳</span>
          </button>
          <button
            onClick={toggleFarmMode}
            className={`rounded-full p-2 shadow-lg transition-colors ${
              farmMode
                ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
                : 'bg-white/90 backdrop-blur-sm hover:bg-white'
            }`}
          >
            <span className="text-xl">🌾</span>
          </button>
        </div>
      </div>
    </div>
  );
}
