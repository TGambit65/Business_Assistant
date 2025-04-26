import { useState, useEffect } from 'react';

/**
 * Custom hook to detect viewport size with media queries
 * @param {string} query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - Whether the query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Initial check
    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Event listener for changes
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);

    // Clean up
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

export default useMediaQuery; 