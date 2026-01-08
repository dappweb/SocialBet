import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to light
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kolmarket_theme') as Theme;
      const initialTheme = savedTheme || 'light';
      
      // Apply theme immediately to prevent flash
      const root = document.documentElement;
      if (initialTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      return initialTheme;
    }
    return 'light';
  });

  // Apply theme to document whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove both classes first to ensure clean state
    root.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    // Add the appropriate class and apply inline styles for immediate effect
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      // Apply inline styles for immediate visual feedback
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      // Reset to light mode
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#1d1d1f';
      root.style.colorScheme = 'light';
    }
    
    // Persist to localStorage
    try {
      localStorage.setItem('kolmarket_theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Theme toggled:', prev, '->', newTheme);
      
      // Force apply dark class immediately
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

