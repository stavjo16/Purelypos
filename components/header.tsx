import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-serif font-bold text-foreground">PURELYPOS</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/creator">
            <Button variant="ghost">Meet PurelyPOS's Creator</Button>
          </Link>
          <Link href="/videos">
            <Button variant="ghost">Videos</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-full bg-transparent">
              Login
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="rounded-full">Sign Up</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
