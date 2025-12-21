"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Menu as MenuIcon, X, IndianRupee } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
}

interface MenuProps {
  onColorChange?: (color: string) => void;
  products: Product[];
}

const CATEGORY_STYLES = [
  { color: "bg-amber-600", textColor: "text-amber-600" },
  { color: "bg-emerald-600", textColor: "text-emerald-600" },
  { color: "bg-rose-500", textColor: "text-rose-500" },
  { color: "bg-indigo-600", textColor: "text-indigo-600" },
  { color: "bg-blue-600", textColor: "text-blue-600" },
  { color: "bg-purple-600", textColor: "text-purple-600" },
  { color: "bg-orange-600", textColor: "text-orange-600" },
  { color: "bg-teal-600", textColor: "text-teal-600" },
];

export default function Menu({ onColorChange, products }: MenuProps) {
  const menuCategories = useMemo(() => {
    const groups: { [key: string]: Product[] } = {};
    products.forEach((p) => {
      if (!groups[p.category]) {
        groups[p.category] = [];
      }
      groups[p.category].push(p);
    });

    return Object.keys(groups).map((category, index) => {
      const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
      return {
        id: category.toLowerCase().replace(/\s+/g, "-"),
        title: category,
        color: style.color,
        textColor: style.textColor,
        items: groups[category],
      };
    });
  }, [products]);

  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (menuCategories.length > 0 && !activeCategory) {
      setActiveCategory(menuCategories[0].id);
    }
  }, [menuCategories, activeCategory]);

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
      setViewportHeight(window.innerHeight);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    // Re-calculate when products change
    const timeout = setTimeout(updateDimensions, 100);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timeout);
    };
  }, [products]);

  // Calculate how much we need to scroll
  // We want to scroll until the end of content is visible
  const scrollDistance = Math.max(0, contentHeight - viewportHeight);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

  // Intersection Observer for Active Category
  useEffect(() => {
    const options = {
      root: null, // Use viewport since elements are transformed
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    }, options);

    menuCategories.forEach((cat) => {
      const element = document.getElementById(cat.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [menuCategories]);

  // Sync active color with parent
  useEffect(() => {
    if (onColorChange) {
      const currentCategory = menuCategories.find((c) => c.id === activeCategory);
      if (currentCategory) {
        onColorChange(currentCategory.color);
      }
    }
  }, [activeCategory, onColorChange, menuCategories]);

  const scrollToCategory = (id: string) => {
    setIsModalOpen(false);

    const element = document.getElementById(id);
    if (element && containerRef.current && contentRef.current) {
      // Calculate the element's offset relative to the content container
      const contentTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      // We need the offset relative to the *start* of the content container,
      // but getBoundingClientRect changes as we scroll.
      // However, since both are moving together, the difference (elementTop - contentTop)
      // should be constant and represent the offset from the top of the content list.
      const offsetInContent = elementTop - contentTop;

      if (scrollDistance > 0) {
        // Calculate the progress needed to bring this offset to the top
        // y = -scrollDistance * progress
        // We want y to be -offsetInContent (so the element moves up by offsetInContent)
        // -offsetInContent = -scrollDistance * progress
        // progress = offsetInContent / scrollDistance

        const targetProgress = Math.min(Math.max(offsetInContent / scrollDistance, 0), 1);

        // Convert progress to window scroll position
        // The container starts at containerRef.current.offsetTop
        // The total scrollable distance is scrollDistance
        // So we scroll to containerTop + (targetProgress * scrollDistance)

        // We need the absolute top position of the container relative to the document
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = rect.top + scrollTop;

        const targetScrollY = containerTop + targetProgress * scrollDistance;

        window.scrollTo({
          top: targetScrollY,
          behavior: "smooth",
        });
      }
    }
  };

  if (menuCategories.length === 0) {
    return null;
  }

  const currentCategory = menuCategories.find((c) => c.id === activeCategory) || menuCategories[0];

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-neutral-50"
      style={{ height: viewportHeight ? `${viewportHeight + scrollDistance}px` : "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex overflow-hidden">
        {/* Left Panel - 80% - Scrollable Menu List */}
        <div className="w-[80%] h-full overflow-hidden relative px-6">
          <motion.div ref={contentRef} style={{ y: smoothY }} className="pt-10 pb-20">
            {menuCategories.map((category) => (
              <div key={category.id} id={category.id} className="mb-16">
                <h3
                  className={`text-2xl font-bold mb-6 ${category.textColor} bg-neutral-50 py-2 z-10`}
                >
                  {category.title}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, idx) => {
                    const hasValidPrice = (item.offerPrice && item.offerPrice > 0) || (item.price && item.price > 0);
                    const displayPrice = item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price;
                    return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="flex items-end justify-between text-neutral-800"
                    >
                      <span className="font-medium text-lg whitespace-nowrap">{item.name}</span>
                      {hasValidPrice && (
                      <>
                      <div className="flex-1 mx-2 border-b-2 border-dotted border-neutral-300 mb-1.5"></div>
                      <div className="flex items-center font-semibold text-lg whitespace-nowrap">
                        <IndianRupee size={14} className="mr-0.5" />
                        {displayPrice}
                      </div>
                      </>
                      )}
                    </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Panel - 20% - Active Category Indicator */}
        <div className="w-[20%] h-full bg-neutral-100 border-l border-neutral-200 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-end pr-3">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`py-8 px-3 rounded-full ${currentCategory.color} shadow-lg`}
            >
              <span
                className="block text-white font-bold text-xl tracking-widest uppercase whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                }}
              >
                {currentCategory.title}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Floating Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className={`fixed bottom-8 right-2 z-50 p-4 rounded-full shadow-2xl text-white ${currentCategory.color} transition-colors duration-300`}
        >
          <MenuIcon size={24} />
        </motion.button>

        {/* Category Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Menu Categories</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-neutral-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => scrollToCategory(cat.id)}
                      className={`p-4 rounded-xl text-left font-semibold transition-all ${
                        activeCategory === cat.id
                          ? `${cat.color} text-white shadow-md`
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
