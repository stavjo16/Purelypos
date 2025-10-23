import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Upload, AlertCircle } from "lucide-react"
import { DeleteVideoButton } from "@/components/delete-video-button"
import { ThumbsUpButton } from "@/components/thumbs-up-button"
import { isAdmin } from "@/lib/supabase/is-admin"
import { ShareButton } from "@/components/share-button"

export const dynamic = "force-dynamic"

function getEmbedUrl(url: string): { embedUrl: string | null; isDirectVideo: boolean; error?: string } {
  try {
    const urlObj = new URL(url)

    // Check if it's a direct video file
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
    const pathname = urlObj.pathname.toLowerCase()
    if (videoExtensions.some((ext) => pathname.endsWith(ext))) {
      return { embedUrl: url, isDirectVideo: true }
    }

    // YouTube - handle multiple URL formats
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId: string | null = null

      if (urlObj.hostname.includes("youtu.be")) {
        // Short URL: youtu.be/VIDEO_ID
        videoId = urlObj.pathname.slice(1).split("?")[0]
      } else if (urlObj.pathname.includes("/shorts/")) {
        // Shorts: youtube.com/shorts/VIDEO_ID
        videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0]
      } else if (urlObj.pathname.includes("/embed/")) {
        // Already embedded: youtube.com/embed/VIDEO_ID
        videoId = urlObj.pathname.split("/embed/")[1]?.split("?")[0]
      } else {
        // Standard: youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get("v")
      }

      if (videoId) {
        return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isDirectVideo: false }
      }
    }

    // Vimeo - handle multiple URL formats
    if (urlObj.hostname.includes("vimeo.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      const videoId = pathParts[pathParts.length - 1] // Get last segment

      if (videoId && /^\d+$/.test(videoId)) {
        return { embedUrl: `https://player.vimeo.com/video/${videoId}`, isDirectVideo: false }
      }
    }

    // Unsupported platform
    return {
      embedUrl: null,
      isDirectVideo: false,
      error: "This video platform is not supported. Please use YouTube, Vimeo, or a direct video file link.",
    }
  } catch {
    return {
      embedUrl: null,
      isDirectVideo: false,
      error: "Invalid video URL",
    }
  }
}

export default async function VideosPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userIsAdmin = user ? await isAdmin(user.id) : false

  const { data: videos, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching videos:", error)
  }

  const videoIds = videos?.map((v) => v.id) || []
  const userIds = videos?.map((v) => v.user_id) || []

  // Fetch profiles for the video uploaders
  const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds)

  // Create a map of user_id to profile for quick lookup
  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || [])

  // Get like counts for all videos
  const { data: likeCounts } = await supabase.from("video_likes").select("video_id").in("video_id", videoIds)

  // Get current user's likes
  const { data: userLikes } = user
    ? await supabase.from("video_likes").select("video_id").eq("user_id", user.id).in("video_id", videoIds)
    : { data: null }

  // Create maps for quick lookup
  const likeCountMap = new Map<string, number>()
  likeCounts?.forEach((like) => {
    likeCountMap.set(like.video_id, (likeCountMap.get(like.video_id) || 0) + 1)
  })

  const userLikesSet = new Set(userLikes?.map((like) => like.video_id) || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunrise-50 to-sky-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-sunrise-600">
            PURELYPOS
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">Positive Videos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch and share feel-good moments from your community
          </p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {videos.map((video) => {
              const videoInfo =
                video.video_source === "link"
                  ? getEmbedUrl(video.video_url)
                  : { embedUrl: video.video_url, isDirectVideo: true }
              const isOwner = user && video.user_id === user.id
              const canDelete = userIsAdmin || isOwner
              const likeCount = likeCountMap.get(video.id) || 0
              const isLiked = userLikesSet.has(video.id)
              const profile = profileMap.get(video.user_id)

              return (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        {video.description && <CardDescription className="mt-2">{video.description}</CardDescription>}
                      </div>
                      {canDelete && <DeleteVideoButton videoId={video.id} />}
                    </div>
                    {profile && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.display_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{profile.display_name}</p>
                          {profile.bio && (
                            <p className="text-xs text-gray-600 truncate" title={profile.bio}>
                              {profile.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {videoInfo.error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{videoInfo.error}</AlertDescription>
                      </Alert>
                    ) : videoInfo.embedUrl && !videoInfo.isDirectVideo ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={videoInfo.embedUrl}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : videoInfo.embedUrl ? (
                      <video src={videoInfo.embedUrl} controls className="w-full rounded-lg" />
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Unable to load video</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center gap-2 w-full">
                      <ThumbsUpButton
                        videoId={video.id}
                        initialLikeCount={likeCount}
                        initialIsLiked={isLiked}
                        isAuthenticated={!!user}
                      />
                      <ShareButton
                        url={`https://purelypos.com/videos/${video.id}`}
                        title={video.title}
                        description={video.description || "Check out this positive video on PURELYPOS!"}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No videos yet. Be the first to share something positive!</p>
            {user && (
              <Link href="/upload">
                <Button size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Video
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
