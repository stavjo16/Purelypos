import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Video, Heart, AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"
import { ThumbsUpButton } from "@/components/thumbs-up-button"
import { ShareButton } from "@/components/share-button"

export const dynamic = "force-dynamic"

function getEmbedUrl(url: string): { embedUrl: string | null; isDirectVideo: boolean; error?: string } {
  try {
    const urlObj = new URL(url)

    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
    const pathname = urlObj.pathname.toLowerCase()
    if (videoExtensions.some((ext) => pathname.endsWith(ext))) {
      return { embedUrl: url, isDirectVideo: true }
    }

    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId: string | null = null

      if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1).split("?")[0]
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0]
      } else if (urlObj.pathname.includes("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split("?")[0]
      } else {
        videoId = urlObj.searchParams.get("v")
      }

      if (videoId) {
        return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isDirectVideo: false }
      }
    }

    if (urlObj.hostname.includes("vimeo.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      const videoId = pathParts[pathParts.length - 1]

      if (videoId && /^\d+$/.test(videoId)) {
        return { embedUrl: `https://player.vimeo.com/video/${videoId}`, isDirectVideo: false }
      }
    }

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

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()
  const { userId } = params

  // Get current user for like status
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch user's videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const videoIds = videos?.map((v) => v.id) || []

  // Get like counts for all videos
  const { data: likeCounts } = await supabase.from("video_likes").select("video_id").in("video_id", videoIds)

  // Get current user's likes
  const { data: userLikes } = currentUser
    ? await supabase.from("video_likes").select("video_id").eq("user_id", currentUser.id).in("video_id", videoIds)
    : { data: null }

  // Create maps for quick lookup
  const likeCountMap = new Map<string, number>()
  likeCounts?.forEach((like) => {
    likeCountMap.set(like.video_id, (likeCountMap.get(like.video_id) || 0) + 1)
  })

  const userLikesSet = new Set(userLikes?.map((like) => like.video_id) || [])

  // Calculate total likes received
  const totalLikes = Array.from(likeCountMap.values()).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.photo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  {profile.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-serif font-bold mb-2">{profile.display_name}</h1>
                {profile.bio && <p className="text-muted-foreground text-lg mb-4">{profile.bio}</p>}
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      <strong className="text-2xl font-bold">{videos?.length || 0}</strong> Videos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      <strong className="text-2xl font-bold">{totalLikes}</strong> Likes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Videos */}
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4">Videos by {profile.display_name}</h2>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const videoInfo =
                video.video_source === "link"
                  ? getEmbedUrl(video.video_url)
                  : { embedUrl: video.video_url, isDirectVideo: true }
              const likeCount = likeCountMap.get(video.id) || 0
              const isLiked = userLikesSet.has(video.id)

              return (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    {video.description && <CardDescription>{video.description}</CardDescription>}
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
                        isAuthenticated={!!currentUser}
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
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This user hasn't uploaded any videos yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
