import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const categories = [
        { id: 'home', label: 'Home', href: '#home' },
        { id: 'juices', label: 'Fresh Juices', href: '#juices' },
        { id: 'mojitos', label: 'Mojitos', href: '#mojitos' },
        { id: 'menu', label: 'Full Menu', href: '#menu' },
    ];

    const handleCategoryClick = (href: string) => {
        onClose();
        // Small delay to ensure smooth scroll after modal closes
        setTimeout(() => {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        onClick={onClose}
                    >
                        <div
                            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 max-w-md w-full border border-orange-500/30 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                            >
                                <X size={28} />
                            </button>

                            {/* Header */}
                            <div className="mb-8">
                                <h2
                                    className="text-4xl font-bold text-white mb-2"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Menu
                                </h2>
                                <p className="text-orange-400 text-sm">Explore our offerings</p>
                            </div>

                            {/* Categories */}
                            <div className="space-y-4">
                                {categories.map((category, index) => (
                                    <motion.button
                                        key={category.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleCategoryClick(category.href)}
                                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                                                {category.label}
                                            </span>
                                            <motion.div
                                                className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <span className="text-orange-500">→</span>
                                            </motion.div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
