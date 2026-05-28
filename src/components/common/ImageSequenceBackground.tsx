import { useEffect, useRef, useState } from 'react';

interface Props {
  frameCount: number;
  folderPath: string;
  fps?: number;
  className?: string;
}

export default function ImageSequenceBackground({ frameCount, folderPath, fps = 30, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let loaded = 0;
    const imgArray: HTMLImageElement[] = [];

    // Preload all images
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Format number to 4 digits (e.g., 0001, 0002)
      const paddedIndex = i.toString().padStart(4, '0');
      img.src = `${folderPath}/${paddedIndex}.jpg`;
      
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
      };
      
      imgArray.push(img);
    }
    setImages(imgArray);
  }, [frameCount, folderPath]);

  useEffect(() => {
    if (loadedCount === 0 || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationFrameId: number;
    let lastTime = 0;
    const frameInterval = 1000 / fps;

    const drawFrame = (img: HTMLImageElement) => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (time - lastTime < frameInterval) return;
      lastTime = time;

      const img = images[frame];
      if (img && img.complete) {
        drawFrame(img);
      }

      frame = (frame + 1) % frameCount;
    };

    // Resize canvas to window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Draw immediately on resize
      const img = images[frame];
      if (img && img.complete && ctx) {
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    animationFrameId = requestAnimationFrame(render); // Start animation loop

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loadedCount, frameCount, images]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {/* Optional: we can keep a slight dark overlay while loading if needed, but no text */}
      <div 
        className="absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out bg-black/60 backdrop-blur-sm"
        style={{ opacity: loadedCount < 10 ? 1 : 0, pointerEvents: 'none' }}
      />
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] ease-in-out"
        style={{ opacity: loadedCount > 0 ? 1 : 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
