import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_FUR_COLORS, CAPYBARA_ACCESSORIES } from '@/types/game';

interface CapybaraListProps {
  onSelectCapybara: (id: string) => void;
  onEditCapybara: (id: string) => void;
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

export function CapybaraList({ onSelectCapybara, onEditCapybara, onClose }: CapybaraListProps) {
  const capybaras = useGameStore((state) => state.capybaras);
  const addCapybara = useGameStore((state) => state.addCapybara);
  const removeCapybara = useGameStore((state) => state.removeCapybara);
  const selectCapybara = useGameStore((state) => state.selectCapybara);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(DEFAULT_FUR_COLORS[0]);

  const handleAdd = () => {
    addCapybara(newName.trim() || '新卡皮巴拉', newColor);
    setNewName('');
    setNewColor(DEFAULT_FUR_COLORS[0]);
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    removeCapybara(id);
  };

  const handleSelect = (id: string) => {
    selectCapybara(id);
    onSelectCapybara(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FFF8F0] to-[#FFF0E0]">
          <h2 className="text-lg font-bold text-[#5D4037]">卡皮巴拉列表</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {/* Add Button / Form */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#8D6E63] hover:bg-[#FFF8F0] transition-all text-[#8D6E63] font-medium"
            >
              <span className="text-lg">+</span>
              <span>添加卡皮巴拉</span>
            </button>
          ) : (
            <div className="mb-4 p-4 rounded-xl bg-[#FFF8F0] border border-[#D7CCC8] space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="名字..."
                maxLength={12}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#8D6E63] focus:outline-none text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {DEFAULT_FUR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      newColor === color ? 'ring-2 ring-[#8D6E63] ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-1.5 rounded-lg bg-[#8D6E63] text-white text-sm font-medium hover:bg-[#6D4E43] transition-colors"
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Capybara List */}
          <div className="space-y-2">
            {capybaras.map((capybara) => (
              <div
                key={capybara.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Color swatch */}
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: capybara.furColor }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-[#5D4037] truncate">{capybara.name}</span>
                    {capybara.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFF0E0] text-[#8D6E63]">
                        自定义
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {capybara.accessories.length > 0 ? (
                      capybara.accessories.map((acc) => (
                        <span key={acc} className="text-xs" title={acc}>
                          {ACCESSORY_ICONS[acc] ?? '🎁'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">无配饰</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelect(capybara.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FFF0E0] transition-colors text-[#8D6E63]"
                    title="选择"
                  >
                    👀
                  </button>
                  <button
                    onClick={() => onEditCapybara(capybara.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FFF0E0] transition-colors text-[#8D6E63]"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemove(capybara.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-red-400 hover:text-red-500"
                    title="移除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
          共 {capybaras.length} 只卡皮巴拉
        </div>
      </div>
    </div>
  );
}
