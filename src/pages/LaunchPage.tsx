import { useState, useCallback } from 'react';
import { GLTFLoader } from 'three-stdlib';
import capybaraModel from '@/assets/capybara.glb?url';

interface LaunchPageProps {
  onStart: () => void;
}

export function LaunchPage({ onStart }: LaunchPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleStart = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    setStatusText('正在加载卡皮巴拉模型...');

    const loader = new GLTFLoader();
    loader.load(
      capybaraModel,
      () => {
        setProgress(100);
        setStatusText('加载完成！即将进入游戏...');
        setTimeout(() => {
          onStart();
        }, 600);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(pct);
          if (pct < 30) setStatusText('正在下载模型数据...');
          else if (pct < 70) setStatusText('正在解析3D模型...');
          else setStatusText('即将完成...');
        }
      },
      () => {
        setProgress(100);
        setStatusText('模型加载异常，但你可以继续游戏');
        setTimeout(() => {
          onStart();
        }, 600);
      }
    );
  }, [onStart]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* Splash image as full background */}
      <img
        src="/splash.png"
        alt="卡皮巴拉养成记"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom area - button and credits overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-16">
        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="relative px-16 py-4 text-white text-2xl md:text-3xl font-bold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(180deg, #FFD54F 0%, #FFA726 50%, #FF8F00 100%)',
            boxShadow: '0 4px 0 #E65100, 0 6px 20px rgba(0,0,0,0.25)',
            textShadow: '1px 2px 2px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 0 #E65100, 0 10px 24px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 0 #E65100, 0 6px 20px rgba(0,0,0,0.25)';
          }}
        >
          {isLoading ? '加载中...' : '开始游戏'}
        </button>

        {/* Loading progress */}
        {isLoading && (
          <div className="mt-4 w-72 text-center">
            <p className="text-sm text-white/90 mb-2 font-medium drop-shadow">{statusText}</p>
            <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #66BB6A, #43A047)',
                  boxShadow: '0 0 10px rgba(76,175,80,0.5)',
                }}
              />
            </div>
            <p className="text-xs text-white/70 mt-1">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
