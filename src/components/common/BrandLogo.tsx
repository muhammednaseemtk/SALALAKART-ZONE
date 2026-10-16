import React from 'react';
import { Link } from 'react-router-dom';
import darkLogo from '../../assets/Artboard 7 copy.png';
import lightLogo from '../../assets/Artboard 8.png';
import { useTheme } from '../../context/ThemeContext';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  useImage?: boolean;
  className?: string;
  imgClassName?: string;
  forceTheme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  imgClassName = '',
  forceTheme,
}) => {
  const { theme } = useTheme();
  const activeTheme = forceTheme || theme;
  const logoSrc = activeTheme === 'dark' ? darkLogo : lightLogo;

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  }[size];

  return (
    <Link
      to="/"
      className={`inline-flex items-center justify-center transition-opacity hover:opacity-95 ${className}`}
      title="SALALAKART ZONE — Home"
    >
      <img
        src={logoSrc}
        alt="SALALAKART ZONE"
        className={`${imgClassName || sizeClasses} w-auto max-w-full object-contain`}
        loading="eager"
      />
    </Link>
  );
};
