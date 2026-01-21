import { Link } from 'react-router-dom';
import dtiLogo from '@/assets/dti-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
}

const Logo = ({ className = '', showText = true, size = 'md', linkTo = '/' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={dtiLogo} 
        alt="DTI Library Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
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
