import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || []
  const isAdmin = adminEmails.includes(user.email || "")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Admin Setup</CardTitle>
            <CardDescription>Configure your admin access for PURELYPOS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Your Account</h3>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Admin Status</h3>
              {isAdmin ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">You are an admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">You are not an admin</span>
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">How to Make Yourself Admin</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>
                  Add a new variable:
                  <div className="mt-2 p-2 bg-background rounded border font-mono text-xs">
                    <div>
                      Name: <span className="text-primary">ADMIN_EMAILS</span>
                    </div>
                    <div>
                      Value: <span className="text-primary">{user.email}</span>
                    </div>
                  </div>
                </li>
                <li>Set it for Production, Preview, and Development</li>
                <li>Redeploy your site</li>
                <li>Refresh this page to verify admin access</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                Tip: You can add multiple admin emails separated by commas
              </p>
            </div>

            <div className="flex gap-4">
              <Button asChild>
                <Link href="/videos">Go to Videos</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
