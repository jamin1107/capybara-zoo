import { useGameStore } from '@/store/gameStore';

const WEATHER_MAP: Record<string, { icon: string; name: string; hint: string }> = {
  sunny: { icon: '☀️', name: '晴天', hint: '温暖的好天气！' },
  cloudy: { icon: '⛅', name: '多云', hint: '云层较多，比较凉爽' },
  rainy: { icon: '🌧️', name: '雨天', hint: '下雨了，注意保暖！' },
};

export function WeatherWidget() {
  const weather = useGameStore((state) => state.weather);
  const changeWeather = useGameStore((state) => state.changeWeather);
  const info = WEATHER_MAP[weather.type];

  const durationMin = Math.floor(weather.duration / 60);
  const durationSec = Math.floor(weather.duration % 60);

  const handleClick = () => {
    const types: Array<'sunny' | 'cloudy' | 'rainy'> = ['sunny', 'cloudy', 'rainy'];
    const currentIdx = types.indexOf(weather.type);
    const next = types[(currentIdx + 1) % types.length];
    changeWeather(next);
  };

  return (
    <div
      className="absolute top-16 left-3 md:left-4 z-10"
      onClick={handleClick}
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div className="px-3 py-2 rounded-xl cursor-pointer select-none transition-all hover:scale-105">
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.icon}</span>
          <div>
            <div className="text-white text-sm font-medium">{info.name}</div>
            <div className="text-white/60 text-xs">
              {durationMin}:{durationSec.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="text-white/50 text-[10px] mt-1">{info.hint}</div>
      </div>
    </div>
  );
}
