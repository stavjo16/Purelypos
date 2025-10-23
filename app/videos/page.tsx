import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Upload } from "lucide-react"

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

  // Fetch all videos
  const { data: videos, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching videos:", error)
  }

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

              return (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    {video.video_source === "link" && embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={video.video_url} controls className="w-full aspect-video object-cover" />
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
                    {video.description && (
                      <CardDescription className="line-clamp-3">{video.description}</CardDescription>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(video.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="rounded-full bg-sunrise-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-sunrise-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">No videos yet</h2>
              <p className="text-gray-600 mb-6">Be the first to share some positivity with the community!</p>
              {user ? (
                <Link href="/upload">
                  <Button size="lg">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your First Video
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up">
                  <Button size="lg">Sign Up to Upload</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
