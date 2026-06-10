import { useGameStore } from '@/store/gameStore';

const DISEASE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  cold: { name: '感冒', icon: '🤧', description: '卡皮巴拉感冒了，需要吃药休息' },
  stomachache: { name: '拉肚子', icon: '🤢', description: '肠胃不适，需要药物治疗' },
  dirty_sick: { name: '脏污病', icon: '🦠', description: '清洁度太低导致的疾病' },
};

export function DiseaseIndicator() {
  const capybaras = useGameStore((state) => state.capybaras);
  const giveMedicine = useGameStore((state) => state.giveMedicine);
  const gold = useGameStore((state) => state.gold);

  const sickCapybaras = capybaras.filter((c) => c.health !== 'healthy');

  if (sickCapybaras.length === 0) return null;

  return (
    <div className="absolute top-16 right-4 z-40 space-y-2 max-h-[40vh] overflow-y-auto">
      {sickCapybaras.map((capy) => {
        const disease = DISEASE_INFO[capy.health] || { name: '未知疾病', icon: '⚠️', description: '未知疾病' };

        return (
          <div
            key={capy.id}
            className="rounded-xl p-3 animate-pulse"
            style={{
              background: 'rgba(220,38,38,0.25)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(220,38,38,0.5)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{disease.icon}</span>
                <div>
                  <div className="text-red-300 text-sm font-bold">
                    {capy.name} - {disease.name}
                  </div>
                  <div className="text-red-200/70 text-[10px]">{disease.description}</div>
                </div>
              </div>
              <button
                onClick={() => giveMedicine(capy.id)}
                disabled={gold < 20}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-red-600/70 text-white hover:bg-red-600/90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                💊 吃药
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
