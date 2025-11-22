import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronDown, IndianRupee } from 'lucide-react';

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

const GRADIENTS = [
  'from-green-400 to-emerald-600',
  'from-pink-400 to-red-500',
  'from-blue-400 to-purple-600',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-pink-500',
  'from-orange-400 to-yellow-500',
];

export default function MojitoShowcase({ products }: { products: Product[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [scrollDistance, setScrollDistance] = useState(0);

    // Filter featured products, or take first 6 if none featured
    const featuredProducts = products.filter(p => p.isFeatured);
    const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'], // Critical: end when scroll reaches top of next section
    });

    // Measure real width
    useEffect(() => {
        const update = () => {
            if (!trackRef.current || !containerRef.current) return;
            const track = trackRef.current;
            const container = containerRef.current;
            const distance = track.scrollWidth - container.clientWidth;
            setScrollDistance(Math.max(distance + 300, 0));
        };

        update();
        const ro = new ResizeObserver(update);
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [displayProducts]);

    const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

    if (displayProducts.length === 0) return null;

    return (
        <section
            id="mojito-showcase"
            ref={containerRef}
            className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 "
            style={{ height: `${scrollDistance + 2000}px` }} // Dynamic height based on content
        >
            {/* Sticky Horizontal Viewport */}
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                {/* Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '50px 50px',
                        }}
                    />
                </div>

                <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />

                {/* Title */}
                <div className="absolute top-5 left-5 right-0 z-20 px-4 pointer-events-none">
                    <h2 className="text-5xl md:text-7xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Featured Items
                    </h2>
                    {/* <p className="text-lg md:text-xl text-blue-200 mt-2">Handcrafted refreshing cocktails</p> */}
                </div>

                {/* Horizontal Scrolling Track */}
                <motion.div
                    ref={trackRef}
                    style={{ x }}
                    className="flex gap-6 md:gap-8 px-8 md:px-16 mt-32 md:mt-40"
                >
                    {displayProducts.map((product, index) => {
                        const gradient = GRADIENTS[index % GRADIENTS.length];
                        return (
                            <div
                                key={product.id}
                                className="flex-shrink-0 w-72 md:w-96 group relative"
                            >
                                <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-5 md:p-7 border border-white/10 hover:border-white/30 transition-all hover:shadow-2xl">
                                    {/* Glow */}
                                    <div className={`absolute -inset-3 bg-gradient-to-br ${gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity`} />

                                    {/* Image */}
                                    <div className="relative aspect-[3/4] md:aspect-[4/4] overflow-hidden rounded-2xl mb-5">
                                        <img
                                            src={product.image || "/placeholder.png"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    {/* Text */}
                                    <div className="relative text-center">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                            {product.name}
                                        </h3>
                                        <p className="text-xl md:text-2xl font-bold text-blue-200 mt-1 flex items-center justify-center gap-1">
                                            <IndianRupee size={20} />
                                            {product.offerPrice || product.price}
                                        </p>
                                    </div>

                                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r ${gradient} rounded-full`} />
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 left-15 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
                >
                    {/* <span className="text-white/60 text-sm font-medium tracking-widest uppercase">Scroll</span> */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <ChevronDown className="text-white/80" size={32} />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
