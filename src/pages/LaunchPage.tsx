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
        // 加载失败也进入游戏
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
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-200" />

      {/* Decorative clouds */}
      <div className="absolute top-12 left-1/4 w-24 h-10 bg-white/70 rounded-full blur-sm" />
      <div className="absolute top-20 right-1/4 w-32 h-12 bg-white/60 rounded-full blur-sm" />
      <div className="absolute top-8 left-2/3 w-20 h-8 bg-white/50 rounded-full blur-sm" />

      {/* Flying birds */}
      <div className="absolute top-16 left-1/5 text-lg text-gray-600/60 animate-pulse">
        <svg width="30" height="12" viewBox="0 0 30 12" fill="none">
          <path d="M0 6 Q7 0 15 6 Q22 0 30 6" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Title */}
      <div className="absolute top-12 left-0 right-0 text-center z-10">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider inline-block"
          style={{
            background: 'linear-gradient(180deg, #F5C842 0%, #E8A317 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 0px #8B5E3C) drop-shadow(-1px -1px 0px #8B5E3C) drop-shadow(1px -1px 0px #8B5E3C) drop-shadow(-1px 1px 0px #8B5E3C)',
          }}
        >
          卡皮巴拉养成记
        </h1>
      </div>

      {/* Capybara illustration - CSS art based on the reference image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          {/* Body - large rounded shape */}
          <div
            className="relative"
            style={{
              width: '200px',
              height: '160px',
              background: 'linear-gradient(135deg, #D4944A 0%, #C07830 40%, #A86428 100%)',
              borderRadius: '50% 50% 45% 45%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Fur texture overlay */}
            <div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              }}
            />
          </div>

          {/* Head */}
          <div
            className="absolute"
            style={{
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '90px',
              background: 'linear-gradient(180deg, #D4944A 0%, #C07830 100%)',
              borderRadius: '45% 45% 40% 40%',
              zIndex: 2,
            }}
          >
            {/* Eyes */}
            <div className="absolute" style={{ top: '28px', left: '25px', width: '16px', height: '18px', background: '#2D1810', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }} />
            <div className="absolute" style={{ top: '28px', right: '25px', width: '16px', height: '18px', background: '#2D1810', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }} />
            {/* Eye shine */}
            <div className="absolute" style={{ top: '30px', left: '29px', width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
            <div className="absolute" style={{ top: '30px', right: '29px', width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />

            {/* Nose/snout */}
            <div
              className="absolute"
              style={{
                top: '48px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '28px',
                background: 'linear-gradient(180deg, #B07040 0%, #9A6030 100%)',
                borderRadius: '50%',
              }}
            >
              {/* Nostrils */}
              <div className="absolute" style={{ top: '10px', left: '10px', width: '6px', height: '4px', background: '#6B4226', borderRadius: '50%' }} />
              <div className="absolute" style={{ top: '10px', right: '10px', width: '6px', height: '4px', background: '#6B4226', borderRadius: '50%' }} />
              {/* Mouth */}
              <div className="absolute" style={{ bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '8px', borderBottom: '2px solid #6B4226', borderRadius: '0 0 50% 50%' }} />
            </div>

            {/* Cheeks - cute blush */}
            <div className="absolute" style={{ top: '42px', left: '8px', width: '18px', height: '12px', background: 'rgba(255,150,100,0.4)', borderRadius: '50%', filter: 'blur(2px)' }} />
            <div className="absolute" style={{ top: '42px', right: '8px', width: '18px', height: '12px', background: 'rgba(255,150,100,0.4)', borderRadius: '50%', filter: 'blur(2px)' }} />

            {/* Ears */}
            <div
              className="absolute"
              style={{
                top: '-8px',
                left: '12px',
                width: '24px',
                height: '20px',
                background: '#B07040',
                borderRadius: '50% 50% 40% 40%',
                transform: 'rotate(-15deg)',
              }}
            >
              <div style={{ width: '14px', height: '12px', background: '#C89060', borderRadius: '50%', margin: '4px auto 0' }} />
            </div>
            <div
              className="absolute"
              style={{
                top: '-8px',
                right: '12px',
                width: '24px',
                height: '20px',
                background: '#B07040',
                borderRadius: '50% 50% 40% 40%',
                transform: 'rotate(15deg)',
              }}
            >
              <div style={{ width: '14px', height: '12px', background: '#C89060', borderRadius: '50%', margin: '4px auto 0' }} />
            </div>

            {/* Whiskers */}
            <div className="absolute" style={{ top: '52px', left: '-8px', width: '16px', height: '1px', background: '#8B6040', transform: 'rotate(-10deg)' }} />
            <div className="absolute" style={{ top: '56px', left: '-6px', width: '14px', height: '1px', background: '#8B6040', transform: 'rotate(5deg)' }} />
            <div className="absolute" style={{ top: '52px', right: '-8px', width: '16px', height: '1px', background: '#8B6040', transform: 'rotate(10deg)' }} />
            <div className="absolute" style={{ top: '56px', right: '-6px', width: '14px', height: '1px', background: '#8B6040', transform: 'rotate(-5deg)' }} />
          </div>

          {/* Legs */}
          <div className="absolute" style={{ bottom: '-8px', left: '20px', width: '28px', height: '24px', background: '#9A5820', borderRadius: '40% 40% 50% 50%' }} />
          <div className="absolute" style={{ bottom: '-8px', left: '60px', width: '28px', height: '24px', background: '#9A5820', borderRadius: '40% 40% 50% 50%' }} />
          <div className="absolute" style={{ bottom: '-8px', right: '60px', width: '28px', height: '24px', background: '#9A5820', borderRadius: '40% 40% 50% 50%' }} />
          <div className="absolute" style={{ bottom: '-8px', right: '20px', width: '28px', height: '24px', background: '#9A5820', borderRadius: '40% 40% 50% 50%' }} />
        </div>
      </div>

      {/* Ground / grass area */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <div
          className="relative overflow-hidden"
          style={{ height: '35vh', background: 'linear-gradient(180deg, #7BC67E 0%, #5DAF62 30%, #4A9E52 100%)' }}
        >
          {/* Grass tufts */}
          <div className="absolute bottom-4 left-10 text-green-700/80 text-2xl"></div>
          <div className="absolute bottom-6 left-1/4 text-green-700/70 text-xl"></div>
          <div className="absolute bottom-3 right-1/4 text-green-700/80 text-2xl"></div>
          <div className="absolute bottom-8 right-16 text-green-700/70 text-lg"></div>

          {/* Flowers */}
          <div className="absolute bottom-10 left-12 text-xl">🌼</div>
          <div className="absolute bottom-16 left-1/3 text-lg"></div>
          <div className="absolute bottom-12 right-1/3 text-xl">🌸</div>
          <div className="absolute bottom-8 right-12 text-lg"></div>
          <div className="absolute bottom-20 left-1/2 text-xl">🌻</div>
          <div className="absolute bottom-14 left-16 text-sm">🌷</div>
          <div className="absolute bottom-18 right-20 text-sm"></div>

          {/* Small rocks */}
          <div className="absolute bottom-12 left-1/5 w-8 h-5 bg-gray-400/60 rounded-full" />
          <div className="absolute bottom-16 right-1/3 w-6 h-4 bg-gray-400/50 rounded-full" />
        </div>
      </div>

      {/* Falling leaves animation */}
      <div className="absolute top-1/4 left-16 text-xl animate-bounce opacity-60" style={{ animationDuration: '4s' }}></div>
      <div className="absolute top-1/3 right-20 text-lg animate-bounce opacity-50" style={{ animationDuration: '3s', animationDelay: '1s' }}>🍃</div>
      <div className="absolute top-2/3 left-24 text-lg animate-bounce opacity-40" style={{ animationDuration: '5s', animationDelay: '2s' }}>🍂</div>

      {/* Bottom area - button and credits */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12">
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

        {/* Credits */}
        <p className="mt-3 text-sm text-white/80 font-medium drop-shadow">
          制作人：jamin
        </p>
      </div>
    </div>
  );
}
