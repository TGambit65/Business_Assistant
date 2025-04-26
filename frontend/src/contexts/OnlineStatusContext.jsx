import React, { createContext, useContext } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';

// Create context
const OnlineStatusContext = createContext(null);

/**
 * Provider component for online status context
 */
export const OnlineStatusProvider = ({ children }) => {
  const onlineStatus = useOnlineStatus();
  
  return (
    <OnlineStatusContext.Provider value={onlineStatus}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

/**
 * Custom hook to use online status context
 */
export const useOnlineStatusContext = () => {
  const context = useContext(OnlineStatusContext);
  
  if (context === null) {
    throw new Error('useOnlineStatusContext must be used within an OnlineStatusProvider');
  }
  
  return context;
};

export default OnlineStatusContext; 