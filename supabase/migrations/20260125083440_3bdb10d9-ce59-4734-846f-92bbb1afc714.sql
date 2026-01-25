-- Add year_level column to materials table for organizing by year
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS year_level integer;

-- Create programs table for dynamic program management
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('diploma', 'certificate')),
  duration text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on programs table
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active programs
CREATE POLICY "Anyone can view active programs"
ON public.programs FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage programs
CREATE POLICY "Admins can insert programs"
ON public.programs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update programs"
ON public.programs FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete programs"
ON public.programs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add approval_status to profiles for user approval workflow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add program enrollment to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enrolled_program text;

-- Create trigger for updating programs updated_at
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default programs from the institution's program list
INSERT INTO public.programs (name, type, duration, description) VALUES
-- Diploma Programs
('Registered Nursing', 'diploma', '3 Years', 'Full-time diploma course in Registered Nursing'),
('Midwifery', 'diploma', '3 Years', 'Full-time diploma course in Midwifery'),
('Psychosocial Counselling (Diploma)', 'diploma', '2 Years', 'Full-time diploma course in Psychosocial Counselling'),
-- Certificate Programs
('Assistant Nursing', 'certificate', '6-12 Months', 'Certificate course in Assistant Nursing'),
('Clinical Record Management', 'certificate', '3-6 Months', 'Certificate course in Clinical Record Management'),
('Hospital Record Management', 'certificate', '6-12 Months', 'Certificate course in Hospital Record Management'),
('Dental Health Care Assistant', 'certificate', '3-6 Months', 'Certificate course in Dental Health Care'),
('Psychosocial Counselling', 'certificate', '3-6 Months', 'Certificate course in Psychosocial Counselling'),
('HIV/AIDS Management', 'certificate', '3-6 Months', 'Certificate course in HIV/AIDS Management'),
('Health Care Assistant', 'certificate', '3-6 Months', 'Certificate course in Health Care'),
('Pharmacy Assistant', 'certificate', '3-6 Months', 'Certificate course in Pharmacy'),
('TB Management', 'certificate', '3-6 Months', 'Certificate course in TB Management')
ON CONFLICT (name) DO NOTHING;

-- Update existing users to be approved (since they already registered before this feature)
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending';