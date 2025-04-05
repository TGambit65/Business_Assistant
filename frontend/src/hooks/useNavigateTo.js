import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for navigation with optional state
 * Simplifies navigation throughout the application
 * @returns {Function} navigateTo - Function to navigate to specified path with optional state
 */
const useNavigateTo = () => {
  const navigate = useNavigate();
  
  const navigateTo = useCallback((path, state = {}) => {
    navigate(path, { state });
  }, [navigate]);
  
  return navigateTo;
};

export default useNavigateTo; 