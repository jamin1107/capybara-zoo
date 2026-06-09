import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_FUR_COLORS, CAPYBARA_ACCESSORIES } from '@/types/game';

interface CapybaraEditorProps {
  capybaraId: string;
  onClose: () => void;
}

const ACCESSORY_ICONS: Record<string, string> = {
  hat: '🎩',
  glasses: '👓',
  scarf: '🧣',
  bowtie: '🎀',
  flower: '🌸',
  crown: '👑',
  sunglasses: '🕶️',
};

const ACCESSORY_LABELS: Record<string, string> = {
  hat: '帽子',
  glasses: '眼镜',
  scarf: '围巾',
  bowtie: '领结',
  flower: '花朵',
  crown: '皇冠',
  sunglasses: '墨镜',
};

export function CapybaraEditor({ capybaraId, onClose }: CapybaraEditorProps) {
  const capybara = useGameStore((state) => state.capybaras.find((c) => c.id === capybaraId));
  const updateCapybaraName = useGameStore((state) => state.updateCapybaraName);
  const updateCapybaraColor = useGameStore((state) => state.updateCapybaraColor);
  const toggleCapybaraAccessory = useGameStore((state) => state.toggleCapybaraAccessory);

  const [localName, setLocalName] = useState(capybara?.name ?? '');
  const [localColor, setLocalColor] = useState(capybara?.furColor ?? '#8B5E3C');

  const handleSaveName = useCallback(() => {
    if (localName.trim()) {
      updateCapybaraName(capybaraId, localName.trim());
    }
  }, [localName, capybaraId, updateCapybaraName]);

  const handleSelectColor = useCallback(
    (color: string) => {
      setLocalColor(color);
      updateCapybaraColor(capybaraId, color);
    },
    [capybaraId, updateCapybaraColor]
  );

  const handleToggleAccessory = useCallback(
    (accessory: string) => {
      toggleCapybaraAccessory(capybaraId, accessory);
    },
    [capybaraId, toggleCapybaraAccessory]
  );

  if (!capybara) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FFF8F0] to-[#FFF0E0]">
          <h2 className="text-lg font-bold text-[#5D4037]">编辑卡皮巴拉</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-[#5D4037] mb-2">名字</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleSaveName}
              maxLength={12}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#8D6E63] focus:outline-none transition-colors text-[#5D4037] font-medium"
              placeholder="输入名字..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-[#5D4037] mb-2">毛色</label>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_FUR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  className={`w-9 h-9 rounded-full border-3 transition-all duration-200 hover:scale-110 ${
                    localColor === color
                      ? 'ring-2 ring-[#8D6E63] ring-offset-2 scale-110'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`选择颜色 ${color}`}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={localColor}
                  onChange={(e) => handleSelectColor(e.target.value)}
                  className="w-9 h-9 rounded-full cursor-pointer border-2 border-gray-200 opacity-0 absolute inset-0"
                />
                <div
                  className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm pointer-events-none"
                >
                  +
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: localColor }}
              />
              <span className="text-xs text-gray-500 font-mono">{localColor}</span>
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-sm font-medium text-[#5D4037] mb-2">配饰</label>
            <div className="grid grid-cols-4 gap-2">
              {CAPYBARA_ACCESSORIES.map((accessory) => {
                const isActive = capybara.accessories.includes(accessory);
                return (
                  <button
                    key={accessory}
                    onClick={() => handleToggleAccessory(accessory)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#8D6E63] bg-[#FFF0E0] scale-105'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{ACCESSORY_ICONS[accessory]}</span>
                    <span className="text-xs text-[#5D4037] font-medium">
                      {ACCESSORY_LABELS[accessory]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#8D6E63] hover:bg-[#6D4E43] text-white font-bold transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
