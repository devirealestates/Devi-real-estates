import React from 'react';

interface WatermarkOverlayProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLogo?: boolean;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  size = 'md',
  className = '',
  showLogo = true,
}) => {
  // Center watermark sizes
  const centerSizeStyles = {
    sm: {
      container: 'px-3 py-1.5 rounded-xl opacity-30',
      logo: 'h-6 sm:h-8 w-auto mb-0.5',
      text: 'text-[11px] sm:text-xs font-extrabold tracking-wider',
    },
    md: {
      container: 'px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl opacity-35 sm:opacity-40',
      logo: 'h-10 sm:h-14 w-auto mb-1',
      text: 'text-sm sm:text-xl font-extrabold tracking-widest',
    },
    lg: {
      container: 'px-8 sm:px-12 py-4 sm:py-6 rounded-3xl opacity-40 sm:opacity-45',
      logo: 'h-14 sm:h-20 w-auto mb-2',
      text: 'text-xl sm:text-3xl font-extrabold tracking-widest',
    },
  }[size];

  return (
    <div 
      className={`absolute inset-0 pointer-events-none select-none flex items-center justify-center z-20 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div 
        className={`flex flex-col items-center justify-center transform -rotate-12 bg-black/35 backdrop-blur-[2px] border border-white/20 shadow-2xl transition-all duration-300 ${centerSizeStyles.container}`}
      >
        {showLogo && (
          <img
            src="/dre-logo.png"
            alt=""
            className={`${centerSizeStyles.logo} object-contain drop-shadow-md brightness-110`}
            draggable={false}
          />
        )}
        <span className={`text-white uppercase drop-shadow-lg text-center font-display ${centerSizeStyles.text}`}>
          Devi Real Estates
        </span>
      </div>
    </div>
  );
};

export default WatermarkOverlay;
