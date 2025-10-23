import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Upload } from "lucide-react"
import { DeleteVideoButton } from "@/components/delete-video-button"
import { ThumbsUpButton } from "@/components/thumbs-up-button"
import { isAdmin } from "@/lib/supabase/is-admin"

export const dynamic = "force-dynamic"

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

export default async function VideosPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userIsAdmin = user ? await isAdmin(user.id) : false

  // Fetch all videos
  const { data: videos, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching videos:", error)
  }

  const videoIds = videos?.map((v) => v.id) || []

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
              const embedUrl = video.video_source === "link" ? getEmbedUrl(video.video_url) : null
              const isOwner = user && video.user_id === user.id
              const canDelete = userIsAdmin || isOwner
              const likeCount = likeCountMap.get(video.id) || 0
              const isLiked = userLikesSet.has(video.id)

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
                  </CardHeader>
                  <CardContent>
                    {embedUrl ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video src={video.video_url} controls className="w-full rounded-lg" />
                    )}
                  </CardContent>
                  <CardFooter>
                    <ThumbsUpButton
                      videoId={video.id}
                      initialLikeCount={likeCount}
                      initialIsLiked={isLiked}
                      isAuthenticated={!!user}
                    />
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
