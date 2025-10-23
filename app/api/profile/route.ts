import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const displayName = formData.get("displayName") as string
    const bio = formData.get("bio") as string
    const photo = formData.get("photo") as File | null

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 })
    }

    let photoUrl = null

    // Upload photo to Blob storage if provided
    if (photo && photo.size > 0) {
      const blob = await put(`profiles/${user.id}/${photo.name}`, photo, {
        access: "public",
      })
      photoUrl = blob.url
    }

    // Create profile in database
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: displayName,
        bio: bio || null,
        photo_url: photoUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Error in profile creation:", error)
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const displayName = formData.get("displayName") as string
    const bio = formData.get("bio") as string
    const photo = formData.get("photo") as File | null

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 })
    }

    let photoUrl: string | undefined = undefined

    // Upload new photo to Blob storage if provided
    if (photo && photo.size > 0) {
      const blob = await put(`profiles/${user.id}/${photo.name}`, photo, {
        access: "public",
      })
      photoUrl = blob.url
    }

    // Update profile in database
    const updateData: any = {
      display_name: displayName,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    }

    // Only update photo_url if a new photo was uploaded
    if (photoUrl) {
      updateData.photo_url = photoUrl
    }

    const { data, error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("Error in profile update:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
