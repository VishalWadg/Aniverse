import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';

interface UseHeaderScrollHideOptions {
  topThreshold?: number;
  onHide?: () => void;
}

export function useHeaderScrollHide(options: UseHeaderScrollHideOptions = {}) {
  const { topThreshold = 80, onHide } = options;
  const { scrollY } = useScroll();
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerHiddenRef = useRef(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Below top threshold: keep header visible
    if (latest < topThreshold) {
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
      return;
    }

    // Scrolling down past 120px: hide header
    if (latest > previous && latest > 120) {
      if (!headerHiddenRef.current) {
        headerHiddenRef.current = true;
        setHeaderHidden(true);
        if (onHide) {
          onHide();
        }
      }
    } 
    // Scrolling up by more than 10px: show header
    else if (previous - latest > 10) {
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
    }
  });

  return headerHidden;
}