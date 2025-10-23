-- Add video_source field to distinguish between uploaded files and external links
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_source TEXT DEFAULT 'upload' CHECK (video_source IN ('upload', 'link'));

-- Add index on video_source for filtering
CREATE INDEX IF NOT EXISTS idx_videos_source ON videos(video_source);
