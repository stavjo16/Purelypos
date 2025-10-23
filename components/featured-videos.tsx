import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Play } from "lucide-react"

function getEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.hostname.includes("youtu.be") ? urlObj.pathname.slice(1) : urlObj.searchParams.get("v")
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    // Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/").filter(Boolean)[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }

    return null
  } catch {
    return null
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
            const embedUrl = video.video_source === "link" ? getEmbedUrl(video.video_url) : null
            const profile = profileMap.get(video.user_id)

            return (
              <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  {video.description && <CardDescription className="line-clamp-2">{video.description}</CardDescription>}
                  {profile && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={video.video_url} controls className="w-full h-full object-cover" />
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
