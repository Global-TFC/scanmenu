import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryModal from './CategoryModal';

export default function Navbar({ activeColor }: { activeColor?: string | null }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Trigger transition when scrolling past most of the Hero section
            setIsScrolled(window.scrollY > window.innerHeight - 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            layout
            className={`z-50 transition-all duration-500 ${isScrolled
                ? 'fixed top-5 right-3'
                : 'absolute top-0 left-0 right-0'
                }`}
        >
            <div className={`${isScrolled ? '' : 'max-w-7xl mx-auto px-6 py-4'}`}>
                <motion.div
                    layout
                    className={`flex items-center justify-center relative ${isScrolled
                        ? `backdrop-blur-md shadow-2xl rounded-full p-2 ${activeColor || 'bg-white/20'}`
                        : ''
                        }`}
                    style={{ borderRadius: isScrolled ? 50 : 0 }}
                >
                    {/* Logo Container */}
                    <motion.div
                        layout
                        className="flex items-center gap-3"
                    >
                        {/* Logo Icon */}
                        <motion.div
                            layout
                            className={`flex items-center justify-center ${isScrolled
                                ? 'w-10 h-10 bg-transparent'
                                : 'w-12 h-12 rounded-full bg-white/20 backdrop-blur-md'
                                }`}
                        >
                            <span className="text-2xl">☕</span>
                        </motion.div>

                        {/* Text Content - Hidden when scrolled */}
                        {!isScrolled && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-center overflow-hidden whitespace-nowrap"
                            >
                                <h1
                                    className="text-3xl font-bold text-white"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Essence
                                </h1>
                                <p className="text-xs text-white/80">
                                    Cafe & Lounge
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </motion.nav>
    );
}
