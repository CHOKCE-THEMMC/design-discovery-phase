-- Fix the security definer view issue by using SECURITY INVOKER
-- Drop the existing view first
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with SECURITY INVOKER (this is the default and safe)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  full_name,
  avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;