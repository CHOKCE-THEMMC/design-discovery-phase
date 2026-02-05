-- Add DELETE policy for profiles so admins can delete users
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete notifications of any user (for cleanup when deleting users)
CREATE POLICY "Admins can delete any notifications"
ON public.notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete bookmarks of any user (for cleanup when deleting users)
CREATE POLICY "Admins can delete any bookmarks"
ON public.bookmarks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete viewing history of any user (for cleanup when deleting users)
CREATE POLICY "Admins can delete any viewing history"
ON public.viewing_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));