import { useCallback, useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  containerRef: React.RefObject<HTMLElement>;
  onSectionChange: (sectionId: string) => void;
  isProgrammaticScroll: React.MutableRefObject<boolean>;
  sectionIds: string[];
}

export const useIntersectionObserver = ({
  containerRef,
  onSectionChange,
  isProgrammaticScroll,
  sectionIds,
}: UseIntersectionObserverProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isProgrammaticScroll.current) return;

      const intersectingEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (intersectingEntries.length > 0) {
        const newActiveId = intersectingEntries[0].target.id;
        if (newActiveId) {
          onSectionChange(newActiveId);
        }
      }
    },
    [onSectionChange, isProgrammaticScroll]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: container,
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    });

    const startObserving = () => {
      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section && observerRef.current) {
          observerRef.current.observe(section);
        }
      });
    };

    const rafId = requestAnimationFrame(() => {
      startObserving();

      setTimeout(() => {
        if (isProgrammaticScroll.current) return;

        const containerRect = container.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;

        let bestMatch = sectionIds[0];
        let bestScore = Infinity;

        sectionIds.forEach((sectionId) => {
          const section = document.getElementById(sectionId);
          if (section) {
            const rect = section.getBoundingClientRect();
            const sectionCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(centerY - sectionCenterY);

            if (rect.top < centerY && rect.bottom > centerY && distance < bestScore) {
              bestScore = distance;
              bestMatch = sectionId;
            }
          }
        });

        onSectionChange(bestMatch);
      }, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observerCallback, containerRef, sectionIds, onSectionChange, isProgrammaticScroll]);

  return observerRef;
}; 