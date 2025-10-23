-- Create admins table to track admin users
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if a user is an admin (read-only)
CREATE POLICY "Anyone can view admins"
  ON public.admins
  FOR SELECT
  USING (true);

-- Policy: Only existing admins can add new admins
CREATE POLICY "Admins can manage admins"
  ON public.admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS admins_user_id_idx ON public.admins(user_id);

-- Instructions: To make a user an admin, run this SQL with their user_id:
-- INSERT INTO public.admins (user_id) VALUES ('user-uuid-here');
