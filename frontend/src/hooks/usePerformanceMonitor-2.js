// Performance monitoring hook for frontend
export const usePerformanceMonitor = () => { 
  const [metrics, setMetrics] = React.useState({}); 
  return metrics; 
};
