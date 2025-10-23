import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload } from "lucide-react"
import { isAdmin } from "@/lib/supabase/is-admin"
import { VideosList } from "@/components/videos-list"

export const dynamic = "force-dynamic"

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
          <VideosList
            videos={videos}
            profiles={profiles || []}
            likeCountMap={likeCountMap}
            userLikesSet={userLikesSet}
            isAuthenticated={!!user}
            userIsAdmin={userIsAdmin}
            userId={user?.id || null}
          />
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
