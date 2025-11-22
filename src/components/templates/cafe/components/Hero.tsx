import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    offerPrice?: number;
    image: string;
    isFeatured?: boolean;
}

export default function Hero({ products = [] }: { products?: Product[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const defaultItems = [
        {
            name: 'Strawberry Mojito',
            price: '$8.50',
            image: 'https://static.vecteezy.com/system/resources/previews/057/592/490/non_2x/a-glass-of-strawberry-mojito-with-lime-and-mint-free-png.png',
        },
        {
            name: 'Classic Mojito',
            price: '$7.50',
            image: 'https://png.pngtree.com/png-vector/20240207/ourmid/pngtree-mojitos-summer-cocktail-png-image_11673113.png',
        },
        {
            name: 'Blueberry Mojito',
            price: '$8.50',
            image: 'https://png.pngtree.com/png-vector/20250408/ourmid/pngtree-refreshing-blueberry-cocktail-with-ice-and-mint-leaves-png-image_15933498.png',
        },
        {
            name: 'Passion Fruit Mojito',
            price: '$9.00',
            image: 'https://png.pngtree.com/png-vector/20240207/ourmid/pngtree-passion-fruit-mojito-tropical-cocktail-png-image_11671599.png',
        },
        {
            name: 'Watermelon Mojito',
            price: '$8.00',
            image: 'https://png.pngtree.com/png-vector/20240207/ourmid/pngtree-watermelon-refresh-drink-png-image_11710438.png',
        },
    ];

    const featuredProducts = products.filter(p => p.isFeatured);
    const displaySource = featuredProducts.length > 0 ? featuredProducts : (products.length > 0 ? products : []);
    
    const items = displaySource.length > 0 ? displaySource.map(p => ({
        name: p.name,
        price: `₹${p.offerPrice || p.price}`,
        image: p.image || "/placeholder.png"
    })) : defaultItems;

    // Auto-scroll functionality
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isPaused, items.length]);

    const nextItem = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevItem = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const currentItem = items[currentIndex];

    const handleScroll = (e: React.WheelEvent) => {
        if (e.deltaY > 0) {
            // Scrolling down
            const nextSection = document.getElementById('mojito-showcase');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <section
            className="relative h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onWheel={handleScroll}
        >
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '60px 60px',
                }}></div>
            </div>

            <div className="relative h-full flex items-center justify-center px-6">
                <div className="max-w-7xl w-full">
                    {/* Navigation Buttons */}
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={prevItem}
                            className="bg-white/20 backdrop-blur-md p-5 rounded-full text-white hover:bg-white/30 transition-all shadow-2xl"
                        >
                            <ChevronLeft size={36} />
                        </motion.button>
                    </div>

                    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={nextItem}
                            className="bg-white/20 backdrop-blur-md p-5 rounded-full text-white hover:bg-white/30 transition-all shadow-2xl"
                        >
                            <ChevronRight size={36} />
                        </motion.button>
                    </div>

                    {/* Main Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col items-center justify-center h-full"
                        >
                            {/* Large Background Text - Infinite Marquee */}
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                                <div className="w-full flex whitespace-nowrap">
                                    <motion.div
                                        className="flex whitespace-nowrap"
                                        animate={{ x: ["0%", "-50%"] }}
                                        transition={{
                                            repeat: Infinity,
                                            ease: "linear",
                                            duration: 20,
                                        }}
                                    >
                                        {[...Array(4)].map((_, i) => (
                                            <span
                                                key={i}
                                                className="text-[15vw] font-black text-white/10 uppercase leading-none mx-8"
                                                style={{ fontFamily: 'Playfair Display, serif' }}
                                            >
                                                {currentItem.name}
                                            </span>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Item Image - Animated from Bottom */}
                            <motion.div
                                initial={{ opacity: 0, y: 200, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.3,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="relative z-10 mb-8"
                            >
                                <img
                                    src={currentItem.image}
                                    alt={currentItem.name}
                                    className="object-contain drop-shadow-2xl"
                                    style={{
                                        height: '60vh',
                                        maxHeight: '700px',
                                        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6))',
                                    }}
                                />
                            </motion.div>

                            {/* Item Name and Price */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.6 }}
                                className="relative z-10 text-center"
                            >
                                <h3
                                    className="text-3xl md:text-6xl font-bold text-white mb-4"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    {currentItem.name}
                                </h3>
                                <motion.p
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="text-1xl font-bold text-blue-200"
                                >
                                    {currentItem.price}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress Dots */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30"
                    >
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className="relative group"
                            >
                                <div
                                    className={`transition-all ${index === currentIndex
                                        ? 'w-16 h-4 bg-white'
                                        : 'w-4 h-4 bg-white/40 hover:bg-white/60'
                                        } rounded-full`}
                                />
                                {index === currentIndex && !isPaused && (
                                    <motion.div
                                        className="absolute inset-0 bg-white/30 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 5, ease: 'linear' }}
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
