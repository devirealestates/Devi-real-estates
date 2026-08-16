import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCw, ZoomIn, ZoomOut, Crop } from 'lucide-react';

interface CircularImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const CircularImageCropper: React.FC<CircularImageCropperProps> = ({
  image,
  onCropComplete,
  onCancel
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const img = imageRef.current;
    const outputWidth = 400;  // Output width
    const outputHeight = 500; // Output height (portrait 4:5 ratio)
    const cornerRadius = 20; // Rounded corners
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Clear canvas
    ctx.clearRect(0, 0, outputWidth, outputHeight);

    // Create rounded rectangle clip path
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(outputWidth - cornerRadius, 0);
    ctx.quadraticCurveTo(outputWidth, 0, outputWidth, cornerRadius);
    ctx.lineTo(outputWidth, outputHeight - cornerRadius);
    ctx.quadraticCurveTo(outputWidth, outputHeight, outputWidth - cornerRadius, outputHeight);
    ctx.lineTo(cornerRadius, outputHeight);
    ctx.quadraticCurveTo(0, outputHeight, 0, outputHeight - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.clip();

    // Get the natural image dimensions
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    // Get the preview container dimensions
    const previewContainer = imageRef.current.parentElement;
    const containerWidth = previewContainer?.clientWidth || 220;
    const containerHeight = previewContainer?.clientHeight || 275;
    
    // The crop area is 85% of the container (7.5% margin on each side)
    const cropAreaWidth = containerWidth * 0.85;
    const cropAreaHeight = containerHeight * 0.85;
    
    // The image uses object-contain, so calculate the base scale
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    const baseScale = Math.min(scaleX, scaleY);
    
    // Total scale applied to the image
    const totalScale = baseScale * zoom;
    
    // Convert from preview coordinates to original image coordinates
    const cropCenterInImageX = imgWidth / 2 - (position.x / totalScale);
    const cropCenterInImageY = imgHeight / 2 - (position.y / totalScale);
    
    // The crop area dimensions in original image coordinates
    const cropWidthInImage = cropAreaWidth / totalScale;
    const cropHeightInImage = cropAreaHeight / totalScale;
    
    // Calculate the top-left corner of the crop area in original image coordinates
    const srcX = cropCenterInImageX - cropWidthInImage / 2;
    const srcY = cropCenterInImageY - cropHeightInImage / 2;

    // Draw the cropped and scaled image
    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      srcX,
      srcY,
      cropWidthInImage,
      cropHeightInImage,
      -outputWidth / 2,
      -outputHeight / 2,
      outputWidth,
      outputHeight
    );
    ctx.restore();

    // Convert to blob and upload to Cloudinary
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', 'devirealestates');
      formData.append('folder', 'team_members');

      try {
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/drr2mblir/image/upload',
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();
        setIsProcessing(false);
        onCropComplete(data.secure_url);
      } catch (error) {
        console.error('Error uploading cropped image:', error);
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.95);
  }, [zoom, rotation, position, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[60] p-3">
      <div className="bg-white rounded-2xl w-full max-w-[340px] sm:max-w-[360px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5">
            <Crop className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">Crop Profile Picture</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="w-7 h-7 p-0 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3.5 overflow-y-auto">
          {/* Crop Area */}
          <div 
            className="relative w-full max-w-[210px] mx-auto bg-gray-950 rounded-xl overflow-hidden cursor-move shadow-inner"
            style={{ aspectRatio: '4/5' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              draggable={false}
            />
            
            {/* Rounded Rectangle Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <mask id="rectMask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <rect x="7.5%" y="7.5%" width="85%" height="85%" rx="16" ry="16" fill="black" />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.55)"
                  mask="url(#rectMask)"
                />
                <rect
                  x="7.5%"
                  y="7.5%"
                  width="85%"
                  height="85%"
                  rx="16"
                  ry="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              </svg>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-1.5 mb-2.5">
            Drag to reposition image
          </p>

          {/* Controls */}
          <div className="space-y-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            {/* Zoom */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <ZoomOut className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <ZoomIn className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="w-9 text-right font-medium text-[11px]">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <RotateCw className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="w-9 text-right font-medium text-[11px]">{rotation}°</span>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-gray-500 hover:text-gray-900 px-2.5"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                Reset Position
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="flex gap-2 p-3 border-t border-gray-100 bg-gray-50/50">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 h-9 rounded-xl text-xs font-medium"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={getCroppedImage}
            className="flex-1 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium shadow-sm transition-all"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CircularImageCropper;
