import { Button } from "@/components/ui/button"
import { Upload, Sparkles } from "lucide-react"
import Link from "next/link"
import { ShareButton } from "@/components/share-button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/30 via-background to-accent/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-20 mx-auto text-center">
        {/* Logo/Brand */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold text-foreground">PURELYPOS</h1>
        </Link>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground mb-12 tracking-wide">
          When the world seems tough &amp; you need a smile, PURELYPOS
        </p>

        {/* Main Headline */}
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight text-balance max-w-5xl mx-auto">
          Be one of the first to use PURELYPOS: Let's make Life Better, together.
        </h2>

        {/* Subtext */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto text-pretty">
          PURELYPOS is the place to upload, share, and comment on positive videos.
          <br />
          No hate, no noise, just people, laughter, kindness, and hope.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full">
              <Upload className="w-5 h-5 mr-2" />
              Upload a Video
            </Button>
          </Link>
          <Link href="/videos">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-2 bg-transparent">
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Good Moments
            </Button>
          </Link>
          <ShareButton
            variant="outline"
            size="lg"
            title="PURELYPOS - Share Positivity"
            description="Join PURELYPOS - a place to upload, share, and enjoy positive videos. No hate, no noise, just kindness and hope!"
          />
        </div>
      </div>
    </section>
  )
}
