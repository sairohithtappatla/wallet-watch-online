
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial check with a small delay to ensure accurate reading after mount
    const timer = setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 10);
    
    const handleResize = () => {
      // Use RAF to debounce resize events
      window.requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      });
    };
    
    // Add event listener with passive flag for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return isMobile;
}
