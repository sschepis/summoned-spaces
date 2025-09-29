import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Share, Heart, MoreHorizontal } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist?: string;
  artwork?: string;
  duration?: number;
  className?: string;
  showDownload?: boolean;
  onLike?: () => void;
  onShare?: () => void;
}

export function AudioPlayer({ 
  src, 
  title, 
  artist, 
  artwork, 
  className = '',
  showDownload = false,
  onLike,
  onShare
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // Simulated waveform data
  const waveformBars = Array.from({ length: 60 }, (_, i) => 
    Math.sin(i * 0.1) * 0.5 + 0.5 + Math.random() * 0.3
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !audio.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      audio.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audio.muted = false;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Track Header */}
      <div className="flex items-start space-x-4 mb-6">
        {artwork ? (
          <img
            src={artwork}
            alt={title}
            className="w-16 h-16 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 
                        flex items-center justify-center">
            <div className="text-white font-bold text-lg">
              {title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-lg">{title}</h3>
          {artist && (
            <p className="text-gray-400 text-sm truncate">{artist}</p>
          )}
          <div className="flex items-center space-x-3 mt-2">
            <span className="text-xs text-gray-500">
              {isLoading ? 'Loading...' : formatTime(duration)}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              {playbackRate}x speed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-lg transition-colors ${
              isLiked 
                ? 'text-pink-400 bg-pink-400/10' 
                : 'text-gray-400 hover:text-pink-400 hover:bg-pink-400/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          {showDownload && (
            <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-400/10">
              <Download className="w-4 h-4" />
            </button>
          )}
          
          <button 
            onClick={onShare}
            className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-green-400/10"
          >
            <Share className="w-4 h-4" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-4">
        <div className="flex items-end justify-between h-16 px-2">
          {waveformBars.map((height, index) => {
            const isPlayed = (index / waveformBars.length) * 100 <= progressPercentage;
            return (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed 
                    ? 'bg-gradient-to-t from-cyan-400 to-purple-400' 
                    : 'bg-white/20'
                } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="w-full h-2 bg-white/10 rounded-full cursor-pointer mb-4 group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-150
                   relative group-hover:h-3 group-hover:-mt-0.5"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white 
                        rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => skip(-15)}
              className="p-2 text-white hover:text-cyan-400 transition-colors rounded-full hover:bg-white/10"
              title="Skip back 15s"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full
                       hover:from-cyan-400 hover:to-purple-400 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(15)}
              className="p-2 text-white hover:text-cyan-400 transition-colors rounded-full hover:bg-white/10"
              title="Skip forward 15s"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2 group">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:text-cyan-400 transition-colors rounded-full hover:bg-white/10"
            >
              {isMuted || volume === 0 ? 
                <VolumeX className="w-4 h-4" /> : 
                <Volume2 className="w-4 h-4" />
              }
            </button>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Playback Speed */}
          <div className="relative group">
            <button className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors
                           bg-white/10 rounded-lg hover:bg-white/20">
              {playbackRate}x
            </button>
            
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-slate-800 rounded-lg shadow-2xl border border-white/10 py-2 min-w-20">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`w-full px-3 py-1 text-left text-sm transition-colors ${
                      playbackRate === rate
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}