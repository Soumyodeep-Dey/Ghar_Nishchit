// Utility hook for accessing DarkModeContext
import { useContext } from 'react';
import DarkModeContext from './DarkModeContext.js';

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
}
