import { Lock, LogIn, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface GuestPreviewOverlayProps {
  type: 'document' | 'video';
  previewLimit?: number;
}

const GuestPreviewOverlay = ({ type, previewLimit = 3 }: GuestPreviewOverlayProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex flex-col items-center justify-end pb-8 px-4 text-center">
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-sm mx-auto backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          {type === 'video' ? 'Preview Limited' : 'Content Restricted'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {type === 'video' 
            ? `Only the first ${previewLimit} seconds are available for guests.`
            : `Only the first ${previewLimit} pages are available for guests.`
          }
          {' '}Sign in to access the full content.
        </p>
        
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to View Full Content
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/register">
              Create Free Account
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>Free access for registered students</span>
        </div>
      </div>
    </div>
  );
};

export default GuestPreviewOverlay;
