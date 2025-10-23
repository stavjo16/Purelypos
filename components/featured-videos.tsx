import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Play, AlertCircle } from "lucide-react"

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

    // Vimeo - handle multiple URL formats
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
      error: "This video platform is not supported.",
    }
  } catch {
    return {
      embedUrl: null,
      isDirectVideo: false,
      error: "Invalid video URL",
    }
  }
}

export async function FeaturedVideos() {
  const supabase = await createClient()

  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(3)

  if (!videos || videos.length === 0) {
    return null
  }

  // Fetch profiles for the video uploaders
  const userIds = videos.map((v) => v.user_id)
  const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds)

  // Create a map of user_id to profile for quick lookup
  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || [])

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">See What's Spreading Joy</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check out some of the positive moments our community is sharing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {videos.map((video) => {
            const videoInfo =
              video.video_source === "link"
                ? getEmbedUrl(video.video_url)
                : { embedUrl: video.video_url, isDirectVideo: true }
            const profile = profileMap.get(video.user_id)

            return (
              <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  {video.description && <CardDescription className="line-clamp-2">{video.description}</CardDescription>}
                  {profile && (
                    <Link
                      href={`/user/${video.user_id}`}
                      className="block mt-4 pt-4 border-t hover:bg-muted/50 rounded-lg transition-colors -mx-6 px-6 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={profile.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {profile.display_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                            {profile.display_name}
                          </p>
                          {profile.bio && (
                            <p className="text-xs text-gray-600 truncate" title={profile.bio}>
                              {profile.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                    {videoInfo.error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{videoInfo.error}</AlertDescription>
                      </Alert>
                    ) : videoInfo.embedUrl && !videoInfo.isDirectVideo ? (
                      <iframe
                        src={videoInfo.embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : videoInfo.embedUrl ? (
                      <video src={videoInfo.embedUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Unable to load video</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Sign Up to See More Positive Videos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
