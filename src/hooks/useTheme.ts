'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme
    const saved = localStorage.getItem('vibe-theme') as Theme;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Trigger e-ink flicker effect
    setIsFlickering(true);
    
    // Change theme after brief delay (during flicker)
    setTimeout(() => {
      setTheme(newTheme);
      localStorage.setItem('vibe-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // End flicker
      setTimeout(() => {
        setIsFlickering(false);
      }, 400);
    }, 100);
  };

  return { theme, toggleTheme, isFlickering };
}

