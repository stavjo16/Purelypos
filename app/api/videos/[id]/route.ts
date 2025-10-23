import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/supabase/is-admin"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.id

    // Get video details before deleting
    const { data: video, error: fetchError } = await supabase.from("videos").select("*").eq("id", videoId).single()

    if (fetchError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const userIsAdmin = await isAdmin(user.id)
    const isOwner = video.user_id === user.id

    if (!userIsAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete from database (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase.from("videos").delete().eq("id", videoId)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
    }

    // If it's an uploaded file (not a link), delete from Blob storage
    if (video.video_source === "upload" && video.video_url) {
      try {
        await del(video.video_url)
      } catch (blobError) {
        console.error("Blob delete error:", blobError)
        // Continue even if blob deletion fails - database record is already deleted
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
