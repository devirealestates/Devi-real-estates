import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  // Use useLayoutEffect to run synchronously BEFORE browser paint
  // This ensures body styles are reset immediately on route change
  useLayoutEffect(() => {
    console.log('[ScrollToTop] Route change detected:', {
      pathname: location.pathname,
      search: location.search,
      key: location.key,
      state: location.state
    });
    
    // Force reset all body styles that might be stuck from mobile menu
    document.body.style.cssText = '';
    document.body.removeAttribute('style');
    
    // Also ensure html element is not stuck
    document.documentElement.style.cssText = '';
    document.documentElement.removeAttribute('style');
    
    // Reset any overflow hidden on html
    document.documentElement.style.overflow = '';
    
    // Immediate scroll to top (no smooth behavior to avoid conflicts)
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export default ScrollToTop;
