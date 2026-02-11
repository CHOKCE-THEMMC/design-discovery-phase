import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, ExternalLink, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GuestPreviewOverlay from './GuestPreviewOverlay';
import { useAuth } from '@/hooks/use-auth';
import { Material } from '@/hooks/use-materials';

interface MaterialPreviewModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
}

const MaterialPreviewModal = ({ material, isOpen, onClose }: MaterialPreviewModalProps) => {
  const { user } = useAuth();
  const [zoom, setZoom] = useState(100);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const isVideo = material?.isVideo || material?.contentType === 'video_file' || material?.contentType === 'video_link';
  const previewLimit = isVideo ? 30 : 4;
  const isGuest = !user;

  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setShowOverlay(false);
    }
  }, [isOpen, material]);

  // Handle video time restriction for guests
  useEffect(() => {
    if (!videoRef.current || !isGuest || !isVideo) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video.currentTime >= previewLimit) {
        video.pause();
        video.currentTime = previewLimit;
        setShowOverlay(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isGuest, isVideo, previewLimit]);

  if (!material) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handleOpenExternal = () => {
    const url = material.fileUrl || material.videoUrl;
    if (url) {
      if (url.toLowerCase().endsWith('.pdf') || material.contentType === 'document') {
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        window.open(googleDocsUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const renderContent = () => {
    if (isVideo) {
      const videoUrl = material.videoUrl || material.fileUrl;
      
      if (material.contentType === 'video_link' && videoUrl) {
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.includes('youtu.be') 
            ? videoUrl.split('/').pop() 
            : new URL(videoUrl).searchParams.get('v');
          return (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?start=0${isGuest ? `&end=${previewLimit}` : ''}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {showOverlay && <GuestPreviewOverlay type="video" previewLimit={previewLimit} />}
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">This is an external video link</p>
            <Button onClick={() => window.open(videoUrl, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Video
            </Button>
          </div>
        );
      }

      return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
            controlsList={isGuest ? "nodownload" : undefined}
          >
            Your browser does not support video playback.
          </video>
          {showOverlay && <GuestPreviewOverlay type="video" previewLimit={previewLimit} />}
        </div>
      );
    }

    // Document preview
    const fileUrl = material.fileUrl;
    if (fileUrl) {
      // For guests: show a restricted preview with overlay after a brief view
      if (isGuest) {
        return (
          <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
            {/* Show limited preview - only first portion visible then blocked */}
            <div className="w-full h-full overflow-hidden relative">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-full border-0"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
              />
              {/* Hard block: overlay that covers most of the document, only allowing ~4 pages visible area */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Transparent area at top for ~4 pages preview */}
                <div className="h-[30%]" />
                {/* Solid block covering the rest */}
                <div className="h-[70%] bg-gradient-to-b from-background/80 via-background to-background pointer-events-auto" />
              </div>
            </div>
            <GuestPreviewOverlay type="document" previewLimit={previewLimit} />
          </div>
        );
      }

      // For logged-in users: full access
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      return (
        <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={googleDocsUrl}
            className="w-full h-full border-0"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Preview not available for this material
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg font-semibold truncate pr-2">
              {material.title}
            </DialogTitle>
            {isGuest && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                <Lock className="h-3 w-3" />
                <span>4 Pages Only</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {!isVideo && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Open Full</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Close</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPreviewModal;
