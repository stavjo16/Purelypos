import { Sparkles } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const links = [
    { label: "About", href: "#" },
    { label: "Upload", href: "/upload" },
    { label: "Explore", href: "/videos" },
    { label: "Guidelines", href: "#" },
    { label: "Contact", href: "#" },
  ]

  return (
    <footer className="py-16 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-6xl">
        {/* Tagline */}
        <div className="text-center mb-12">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <Sparkles className="w-6 h-6 text-primary" />
            <p className="text-2xl font-serif font-bold text-foreground">PURELYPOS</p>
          </Link>
          <p className="text-lg text-muted-foreground italic">"See the good. Share the good."</p>
          <p className="text-sm text-muted-foreground mt-2">purelypos.com</p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 mb-8">
          {links.map((link, index) => (
            <a key={index} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PURELYPOS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
