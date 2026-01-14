-- Remove the view since it's not needed with the current RLS approach
-- Author names come from the materials.author column directly, not profiles
DROP VIEW IF EXISTS public.public_profiles;