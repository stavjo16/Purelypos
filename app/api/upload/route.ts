import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const mode = formData.get("mode") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    let videoUrl: string
    let fileSize: number | null = null
    let videoSource: "upload" | "link"

    if (mode === "file") {
      const file = formData.get("file") as File

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Upload video to Vercel Blob
      const blob = await put(file.name, file, {
        access: "public",
      })

      videoUrl = blob.url
      fileSize = file.size
      videoSource = "upload"
    } else if (mode === "link") {
      const url = formData.get("videoUrl") as string

      if (!url) {
        return NextResponse.json({ error: "No video URL provided" }, { status: 400 })
      }

      // Validate URL format
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }

      videoUrl = url
      videoSource = "link"
    } else {
      return NextResponse.json({ error: "Invalid upload mode" }, { status: 400 })
    }

    // Save video metadata to Supabase
    const { data: video, error: dbError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        video_source: videoSource,
        file_size: fileSize,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save video metadata" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      video,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
