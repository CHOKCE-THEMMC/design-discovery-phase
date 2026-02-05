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
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const isVideo = material?.isVideo || material?.contentType === 'video_file' || material?.contentType === 'video_link';
  const previewLimit = material?.previewPages || (isVideo ? 30 : 4);
  const isGuest = !user;

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
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

  // Handle page navigation restriction for guests
  useEffect(() => {
    if (isGuest && !isVideo && currentPage >= previewLimit) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [currentPage, isGuest, isVideo, previewLimit]);

  if (!material) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handleNextPage = () => {
    if (isGuest && currentPage >= previewLimit) {
      setShowOverlay(true);
      return;
    }
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    if (currentPage <= previewLimit) {
      setShowOverlay(false);
    }
  };

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
      
      // Check if it's a YouTube or external video link
      if (material.contentType === 'video_link' && videoUrl) {
        // For YouTube/Vimeo embeds
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
        // Other video links - show message
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

      // Direct video file
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

    // Document preview using Google Docs viewer
    const fileUrl = material.fileUrl;
    if (fileUrl) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      return (
        <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={googleDocsUrl}
            className="w-full h-full border-0"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
          />
          {showOverlay && <GuestPreviewOverlay type="document" previewLimit={previewLimit} />}
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {material.title}
            </DialogTitle>
            {isGuest && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                <Lock className="h-3 w-3" />
                <span>Limited Preview</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {!isVideo && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[4rem] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPreviewModal;
