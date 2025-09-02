import { useState, useEffect } from 'react';
import DarkModeContext from './DarkModeContext.js';

function DarkModeProvider({ children }) {
  // Initialize darkMode from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document when darkMode changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');

    // Update document class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch custom event for components not directly using the context
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { darkMode } }));

    // Add smooth transition animation
    const body = document.body;
    body.style.transition = 'all 0.3s ease-in-out';
    setTimeout(() => {
      body.style.transition = '';
    }, 300);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export default DarkModeProvider;


