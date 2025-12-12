import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
}

interface SpecialsSwiperProps {
  featuredProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const SpecialsSwiper: React.FC<SpecialsSwiperProps> = ({
  featuredProducts,
  onClose,
  onAddToCart,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<{ index: number; addedToCart: boolean }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const currentProduct = featuredProducts[currentIndex];
  const nextProduct = featuredProducts[currentIndex + 1];
  const isFinished = currentIndex >= featuredProducts.length;
  
  const rotation = position.x * 0.1;
  const swipeThreshold = 100;

  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        if (swipeDirection === "right") {
          onAddToCart(currentProduct);
          setHistory((prev) => [...prev, { index: currentIndex, addedToCart: true }]);
        } else {
          setHistory((prev) => [...prev, { index: currentIndex, addedToCart: false }]);
        }
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
        setPosition({ x: 0, y: 0 });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection, currentProduct, currentIndex, onAddToCart]);

  const handleStart = (clientX: number, clientY: number) => {
    if (isFinished) return;
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || isFinished) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setPosition({ x: deltaX, y: deltaY * 0.3 });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (position.x > swipeThreshold) {
      setSwipeDirection("right");
    } else if (position.x < -swipeThreshold) {
      setSwipeDirection("left");
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleSwipeRight = () => {
    if (isFinished) return;
    setSwipeDirection("right");
  };

  const handleSwipeLeft = () => {
    if (isFinished) return;
    setSwipeDirection("left");
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastAction.index);
    setPosition({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setHistory([]);
    setPosition({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => handleEnd();

  const likeOpacity = Math.min(Math.max(position.x / swipeThreshold, 0), 1);
  const nopeOpacity = Math.min(Math.max(-position.x / swipeThreshold, 0), 1);

  if (!currentProduct && !isFinished) {
    return null;
  }

  const displayPrice = currentProduct?.offerPrice || currentProduct?.price;
  const hasOffer = currentProduct?.offerPrice && currentProduct.offerPrice < currentProduct.price;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
      {/* Header with progress and close */}
      <div className="p-4 pb-2">
        {/* Progress bars */}
        <div className="flex gap-1 mb-4">
          {featuredProducts.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? "50%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Close button and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">⚡</span>
            </div>
            <span className="font-semibold text-white">Specials</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {/* Card stack */}
        <div className="relative w-full max-w-sm h-[500px] mx-auto">
          {isFinished ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-lg animate-card-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                That's all specials!
              </h2>
              <p className="text-gray-600 mb-6">
                You've seen all {featuredProducts.length} special dishes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-4 h-4" />
                  See Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Next card (underneath) */}
              {nextProduct && (
                <div className="absolute w-full h-full transform scale-95 opacity-50">
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-white">
                    <img
                      src={nextProduct.image}
                      alt={nextProduct.name}
                      className="w-full h-3/5 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-product.png';
                      }}
                    />
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-900">{nextProduct.name}</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* Current card */}
              <div
                ref={cardRef}
                className={`absolute w-full h-full cursor-grab active:cursor-grabbing select-none z-10 animate-card-enter ${
                  swipeDirection === "right" ? "animate-swipe-right" : ""
                } ${swipeDirection === "left" ? "animate-swipe-left" : ""}`}
                style={{
                  transform: swipeDirection
                    ? undefined
                    : `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.3s ease-out",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-white">
                  {/* Product Image */}
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-3/5 object-cover pointer-events-none"
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-product.png';
                    }}
                  />

                  {/* YUM stamp */}
                  <div
                    className="absolute top-8 left-8 px-4 py-2 border-4 border-green-500 rounded-lg rotate-[-20deg] pointer-events-none"
                    style={{ opacity: likeOpacity }}
                  >
                    <span className="text-2xl font-bold text-green-500 tracking-wider">YUM!</span>
                  </div>

                  {/* NOPE stamp */}
                  <div
                    className="absolute top-8 right-8 px-4 py-2 border-4 border-red-500 rounded-lg rotate-[20deg] pointer-events-none"
                    style={{ opacity: nopeOpacity }}
                  >
                    <span className="text-2xl font-bold text-red-500 tracking-wider">NOPE</span>
                  </div>

                  {/* Price tag */}
                  <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{displayPrice}
                      </span>
                      {hasOffer && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{currentProduct.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 w-full h-2/5 p-5 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{currentProduct.name}</h2>
                    </div>
                    {currentProduct.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{currentProduct.description}</p>
                    )}
                    {currentProduct.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {currentProduct.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!isFinished && (
          <div className="flex justify-center gap-6 mt-6">
            <button
              onClick={handleSwipeLeft}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            {history.length > 0 && (
              <button
                onClick={handleUndo}
                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={handleSwipeRight}
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <span className="text-white text-2xl">❤️</span>
            </button>
          </div>
        )}

        {/* Instructions */}
        {!isFinished && (
          <p className="mt-4 text-sm text-white/80 text-center">
            Swipe right to add • Swipe left to skip
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialsSwiper;