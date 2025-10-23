import { createClient } from "@/lib/supabase/server"

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get user's email
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return false

  // Check if user's email is in the admin emails list
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()) || []
  return adminEmails.includes(user.email?.toLowerCase() || "")
}
