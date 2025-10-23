import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: videoId } = await params

    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already liked this video
    const { data: existingLike, error: selectError } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    if (existingLike) {
      // Unlike: Remove the like
      const { error: deleteError } = await supabase.from("video_likes").delete().eq("id", existingLike.id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like: Add a new like
      const { error: insertError } = await supabase.from("video_likes").insert({
        video_id: videoId,
        user_id: user.id,
      })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("[v0] Error toggling like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
