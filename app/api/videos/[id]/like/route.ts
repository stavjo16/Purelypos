import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: videoId } = await params
    const body = await request.json()
    const { anonymousId } = body

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Authenticated user flow
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
        // Unlike
        const { error: deleteError } = await supabase.from("video_likes").delete().eq("id", existingLike.id)

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ liked: false })
      } else {
        // Like
        const { error: insertError } = await supabase.from("video_likes").insert({
          video_id: videoId,
          user_id: user.id,
        })

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ liked: true })
      }
    } else if (anonymousId) {
      const { data: existingLike, error: selectError } = await supabase
        .from("video_likes")
        .select("id")
        .eq("video_id", videoId)
        .eq("anonymous_id", anonymousId)
        .maybeSingle()

      if (selectError) {
        return NextResponse.json({ error: selectError.message }, { status: 500 })
      }

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase.from("video_likes").delete().eq("id", existingLike.id)

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ liked: false })
      } else {
        // Like
        const { error: insertError } = await supabase.from("video_likes").insert({
          video_id: videoId,
          user_id: null,
          anonymous_id: anonymousId,
        })

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ liked: true })
      }
    } else {
      return NextResponse.json({ error: "Missing anonymous ID" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
