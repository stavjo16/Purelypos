-- Allow anonymous likes by making user_id nullable and updating policies

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can insert their own likes" ON video_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON video_likes;

-- Make user_id nullable to allow anonymous likes
ALTER TABLE video_likes ALTER COLUMN user_id DROP NOT NULL;

-- Add anonymous_id column for tracking anonymous users
ALTER TABLE video_likes ADD COLUMN IF NOT EXISTS anonymous_id TEXT;

-- Update unique constraint to handle both authenticated and anonymous users
ALTER TABLE video_likes DROP CONSTRAINT IF EXISTS video_likes_video_id_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_likes_unique_authenticated 
  ON video_likes(video_id, user_id) 
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_likes_unique_anonymous 
  ON video_likes(video_id, anonymous_id) 
  WHERE anonymous_id IS NOT NULL;

-- Policy: Anyone (authenticated or anonymous) can insert likes
CREATE POLICY "Anyone can insert likes"
  ON video_likes FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL AND anonymous_id IS NOT NULL)
  );

-- Policy: Anyone can delete their own likes (authenticated or anonymous)
CREATE POLICY "Anyone can delete their own likes"
  ON video_likes FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );
