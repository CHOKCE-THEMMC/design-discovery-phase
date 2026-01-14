-- =====================================================
-- SECURITY FIX: Address 3 error-level security findings
-- =====================================================

-- 1. FIX PROFILES TABLE: Restrict to owner-only + admin access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create proper restrictive policy: users see own profile, admins see all
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create a secure view for displaying author names without exposing emails
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 2. FIX NOTIFICATIONS TABLE: Users can only insert for themselves
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create proper restrictive policy: users can only create notifications for themselves
CREATE POLICY "Users can insert own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. FIX STORAGE POLICIES: Add ownership validation to materials bucket
-- Drop the overly permissive UPDATE policy for materials
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Create proper UPDATE policy with ownership check
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Drop the overly permissive DELETE policy for materials
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create proper DELETE policy with ownership check (users own files + admins)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);