-- Add video support columns to materials table
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preview_pages INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'document';

-- Add comment to explain the fields
COMMENT ON COLUMN public.materials.video_url IS 'URL for external video links (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN public.materials.is_video IS 'Whether this material is a video';
COMMENT ON COLUMN public.materials.preview_pages IS 'Number of pages/seconds available for guest preview';
COMMENT ON COLUMN public.materials.content_type IS 'Type of content: document, video_file, video_link';

-- Create a videos storage bucket for large video files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 5368709120)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 5368709120;

-- Update materials bucket to allow 1GB files for documents
UPDATE storage.buckets SET file_size_limit = 1073741824 WHERE id = 'materials';

-- Create storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));