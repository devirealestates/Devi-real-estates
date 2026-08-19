import React from 'react';
import { Sparkles, Tag, CheckCircle, Flame, MapPin, Compass, Building, Key, ShieldCheck } from 'lucide-react';

interface PropertyBadgeProps {
  badge?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const getBadgeColor = (badgeText: string): { bgClass: string; icon: any } => {
  const text = badgeText.toLowerCase().trim();

  if (text.includes('new') || text.includes('constructed')) {
    return {
      bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-900/20',
      icon: Sparkles
    };
  }
  if (text.includes('under construction') || text.includes('progress') || text.includes('upcoming')) {
    return {
      bgClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-900/20',
      icon: Building
    };
  }
  if (text.includes('ready') || text.includes('possession') || text.includes('immediate')) {
    return {
      bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/20',
      icon: Key
    };
  }
  if (text.includes('hot') || text.includes('deal') || text.includes('best') || text.includes('offer')) {
    return {
      bgClass: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-900/20',
      icon: Flame
    };
  }
  if (text.includes('prime') || text.includes('location')) {
    return {
      bgClass: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-purple-900/20',
      icon: MapPin
    };
  }
  if (text.includes('negotiable') || text.includes('discount')) {
    return {
      bgClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/20',
      icon: Tag
    };
  }
  if (text.includes('vastu') || text.includes('vaastu')) {
    return {
      bgClass: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-green-900/20',
      icon: Compass
    };
  }
  if (text.includes('gated') || text.includes('secure') || text.includes('luxury')) {
    return {
      bgClass: 'bg-gradient-to-r from-slate-800 to-zinc-900 text-amber-300 border border-amber-400/30 shadow-slate-900/20',
      icon: ShieldCheck
    };
  }
  if (text.includes('corner') || text.includes('facing') || text.includes('east') || text.includes('north')) {
    return {
      bgClass: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-fuchsia-900/20',
      icon: Compass
    };
  }

  // Deterministic palette based on string hash for custom entered badges
  const palette = [
    { bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white', icon: CheckCircle },
    { bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white', icon: Sparkles },
    { bgClass: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white', icon: Tag },
    { bgClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white', icon: Flame },
    { bgClass: 'bg-gradient-to-r from-rose-500 to-red-600 text-white', icon: Tag },
    { bgClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white', icon: Sparkles },
    { bgClass: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white', icon: Tag },
    { bgClass: 'bg-gradient-to-r from-teal-600 to-emerald-700 text-white', icon: CheckCircle },
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

export const PropertyBadge: React.FC<PropertyBadgeProps> = ({
  badge,
  size = 'sm',
  className = '',
  showIcon = true,
}) => {
  if (!badge || badge.trim() === '') return null;

  const cleanBadge = badge.trim();
  const { bgClass, icon: IconComponent } = getBadgeColor(cleanBadge);

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1 rounded-full font-medium tracking-tight',
    sm: 'text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 gap-1 rounded-full font-medium shadow-sm',
    md: 'text-xs sm:text-sm px-3 py-1 sm:py-1.5 gap-1.5 rounded-full font-semibold shadow-sm',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 sm:px-4 sm:py-2 gap-2 rounded-full font-bold shadow-md',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  }[size];

  return (
    <span
      className={`inline-flex items-center select-none backdrop-blur-xs transition-transform duration-200 ${bgClass} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes} flex-shrink-0`} />}
      <span className="truncate leading-none">{cleanBadge}</span>
    </span>
  );
};

export default PropertyBadge;
