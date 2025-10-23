import { Button } from "@/components/ui/button"
import { ArrowRight, Users } from "lucide-react"
import Link from "next/link"

export function JoinCommunity() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-8">
          <Users className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
          It's not just a platform. It's our lives.
        </h2>

        {/* Body */}
        <div className="space-y-6 text-xl text-muted-foreground leading-relaxed mb-12">
          <p className="text-pretty">
            Every comment, every share, every laugh brings us closer to a world that believes in good again.
          </p>
          <p className="text-pretty">PURELYPOS isn't trying to be viral, it's trying to be valuable.</p>
        </div>

        <Link href="/auth/sign-up">
          <Button size="lg" className="text-lg px-8 py-6 rounded-full">
            Join the Movement
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
