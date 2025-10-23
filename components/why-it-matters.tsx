import { Smile } from "lucide-react"

export function WhyItMatters() {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-8">
            <Smile className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8 text-balance">
            Because every scroll should make you smile.
          </h2>

          {/* Body */}
          <div className="space-y-6 text-xl text-muted-foreground leading-relaxed">
            <p className="text-pretty">
              PURELYPOS was born from a simple belief, that people crave something real and good.
            </p>
            <p className="text-pretty">
              In a dark world, light stands out. One positive video can change a mood, a day, or even a life.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
