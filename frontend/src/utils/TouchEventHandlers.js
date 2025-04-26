// Debounce function to limit the rate of function execution
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit the rate of function execution
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Touch event handler with proper event handling
export const createTouchHandler = (options = {}) => {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    preventDefault = true,
    passive = false,
  } = options;

  return {
    onTouchStart: (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchStart) onTouchStart(e);
    },
    onTouchMove: (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchMove) onTouchMove(e);
    },
    onTouchEnd: (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchEnd) onTouchEnd(e);
    },
    onTouchCancel: (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchCancel) onTouchCancel(e);
    },
  };
};

// Swipe detection utility
export const createSwipeDetector = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
  } = options;

  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight) onSwipeRight();
      if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
    }

    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && onSwipeDown) onSwipeDown();
      if (deltaY < 0 && onSwipeUp) onSwipeUp();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

// Double tap detection utility
export const createDoubleTapDetector = (options = {}) => {
  const { onDoubleTap, maxDelay = 300 } = options;
  let lastTap = 0;

  const handleTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < maxDelay && tapLength > 0) {
      if (onDoubleTap) onDoubleTap(e);
    }
    lastTap = currentTime;
  };

  return {
    onTouchEnd: handleTap,
  };
};

// Pinch zoom detection utility
export const createPinchZoomDetector = (options = {}) => {
  const { onPinchIn, onPinchOut } = options;
  let initialDistance = 0;

  const getDistance = (touches) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      const delta = currentDistance - initialDistance;

      if (Math.abs(delta) > 10) {
        if (delta > 0 && onPinchOut) onPinchOut();
        if (delta < 0 && onPinchIn) onPinchIn();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}; 