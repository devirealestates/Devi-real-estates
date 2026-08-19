import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { getEmbedUrl } from '@/lib/mediaUtils';
import WatermarkOverlay from './WatermarkOverlay';

interface ProtectedVideoPlayerProps {
  url: string;
  title?: string;
  thumbnail?: string;
  autoPlay?: boolean;
  className?: string;
  showWatermark?: boolean;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  url,
  title = 'Property Video',
  thumbnail,
  autoPlay = false,
  className = '',
  showWatermark = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const isExternalEmbed = url.includes('youtube.com') || 
                          url.includes('youtu.be') || 
                          url.includes('vimeo.com') ||
                          url.includes('player.vimeo.com');

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (isExternalEmbed) {
    return (
      <div 
        className={`relative aspect-video w-full bg-black rounded-xl overflow-hidden select-none protected-media ${className}`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={getEmbedUrl(url)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
        {/* Floating Brand Watermark on top of embed */}
        {showWatermark && (
          <WatermarkOverlay
            variant="badge"
            size="sm"
            className="top-3 left-3 bottom-auto pointer-events-none opacity-80"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video w-full bg-black rounded-xl overflow-hidden select-none protected-media group ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      {/* Native HTML5 Video Element with strict security flags */}
      <video
        ref={videoRef}
        src={url}
        poster={thumbnail}
        autoPlay={autoPlay}
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain cursor-pointer"
      >
        Your browser does not support the video tag.
      </video>

      {/* Floating Center Watermark Overlay */}
      {showWatermark && (
        <WatermarkOverlay
          variant="center"
          size="md"
        />
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer transition-all duration-300"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 text-slate-900 fill-slate-900" />
          </div>
        </div>
      )}

      {/* Custom Protected Control Bar */}
      <div 
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 flex items-center justify-between text-white transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70 hidden sm:inline font-mono">Devi Real Estates Secure Media</span>
          <button
            onClick={toggleFullScreen}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedVideoPlayer;
