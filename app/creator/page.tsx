import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Heart, Video, Mail } from "lucide-react"
import { ShareButton } from "@/components/share-button"

export default function CreatorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4">Meet PurelyPOS's Creator</h1>
          <p className="text-xl text-muted-foreground">The story behind the positivity movement</p>
        </div>

        {/* Bio Card */}
        <Card className="mb-8 border-2">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Welcome! 👋</h2>

              <p className="text-muted-foreground leading-relaxed mb-4">
                Hi, my name is Jonathan, the creator of PURELYPOS. I built this platform because I believe the world needs more positivity, kindness, and uplifting content. In a digital landscape often filled with negativity and divisiveness, I wanted to create a space where only good vibes exist.  
Reach out to me if you would like to chat.  I am always up to meet new people and learn more about the world!
              </p>

              <h3 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">The Vision</h3>

              <p className="text-muted-foreground leading-relaxed mb-4">
                PURELYPOS is more than just a video platform, it's our lives in action. Every video shared here is a
                reminder that there's still so much good in the world. From heartwarming stories to inspiring moments,
                this is where positivity thrives.
              </p>

              <h3 className="text-2xl font-serif font-bold text-foreground mt-8 mb-4">Why This Matters</h3>

              <p className="text-muted-foreground leading-relaxed mb-4">
                I created PURELYPOS because I believe that what we consume shapes how we see the world. By curating a
                space dedicated solely to positive content, we can collectively shift our perspective and spread more
                joy, hope, and kindness.
              </p>

              <div className="flex items-center gap-4 mt-8 p-6 bg-primary/10 rounded-lg">
                <Heart className="w-8 h-8 text-primary flex-shrink-0" />
                <p className="text-foreground font-medium">
                  "Every positive video shared is a ripple of hope in someone's day. Together, we're building a
                  community that chooses to see the good."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-serif font-bold text-foreground">Join the Movement</h3>
          <p className="text-muted-foreground mb-6">Be part of spreading positivity across the world</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/sign-up">
              <Button size="lg" className="rounded-full">
                <Video className="w-4 h-4 mr-2" />
                Share Your Positivity
              </Button>
            </Link>
            <Link href="/videos">
              <Button size="lg" variant="outline" className="rounded-full bg-transparent">
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Videos
              </Button>
            </Link>
            <a href="mailto:Stavjo16@gmail.com?subject=Contact%20from%20PurelyPOS">
              <Button size="lg" variant="outline" className="rounded-full bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Contact PurelyPOS
              </Button>
            </a>
            <ShareButton
              size="lg"
              title="Meet the Creator of PURELYPOS"
              description="Learn about the vision behind PURELYPOS - a platform dedicated to spreading positivity through uplifting videos!"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
