'use client';

import { Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/**
 * E-ink style theme toggle with ASCII faces
 */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Toggle theme">
      <span className="theme-icon">
        {theme === 'light' ? '(^_^)' : '(-_-)'}
      </span>
    </button>
  );
}

