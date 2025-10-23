import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Video } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-9xl font-serif font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist. Let's get you back to spreading positivity!
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/videos">
                <Video className="w-4 h-4 mr-2" />
                Watch Videos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
