import { useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type PhotoFilter = 'normal' | 'warm' | 'cool' | 'vintage' | 'bw' | 'dreamy';
type PhotoFrame = 'none' | 'cute' | 'film' | 'polaroid';

interface CapturePreview {
  dataUrl: string;
  timestamp: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTERS: { id: PhotoFilter; label: string; icon: string }[] = [
  { id: 'normal', label: '正常', icon: '📷' },
  { id: 'warm', label: '暖色', icon: '☀️' },
  { id: 'cool', label: '冷色', icon: '❄️' },
  { id: 'vintage', label: '复古', icon: '📻' },
  { id: 'bw', label: '黑白', icon: '⬛' },
  { id: 'dreamy', label: '梦幻', icon: '✨' },
];

const FRAMES: { id: PhotoFrame; label: string }[] = [
  { id: 'none', label: '无框' },
  { id: 'cute', label: '可爱框' },
  { id: 'film', label: '胶片框' },
  { id: 'polaroid', label: '拍立得框' },
];

const DEFAULT_CAMERA_POSITION = [8, 6, 8];

// ─── Filter Application (pixel manipulation on ImageData) ────────────────────

function applyFilterToImageData(
  imageData: ImageData,
  filter: PhotoFilter
): ImageData {
  if (filter === 'normal') return imageData;

  const data = new Uint8ClampedArray(imageData.data);
  const len = data.length;

  switch (filter) {
    case 'warm': {
      // Increase red, decrease blue
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, data[i] + 20);     // R+
        data[i + 2] = Math.max(0, data[i + 2] - 15); // B-
      }
      break;
    }
    case 'cool': {
      // Increase blue, decrease red
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.max(0, data[i] - 15);      // R-
        data[i + 2] = Math.min(255, data[i + 2] + 20); // B+
      }
      break;
    }
    case 'vintage': {
      // Sepia + subtle grain
      for (let i = 0; i < len; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        // Add grain
        const noise = (Math.random() - 0.5) * 15;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      break;
    }
    case 'bw': {
      for (let i = 0; i < len; i += 4) {
        const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      break;
    }
    case 'dreamy': {
      // Soften + pink tint (skip the heavy blur, just tint + brightness)
      for (let i = 0; i < len; i += 4) {
        // Pink tint
        data[i] = Math.min(255, data[i] + 15);       // R+
        data[i + 2] = Math.min(255, data[i + 2] + 10); // B+
        // Slight brightness boost
        data[i] = Math.min(255, data[i] + 8);
        data[i + 1] = Math.min(255, data[i + 1] + 8);
        data[i + 2] = Math.min(255, data[i + 2] + 8);
      }
      break;
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

// ─── Frame Drawing ───────────────────────────────────────────────────────────

function drawFrameOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: PhotoFrame
): void {
  const margin = 12;

  switch (frame) {
    case 'none':
      return;

    case 'cute': {
      // Pink rounded border with paw prints
      ctx.strokeStyle = '#FFB6C1';
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';

      const r = 16;
      ctx.beginPath();
      ctx.moveTo(margin + r, margin);
      ctx.lineTo(width - margin - r, margin);
      ctx.quadraticCurveTo(width - margin, margin, width - margin, margin + r);
      ctx.lineTo(width - margin, height - margin - r);
      ctx.quadraticCurveTo(width - margin, height - margin, width - margin - r, height - margin);
      ctx.lineTo(margin + r, height - margin);
      ctx.quadraticCurveTo(margin, height - margin, margin, height - margin - r);
      ctx.lineTo(margin, margin + r);
      ctx.quadraticCurveTo(margin, margin, margin + r, margin);
      ctx.stroke();

      // Paw prints at corners
      const pawColor = '#FF69B4';
      const corners = [
        [margin + 8, margin + 8],
        [width - margin - 8, margin + 8],
        [margin + 8, height - margin - 8],
        [width - margin - 8, height - margin - 8],
      ];

      ctx.fillStyle = pawColor;
      for (const [cx, cy] of corners) {
        // Main pad
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Toe pads
        const toePositions = [
          [cx - 4, cy - 7],
          [cx, cy - 9],
          [cx + 4, cy - 7],
        ];
        for (const [tx, ty] of toePositions) {
          ctx.beginPath();
          ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'film': {
      const stripHeight = 28;

      // Black strips top and bottom
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, stripHeight);
      ctx.fillRect(0, height - stripHeight, width, stripHeight);

      // Film holes
      ctx.fillStyle = '#555';
      const holeSize = 10;
      const holeSpacing = 28;
      const startY = stripHeight / 2 - holeSize / 2;

      for (let x = 12; x < width - 12; x += holeSpacing) {
        // Top holes
        ctx.fillRect(x, startY, holeSize, holeSize);
        // Bottom holes
        ctx.fillRect(x, height - stripHeight / 2 - holeSize / 2, holeSize, holeSize);
      }
      break;
    }

    case 'polaroid': {
      const topSideBorder = 16;
      const bottomBorder = 70;

      // White border
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, width, topSideBorder);                  // top
      ctx.fillRect(0, 0, topSideBorder, height);                  // left
      ctx.fillRect(width - topSideBorder, 0, topSideBorder, height); // right
      ctx.fillRect(0, height - bottomBorder, width, bottomBorder);  // bottom

      // Timestamp text
      const date = new Date();
      const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      ctx.fillStyle = '#444';
      ctx.font = 'italic 14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🐾 Capybara Zoo  ·  ${dateStr}`, width / 2, height - bottomBorder / 2);
      break;
    }
  }
}

// ─── Screenshot Capture ──────────────────────────────────────────────────────

function captureScreenshot(
  filter: PhotoFilter,
  frame: PhotoFrame
): Promise<CapturePreview> {
  return new Promise((resolve, reject) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      reject(new Error('找不到 3D 画布'));
      return;
    }

    try {
      const width = canvas.width;
      const height = canvas.height;

      // Create offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true })!;

      // Draw the WebGL canvas onto the offscreen canvas
      ctx.drawImage(canvas, 0, 0);

      // Apply filter via pixel manipulation
      const imageData = ctx.getImageData(0, 0, width, height);
      const filtered = applyFilterToImageData(imageData, filter);
      ctx.putImageData(filtered, 0, 0);

      // Draw frame on top
      drawFrameOnCanvas(ctx, width, height, frame);

      const dataUrl = offscreen.toDataURL('image/png');
      resolve({ dataUrl, timestamp: Date.now() });
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Preview Modal ───────────────────────────────────────────────────────────

function PreviewModal({
  preview,
  onDownload,
  onCopy,
  onClose,
}: {
  preview: CapturePreview;
  onDownload: () => void;
  onCopy: () => void;
  onClose: () => void;
}) {
  const canCopy = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl p-5 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800">📸 截图预览</h3>

        <img
          src={preview.dataUrl}
          alt="截图预览"
          className="w-full rounded-lg border border-gray-200"
        />

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={onDownload}
            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            💾 保存
          </button>
          {canCopy && (
            <button
              onClick={onCopy}
              className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              📤 分享
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            🔄 重新拍摄
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CameraSystem Component ─────────────────────────────────────────────

export function CameraSystem({
  cameraMode,
  onExit,
}: {
  cameraMode: boolean;
  onExit: () => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('normal');
  const [selectedFrame, setSelectedFrame] = useState<PhotoFrame>('none');
  const [preview, setPreview] = useState<CapturePreview | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [, setTick] = useState(0);

  // Re-render viewfinder periodically for filter preview hint
  // (filter is applied on capture, not live, to avoid perf issues)

  // Capture screenshot
  const handleCapture = useCallback(async () => {
    // Flash animation
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    try {
      const result = await captureScreenshot(selectedFilter, selectedFrame);
      setPreview(result);
    } catch (err) {
      console.error('截图失败:', err);
    }
  }, [selectedFilter, selectedFrame]);

  // Download image
  const handleDownload = useCallback(() => {
    if (!preview) return;
    const ts = new Date(preview.timestamp).toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.download = `水豚动物园-${ts}.png`;
    link.href = preview.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [preview]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!preview) return;
    try {
      const res = await fetch(preview.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      // Fallback to download
      handleDownload();
    }
  }, [preview, handleDownload]);

  // Reset camera
  const handleResetCamera = useCallback(() => {
    window.dispatchEvent(new CustomEvent('capybara-reset-camera'));
    setTick((t) => t + 1);
  }, []);

  if (!cameraMode && !preview) return null;

  return (
    <>
      {/* Flash overlay */}
      {flashActive && (
        <div className="fixed inset-0 z-[250] bg-white pointer-events-none animate-pulse" />
      )}

      {/* Photo mode viewfinder overlay */}
      {cameraMode && !preview && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Dark vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%)',
            }}
          />

          {/* Viewfinder frame */}
          <div className="absolute inset-6 border-2 border-white/50 rounded-xl pointer-events-none" />

          {/* Corner accents */}
          <div className="absolute top-5 left-5 w-10 h-10 border-t-[3px] border-l-[3px] border-white/70 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-5 right-5 w-10 h-10 border-t-[3px] border-r-[3px] border-white/70 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-10 h-10 border-b-[3px] border-l-[3px] border-white/70 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-[3px] border-r-[3px] border-white/70 rounded-br-lg pointer-events-none" />

          {/* Top hint */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
            <span className="text-white/90 text-xs font-medium tracking-wide">
              📷 拍照模式 · 拖动调整视角 · 滚轮缩放
            </span>
          </div>

          {/* Bottom control bar */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-md px-4 pb-6 pt-3">
              {/* Filter row */}
              <div className="flex items-center gap-1.5 mb-2 justify-center overflow-x-auto">
                <span className="text-white/50 text-[10px] mr-1 shrink-0">滤镜</span>
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      selectedFilter === f.id
                        ? 'bg-white/90 text-black shadow-md scale-105'
                        : 'bg-white/15 text-white/80 hover:bg-white/25'
                    }`}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>

              {/* Frame row */}
              <div className="flex items-center gap-1.5 mb-3 justify-center overflow-x-auto">
                <span className="text-white/50 text-[10px] mr-1 shrink-0">相框</span>
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      selectedFrame === f.id
                        ? 'bg-white/90 text-black shadow-md scale-105'
                        : 'bg-white/15 text-white/80 hover:bg-white/25'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Action buttons row */}
              <div className="flex items-center justify-center gap-4">
                {/* Exit */}
                <button
                  onClick={onExit}
                  className="w-10 h-10 bg-white/15 hover:bg-red-500/80 rounded-full flex items-center justify-center transition-colors"
                  title="退出拍照模式"
                >
                  <span className="text-base">✕</span>
                </button>

                {/* Reset camera */}
                <button
                  onClick={handleResetCamera}
                  className="w-10 h-10 bg-white/15 hover:bg-blue-500/80 rounded-full flex items-center justify-center transition-colors"
                  title="重置视角"
                >
                  <span className="text-sm">🔄</span>
                </button>

                {/* Capture button */}
                <button
                  onClick={handleCapture}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
                  title="截图"
                >
                  <span className="text-3xl">📸</span>
                </button>

                {/* Spacer */}
                <div className="w-10 h-10" />
                <div className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          preview={preview}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
