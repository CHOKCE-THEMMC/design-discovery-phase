import dtiLogo from '@/assets/dti-logo.png';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <img 
          src={dtiLogo} 
          alt="Loading..." 
          className={`${sizeClasses[size]} object-contain animate-pulse`}
        />
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" 
          style={{ animationDuration: '1s' }}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
