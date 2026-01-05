import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Move, Crop, Check, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  circular?: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  circular = true,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    
    // Calculate initial crop to center the image
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    const x = (containerWidth - scaledWidth) / 2;
    const y = (containerHeight - scaledHeight) / 2;
    
    setCrop({ x, y });
    setZoom(scale);
  }, []);

  // Handle crop
  const handleCrop = useCallback(async () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Set canvas size
      const outputSize = 400; // 400x400 output
      canvas.width = outputSize;
      canvas.height = outputSize;
      
      // Calculate crop area
      const containerWidth = containerRef.current?.clientWidth || 400;
      const containerHeight = containerRef.current?.clientHeight || 400;
      
      const cropX = -crop.x / zoom;
      const cropY = -crop.y / zoom;
      const cropWidth = containerWidth / zoom;
      const cropHeight = containerHeight / zoom;
      
      // Apply transformations
      ctx.save();
      
      if (circular) {
        // Create circular clip
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
      }
      
      // Apply rotation
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-outputSize / 2, -outputSize / 2);
      
      // Draw image
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize
      );
      
      ctx.restore();
      
      // Get cropped image
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      onCropComplete(croppedImage);
    } catch (err) {
      console.error('Crop error:', err);
      setError('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [crop, zoom, rotation, circular, onCropComplete]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Handle rotation
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Handle mouse drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  }, [crop]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newCrop = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    
    setCrop(newCrop);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea] dark:border-[#38383a]">
          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Crop Avatar</h3>
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] rounded-full transition-colors duration-200"
            disabled={isProcessing}
          >
            <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative w-full h-96 bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute"
              style={{
                transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
                maxWidth: 'none',
                maxHeight: 'none',
              }}
              onLoad={handleImageLoad}
            />
            
            {/* Crop overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white shadow-lg" 
                style={{
                  clipPath: circular ? 'circle(50%)' : 'none',
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="text-[#ff3b30] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#ff3b30]">{error}</span>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">Zoom</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-1.5 bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors duration-200"
                  disabled={isProcessing}
                >
                  <ZoomOut size={16} className="text-[#1d1d1f] dark:text-white" />
                </button>
                <div className="w-24 bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-lg px-2 py-1">
                  <div className="text-center text-sm text-[#1d1d1f] dark:text-white">
                    {Math.round(zoom * 100)}%
                  </div>
                </div>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-1.5 bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors duration-200"
                  disabled={isProcessing}
                >
                  <ZoomIn size={16} className="text-[#1d1d1f] dark:text-white" />
                </button>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">Rotation</span>
              <button
                onClick={handleRotate}
                className="p-1.5 bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors duration-200"
                disabled={isProcessing}
              >
                <RotateCw size={16} className="text-[#1d1d1f] dark:text-white" />
              </button>
              <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                {rotation}°
              </span>
            </div>

            {/* Instructions */}
            <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              <p>• Drag to move the image</p>
              <p>• Use zoom and rotation controls to adjust</p>
              <p>• Click "Apply" to crop the image</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#0a0a0a]">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl font-semibold text-sm hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200 text-[#1d1d1f] dark:text-white"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-md shadow-[#ffd700]/20 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check size={16} />
                Apply
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={400}
        height={400}
      />
    </div>
  );
};

export default ImageCropper;
