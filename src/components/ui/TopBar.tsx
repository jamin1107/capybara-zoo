import { useGameStore } from '@/store/gameStore';

export function TopBar() {
  const gold = useGameStore((state) => state.gold);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const toggleDecorationPanel = useGameStore((state) => state.toggleDecorationPanel);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-3 py-2 md:px-4 md:py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Title - smaller on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 shadow-lg">
          <span className="text-lg md:text-2xl">🦫</span>
          <h1 className="text-sm md:text-lg font-bold text-[#5D4037] font-quicksand hidden sm:block">
            卡皮巴拉动物园
          </h1>
          <h1 className="text-sm md:text-lg font-bold text-[#5D4037] font-quicksand sm:hidden">
            动物园
          </h1>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 md:px-5 py-1.5 md:py-2 shadow-lg">
          <span className="text-base md:text-xl">🪙</span>
          <span className="text-sm md:text-lg font-bold text-[#F59E0B] font-nunito">
            {gold}
          </span>
        </div>

        {/* Shop & Decoration Buttons - smaller on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={toggleShop}
            className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2 shadow-lg hover:bg-white transition-colors"
          >
            <span className="text-lg md:text-xl">🏪</span>
          </button>
          <button
            onClick={toggleDecorationPanel}
            className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 md:p-2 shadow-lg hover:bg-white transition-colors"
          >
            <span className="text-lg md:text-xl">🌳</span>
          </button>
        </div>
      </div>
    </div>
  );
}
