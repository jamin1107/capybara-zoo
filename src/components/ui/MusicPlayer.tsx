import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";

interface Song {
  id: number;
  title: string;
  audioUrl: string | null;
  fileName: string | null;
  duration: number; // seconds
}

const DEFAULT_SONGS: Song[] = [
  { id: 1, title: "以后别做朋友", audioUrl: null, fileName: null, duration: 0 },
  { id: 2, title: "学着爱", audioUrl: null, fileName: null, duration: 0 },
  { id: 3, title: "你，好不好？", audioUrl: null, fileName: null, duration: 0 },
  { id: 4, title: "如果雨之后", audioUrl: null, fileName: null, duration: 0 },
  { id: 5, title: "终于了解", audioUrl: null, fileName: null, duration: 0 },
  { id: 6, title: "爱过你", audioUrl: null, fileName: null, duration: 0 },
  { id: 7, title: "怎么了", audioUrl: null, fileName: null, duration: 0 },
  { id: 8, title: "拍档", audioUrl: null, fileName: null, duration: 0 },
  { id: 9, title: "小时候", audioUrl: null, fileName: null, duration: 0 },
  { id: 10, title: "至少我还未失去你", audioUrl: null, fileName: null, duration: 0 },
];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const MusicPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const currentFileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSong = songs[currentIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setSongs((prev) =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, duration: audio.duration } : s
        )
      );
    });
    audio.addEventListener("ended", () => {
      handleNext();
    });
    audio.addEventListener("error", () => {
      console.error("音频播放错误");
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("ended", () => {});
      audio.removeEventListener("error", () => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load audio source when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong?.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      audio.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentIndex, currentSong?.audioUrl]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, currentSong?.audioUrl]);

  const handleNext = useCallback(() => {
    // Find next song with audio
    let nextIndex = (currentIndex + 1) % songs.length;
    let attempts = 0;
    while (!songs[nextIndex]?.audioUrl && attempts < songs.length) {
      nextIndex = (nextIndex + 1) % songs.length;
      attempts++;
    }

    if (songs[nextIndex]?.audioUrl) {
      setCurrentIndex(nextIndex);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, songs]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    // Find previous song with audio
    let prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    let attempts = 0;
    while (!songs[prevIndex]?.audioUrl && attempts < songs.length) {
      prevIndex = (prevIndex - 1 + songs.length) % songs.length;
      attempts++;
    }

    if (songs[prevIndex]?.audioUrl) {
      setCurrentIndex(prevIndex);
      setCurrentTime(0);
    }
  }, [currentIndex, songs]);

  const handleFileUpload = useCallback(
    (songIndex: number, file: File) => {
      const url = URL.createObjectURL(file);

      // Clean up old URL if exists
      setSongs((prev) => {
        const oldUrl = prev[songIndex]?.audioUrl;
        if (oldUrl) URL.revokeObjectURL(oldUrl);

        return prev.map((s, i) =>
          i === songIndex
            ? { ...s, audioUrl: url, fileName: file.name, duration: 0 }
            : s
        );
      });

      // Set this song as current and start playing
      setCurrentIndex(songIndex);
      setIsPlaying(true);
    },
    []
  );

  const triggerFileUpload = useCallback(
    (songIndex: number) => {
      // We need to handle this differently since we can't pass index to input
      // Store the target index temporarily
      (window as any).__musicPlayerTargetIndex = songIndex;
      currentFileInputRef.current?.click();
    },
    []
  );

  const handleGlobalFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const targetIndex = (window as any).__musicPlayerTargetIndex ?? currentIndex;
      handleFileUpload(targetIndex, file);

      // Reset input
      e.target.value = "";
    },
    [currentIndex, handleFileUpload]
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleProgressDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      handleProgressClick(e as any);
    },
    [isDragging, handleProgressClick]
  );

  const selectSong = useCallback(
    (index: number) => {
      if (songs[index]?.audioUrl) {
        setCurrentIndex(index);
        setCurrentTime(0);
        setIsPlaying(true);
      }
    },
    [songs]
  );

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Floating button
  if (!isOpen) {
    return (
      <>
        <input
          type="file"
          ref={currentFileInputRef}
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
          className="hidden"
          onChange={handleGlobalFileChange}
        />
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
          aria-label="打开音乐播放器"
        >
          🎵
        </button>
      </>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={currentFileInputRef}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        className="hidden"
        onChange={handleGlobalFileChange}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        onClick={() => setIsOpen(false)}
      />

      {/* Player Panel */}
      <div
        className="fixed bottom-6 right-6 z-[9999] w-[350px] max-h-[500px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <h2 className="text-white font-semibold text-base">周兴哲音乐播放器</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Song List */}
        <div className="overflow-y-auto max-h-[300px] px-2 py-2 scrollbar-hide">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 group transition-all duration-200",
                index === currentIndex && song.audioUrl
                  ? "bg-purple-500/20 border border-purple-400/30"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              {/* Song Number / Playing Indicator */}
              <div className="w-6 text-center flex-shrink-0">
                {index === currentIndex && isPlaying ? (
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      index === currentIndex ? "text-purple-400" : "text-white/40"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Song Title */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => selectSong(index)}
              >
                <p
                  className={cn(
                    "text-sm truncate",
                    index === currentIndex ? "text-purple-300 font-medium" : "text-white/80"
                  )}
                >
                  {song.title}
                </p>
                {song.fileName && (
                  <p className="text-[10px] text-white/40 truncate">{song.fileName}</p>
                )}
              </div>

              {/* Upload / Duration Badge */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {song.audioUrl ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/50">
                      {formatTime(song.duration)}
                    </span>
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                ) : null}
                <button
                  onClick={() => triggerFileUpload(index)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs transition-all duration-200",
                    song.audioUrl
                      ? "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-400/20"
                  )}
                  title="上传音频文件"
                >
                  📂
                </button>
              </div>

              {/* Play/Pause button for this song */}
              {song.audioUrl && (
                <button
                  onClick={() => {
                    if (index === currentIndex) {
                      togglePlay();
                    } else {
                      selectSong(index);
                    }
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                    index === currentIndex
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  )}
                >
                  {index === currentIndex && isPlaying ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Player Controls */}
        <div className="px-4 pb-4 pt-2 border-t border-white/10">
          {/* Now Playing */}
          <div className="mb-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
              正在播放
            </p>
            <p className="text-white font-medium text-sm truncate">
              {currentSong?.audioUrl ? currentSong.title : "请上传音频文件"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div
              ref={progressRef}
              className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onMouseDown={() => setIsDragging(true)}
              onMouseMove={handleProgressDrag}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPercent}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/50">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-white/50">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="上一首"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentSong?.audioUrl}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                currentSong?.audioUrl
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-xl"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="下一首"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label={volume === 0 ? "取消静音" : "静音"}
            >
              {volume === 0 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
              aria-label="音量"
            />
            <span className="text-[10px] text-white/40 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
