import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from '@/components/ui/PageLoader';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsLoading(true);
      
      // Short delay to show loading state
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

export default PageTransition;
