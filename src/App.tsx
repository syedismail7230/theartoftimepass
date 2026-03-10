import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 240;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `${import.meta.env.BASE_URL}images/ezgif-frame-${frameNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        setLoaded(loadedCount);
      };
      img.onerror = () => {
        loadedCount++;
        setLoaded(loadedCount);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Update canvas on scroll
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = (progress: number) => {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * FRAME_COUNT)
      );
      
      const img = images[frameIndex];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate object-fit: contain equivalent to keep entire frame in view
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image -> fit to height
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          // Canvas is taller than image -> fit to width
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(
          img, 
          0, 0, img.naturalWidth, img.naturalHeight,
          offsetX, offsetY, drawWidth, drawHeight
        );
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(scrollYProgress.get());
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial setup

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      renderFrame(latest);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      unsubscribe();
    };
  }, [images, scrollYProgress]);

  // Text sections opacity transforms
  const text1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 0, -50]);

  const text2Opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.4, 0.55], [0, 1, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.1, 0.25, 0.4, 0.55], [50, 0, 0, -50]);

  const text3Opacity = useTransform(scrollYProgress, [0.45, 0.6, 0.75, 0.9], [0, 1, 1, 0]);
  const text3Y = useTransform(scrollYProgress, [0.45, 0.6, 0.75, 0.9], [50, 0, 0, -50]);

  return (
    <div ref={containerRef} className="relative bg-black min-h-[400vh]">
      {/* Loading Screen */}
      {loaded < FRAME_COUNT && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white px-4">
          <div className="text-xl md:text-2xl font-light tracking-widest mb-4">LOADING</div>
          <div className="w-full max-w-xs h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${(loaded / FRAME_COUNT) * 100}%` }}
            />
          </div>
          <div className="mt-4 text-zinc-500 font-mono text-xs md:text-sm">
            {loaded} / {FRAME_COUNT}
          </div>
        </div>
      )}

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scrolling Text Content */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="h-[100dvh] flex items-center justify-center">
          <motion.div 
            style={{ opacity: text1Opacity, y: text1Y }} 
            className="text-center px-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              The Convergence
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Where human emotion meets mechanical precision.
            </p>
          </motion.div>
        </div>

        <div className="h-[100dvh] flex items-center justify-center">
          <motion.div 
            style={{ opacity: text2Opacity, y: text2Y }} 
            className="text-center px-6"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              A Symbiotic Motion
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Every movement reflects harmony between intelligence and design.
            </p>
          </motion.div>
        </div>

        <div className="h-[100dvh] flex items-center justify-center">
          <motion.div 
            style={{ opacity: text3Opacity, y: text3Y }} 
            className="text-center px-6"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              The Future Unfolds
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Where technology and humanity dance as one.
            </p>
          </motion.div>
        </div>
        
        <div className="h-[100dvh] flex items-center justify-center">
          {/* Empty space for the end of scroll */}
        </div>
      </div>
    </div>
  );
}


