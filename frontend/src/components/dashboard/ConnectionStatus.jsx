import React from 'react';
import { Badge } from '../ui/badge';
import { ConnectionState } from '../../services/WebSocketService';

const ConnectionStatus = ({ status, realTimeEnabled }) => {
  const getStatusConfig = () => {
    switch (status) {
      case ConnectionState.CONNECTED:
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          text: 'Connected'
        };
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          text: 'Connecting...'
        };
      case ConnectionState.DISCONNECTED:
      default:
        return {
          color: realTimeEnabled 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          text: 'Disconnected'
        };
    }
  };

  const { color, text } = getStatusConfig();

  return (
    <Badge variant="outline" className={`ml-2 ${color}`}>
      {text}
    </Badge>
  );
};

export default ConnectionStatus; 