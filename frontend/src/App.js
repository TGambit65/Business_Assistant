import React, { useEffect } from 'react';
import MainDashboard from './components/MainDashboard';
import './App.css';
// Import our TinyMCE preloader
import { preloadTinyMCE } from './tinymcePreloader';

function App() {
  // Ensure TinyMCE is loaded when the app starts
  useEffect(() => {
    preloadTinyMCE()
      .then(() => console.log('TinyMCE ready for use'))
      .catch(error => console.error('TinyMCE preload failed in App:', error));
  }, []);

  return (
    <div className="App">
      <MainDashboard />
    </div>
  );
}

export default App;