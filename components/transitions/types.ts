export type PageTransitionContextType = {
  playExit: (onComplete: () => void) => void;
  playEnter: () => void;
  isTransitioning: boolean;
  setPendingNavigation: (pending: boolean) => void;
  hasPendingNavigation: () => boolean;
};
