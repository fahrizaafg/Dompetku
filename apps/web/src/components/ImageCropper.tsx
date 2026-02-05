import { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (croppedImage: string) => void;
}

export default function ImageCropper({ imageSrc, onCancel, onCrop }: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [minZoom, setMinZoom] = useState(0.1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Initialize scale to fit image
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    
    // Assuming container is 256x256 (w-64)
    const containerSize = 256;
    // Calculate scale to cover the container
    const scaleToCover = containerSize / Math.min(naturalWidth, naturalHeight);
    
    // Ensure we don't start with 0 or Infinity
    const validScale = Number.isFinite(scaleToCover) && scaleToCover > 0 ? scaleToCover : 1;
    
    setMinZoom(validScale);
    setScale(validScale);
  };

  // Clamp position helper
  const clampPosition = (x: number, y: number, currentScale: number) => {
    if (imageSize.width === 0 || imageSize.height === 0) return { x, y };

    const containerSize = 256;
    const scaledWidth = imageSize.width * currentScale;
    const scaledHeight = imageSize.height * currentScale;
    
    const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
    const maxY = Math.max(0, (scaledHeight - containerSize) / 2);
    
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    setPosition(prev => clampPosition(prev.x, prev.y, newScale));
  };

  // Clamp position when scale changes
  // useEffect removed to avoid setState in effect

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      const newX = clientX - dragStart.x;
      const newY = clientY - dragStart.y;
      
      // Calculate limits
      const containerSize = 256;
      const scaledWidth = imageSize.width * scale;
      const scaledHeight = imageSize.height * scale;
      
      const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
      const maxY = Math.max(0, (scaledHeight - containerSize) / 2);
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default drag behavior
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const size = 500; // Output resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if(ctx && imageRef.current) {
        // Use transparent background for PNG or user preferred color
        // For profile pictures, white or black background is safer if image doesn't cover
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        
        // The view is 256x256 (w-64)
        const viewSize = 256;
        const ratio = size / viewSize;
        
        ctx.translate(size/2, size/2);
        ctx.translate(position.x * ratio, position.y * ratio);
        ctx.scale(scale, scale);
        
        const img = imageRef.current;
        // Draw image centered
        ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
    }
    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 touch-none">
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Adjust Photo</h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white/70">close</span>
          </button>
        </div>
        
        <div className="relative flex justify-center mb-8">
            <div 
              className="relative w-64 h-64 overflow-hidden rounded-full border-4 border-white/10 shadow-inner cursor-move touch-none bg-black/50"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleEnd}
            >
              <img 
                ref={imageRef}
                src={imageSrc} 
                onLoad={onImageLoad}
                alt="Crop Preview" 
                className="absolute max-w-none origin-center pointer-events-none select-none"
                style={{ 
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  left: '50%',
                  top: '50%',
                  willChange: 'transform'
                }}
                draggable={false}
              />
              
              {/* Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/50"></div>
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/50"></div>
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/50"></div>
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/50"></div>
              </div>
            </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <button 
              onClick={() => handleScaleChange(Math.max(minZoom, scale - minZoom * 0.5))}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-white/50 text-sm">remove_circle</span>
            </button>
            <input 
              type="range" 
              min={minZoom} 
              max={minZoom * 5} 
              step={minZoom * 0.01} 
              value={scale} 
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
            <button 
              onClick={() => handleScaleChange(Math.min(minZoom * 5, scale + minZoom * 0.5))}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-white/50 text-sm">add_circle</span>
            </button>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl font-bold bg-primary text-[#020906] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check</span>
              Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
