import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
}

const Logo = ({ className = '', showText = true, size = 'md', linkTo = '/' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Book className={`${sizeClasses[size]} text-primary`} />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-library-gold rounded-full" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-bold text-foreground ${textSizeClasses[size]}`}>
            DTI Library
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Destination Training Institute
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
