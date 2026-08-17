import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Facebook, Twitter, Copy, Check, Share2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyPrice: string;
  propertyLocation: string;
  propertyId: string;
  propertyImage?: string;
}

const EnhancedShareMenu: React.FC<EnhancedShareMenuProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  propertyId,
  propertyImage
}) => {
  const [copied, setCopied] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const propertyUrl = `${window.location.origin}/property/${propertyId}`;
  const shareLink = `${window.location.origin}/api/property-share?id=${propertyId}`;
  const shareText = `Check out this property: ${propertyTitle}\n📍 ${propertyLocation}\n💰 ${propertyPrice}`;

  const handleWhatsAppShare = () => {
    try {
      const message = `🏠 *${propertyTitle}*\n\n📍 *Location:* ${propertyLocation}\n💰 *Price:* ${propertyPrice}\n\n🔗 *View Details:* ${shareLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
    }
    onClose();
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(propertyUrl).then(() => {
      window.open('https://www.instagram.com/', '_blank');
      onClose();
    }).catch(() => {
      window.open('https://www.instagram.com/', '_blank');
      onClose();
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Property: ${propertyTitle}`);
    const body = encodeURIComponent(`${shareText}\n\nView more details: ${propertyUrl}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    onClose();
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(`${shareText}\n${propertyUrl}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank');
    onClose();
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
    window.open(facebookUrl, '_blank');
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Check out ${propertyTitle} in ${propertyLocation}`,
          url: propertyUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled share
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
      const textArea = document.createElement('textarea');
      textArea.value = propertyUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center pointer-events-auto">
      {/* Full-screen Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal / Bottom Sheet Card */}
      <div 
        className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 z-10 shadow-2xl border-t md:border border-gray-100 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in slide-in-from-bottom md:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Share Property
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Share with your friends and family</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Property Preview Card */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-5 border border-gray-100">
          {propertyImage ? (
            <img 
              src={propertyImage} 
              alt={propertyTitle} 
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold text-lg">
              🏠
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{propertyTitle}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{propertyLocation}</span>
            </p>
            <p className="text-xs font-bold text-orange-600 mt-1">{propertyPrice}</p>
          </div>
        </div>
        
        {/* Share Channels */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-green-50 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-green-600 transition-all shadow-md shadow-green-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-gray-700">WhatsApp</span>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-pink-50 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md shadow-pink-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-gray-700">Instagram</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-blue-50 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md shadow-blue-600/20">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-700">Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-gray-100 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md shadow-black/20">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-700">X (Twitter)</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-indigo-50 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md shadow-indigo-600/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-700">Email</span>
          </button>

          {/* Device Share (if supported) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 hover:bg-orange-50 active:scale-95 group"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md shadow-orange-500/20">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-700">More Apps</span>
            </button>
          )}
        </div>

        {/* Copy Link Section */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Or copy link</p>
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-gray-50 rounded-xl border border-gray-200">
            <input 
              type="text" 
              readOnly 
              value={propertyUrl} 
              className="bg-transparent text-xs text-gray-600 flex-1 outline-none truncate select-all"
            />
            <Button
              onClick={handleCopyUrl}
              size="sm"
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                copied 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EnhancedShareMenu;

