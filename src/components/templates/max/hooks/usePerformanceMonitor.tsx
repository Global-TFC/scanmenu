import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        threshold: '16ms (60fps)',
      });
    }

    // Send to analytics in production (optional)
    if (process.env.NODE_ENV === 'production' && renderTime > 50) {
      // Analytics.track('slow_render', {
      //   component: componentName,
      //   renderTime,
      //   renderCount: renderCount.current,
      // });
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

export default usePerformanceMonitor;