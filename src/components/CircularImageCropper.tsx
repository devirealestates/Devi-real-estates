import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    const containerWidth = previewContainer?.clientWidth || 400;
    const containerHeight = previewContainer?.clientHeight || 500;
    
    // The crop area is 85% of the container (7.5% margin on each side)
    const cropAreaWidth = containerWidth * 0.85;
    const cropAreaHeight = containerHeight * 0.85;
    const cropAreaCenterX = containerWidth / 2;
    const cropAreaCenterY = containerHeight / 2;
    
    // The image uses object-contain, so calculate the base scale
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    const baseScale = Math.min(scaleX, scaleY);
    
    // CSS transform: translate(position.x, position.y) scale(zoom) from center
    // The image center after transform is at container center + position offset
    // After scaling, the image is scaled from its center
    
    // Total scale applied to the image
    const totalScale = baseScale * zoom;
    
    // In the preview, the crop area center is at the container center
    // The image center is at containerCenter + position (due to translate)
    // So the crop area center relative to the image center is: -position
    
    // Convert from preview coordinates to original image coordinates
    // The crop area center in image coordinates (before any transforms)
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
      if (!blob) return;

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
        onCropComplete(data.secure_url);
      } catch (error) {
        console.error('Error uploading cropped image:', error);
      }
    }, 'image/jpeg', 0.95);
  }, [zoom, rotation, position, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base font-semibold">Crop Profile Picture</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          <div 
            className="relative w-full max-w-xs mx-auto bg-gray-900 rounded-lg overflow-hidden cursor-move"
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
              className="absolute inset-0 w-full h-full object-contain"
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
                    <rect x="7.5%" y="7.5%" width="85%" height="85%" rx="20" ry="20" fill="black" />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.5)"
                  mask="url(#rectMask)"
                />
                <rect
                  x="7.5%"
                  y="7.5%"
                  width="85%"
                  height="85%"
                  rx="20"
                  ry="20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-3">
            {/* Zoom */}
            <div className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4 text-gray-600" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600 w-12">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-gray-600" />
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{rotation}°</span>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="flex gap-2 p-3 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1" size="sm">
            Cancel
          </Button>
          <Button
            onClick={getCroppedImage}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            size="sm"
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CircularImageCropper;
