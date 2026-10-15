import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer select-none ${
        isDark
          ? 'bg-black/60 text-[#8fe40f] hover:bg-[#033d2f] hover:text-[#8fe40f] border border-[#8fe40f]/30 shadow-xs'
          : 'bg-[#f2f3ed] text-[#033d2f] hover:bg-slate-200 hover:text-black border border-slate-300/80 shadow-xs'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      data-testid="theme-toggle"
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-bold uppercase tracking-wider">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
