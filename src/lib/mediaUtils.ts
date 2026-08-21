export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string; // For videos
}

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // YouTube URLs
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
  // Vimeo URLs
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;
  // Direct video file URLs
  const directVideoRegex = /\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i;
  // Cloudinary video URLs
  const cloudinaryRegex = /res\.cloudinary\.com\/.*\.(mp4|webm|mov)/i;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url) || cloudinaryRegex.test(url);
};

export const getVideoThumbnail = (videoUrl: string): string => {
  if (!videoUrl) return '';
  const trimmed = videoUrl.trim();

  // 1. YouTube thumbnails - handle embed, watch, youtu.be, shorts, and mobile URLs
  if (trimmed.includes('youtube.com/embed/')) {
    const videoId = trimmed.split('/embed/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  if (trimmed.includes('youtube.com/watch?v=') || trimmed.includes('m.youtube.com/watch?v=')) {
    const videoId = trimmed.split('v=')[1]?.split('&')[0]?.split('#')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  if (trimmed.includes('youtu.be/')) {
    const videoId = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  if (trimmed.includes('youtube.com/shorts/')) {
    const videoId = trimmed.split('/shorts/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // 2. Cloudinary Video URLs: Convert to snapshot image (.jpg) with auto frame detection
  if (trimmed.includes('cloudinary.com') || trimmed.includes('res.cloudinary.com')) {
    let thumbUrl = trimmed.replace(/\.(mp4|webm|mov|avi|wmv|mkv|flv|m4v)(\?.*)?$/i, '.jpg$2');
    if (!thumbUrl.endsWith('.jpg') && !thumbUrl.includes('.jpg?')) {
      thumbUrl = `${thumbUrl}.jpg`;
    }
    if (thumbUrl.includes('/video/upload/') && !thumbUrl.includes('/video/upload/so_')) {
      thumbUrl = thumbUrl.replace('/video/upload/', '/video/upload/so_auto,f_jpg,q_auto,w_800/');
    }
    return thumbUrl;
  }

  // 3. Vimeo thumbnails via vumbnail service
  if (trimmed.includes('player.vimeo.com/video/')) {
    const videoId = trimmed.split('/video/')[1]?.split('?')[0];
    if (videoId) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  }

  if (trimmed.includes('vimeo.com/')) {
    const videoId = trimmed.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  }
  
  // 4. Direct video file fallback (with time offset for metadata preview)
  return `${trimmed}#t=0.5`;
};

export const combineMediaItems = (images: string[] = [], videos: string[] = []): MediaItem[] => {
  const mediaItems: MediaItem[] = [];
  
  // Add images
  images.forEach(image => {
    if (image && typeof image === 'string' && !image.startsWith('blob:')) {
      mediaItems.push({
        url: image,
        type: 'image'
      });
    }
  });
  
  // Add videos
  videos.forEach(video => {
    if (video && typeof video === 'string' && !video.startsWith('blob:')) {
      mediaItems.push({
        url: video,
        type: 'video',
        thumbnail: getVideoThumbnail(video)
      });
    }
  });
  
  return mediaItems;
};

export const getEmbedUrl = (videoUrl: string): string => {
  // Convert YouTube watch URLs to embed URLs
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Convert YouTube short URLs
  if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Convert Vimeo URLs to embed format
  if (videoUrl.includes('vimeo.com/') && !videoUrl.includes('/embed/')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  
  return videoUrl;
};
