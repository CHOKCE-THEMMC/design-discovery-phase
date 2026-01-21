import dtiLogo from '@/assets/dti-logo.png';

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img 
            src={dtiLogo} 
            alt="DTI Library" 
            className="h-20 w-20 object-contain animate-pulse"
          />
          <div 
            className="absolute -inset-2 rounded-full border-4 border-primary/10 border-t-primary animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-display text-xl font-bold text-foreground">DTI Library</h2>
          <p className="text-sm text-muted-foreground">Loading your resources...</p>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
