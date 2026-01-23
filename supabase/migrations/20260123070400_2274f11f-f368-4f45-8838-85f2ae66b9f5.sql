-- Create bookmarks table for storing user bookmarks
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Create viewing history table for tracking what users have viewed
CREATE TABLE public.viewing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 1
);

-- Create index for faster lookups
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_material_id ON public.bookmarks(material_id);
CREATE INDEX idx_viewing_history_user_id ON public.viewing_history(user_id);
CREATE INDEX idx_viewing_history_viewed_at ON public.viewing_history(viewed_at DESC);
CREATE UNIQUE INDEX idx_viewing_history_user_material ON public.viewing_history(user_id, material_id);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Bookmarks RLS policies
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on viewing history
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;

-- Viewing history RLS policies
CREATE POLICY "Users can view their own history"
ON public.viewing_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history"
ON public.viewing_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
ON public.viewing_history FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
ON public.viewing_history FOR DELETE
USING (auth.uid() = user_id);