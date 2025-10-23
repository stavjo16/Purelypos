import { Video, Tag, Zap } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Video,
      number: "1",
      title: "Record or Upload",
      description: "Capture your moment of joy, kindness, or humor.",
    },
    {
      icon: Tag,
      number: "2",
      title: "Tag & Share",
      description: "Add a simple tag like #Grateful or #Kindness.",
    },
    {
      icon: Zap,
      number: "3",
      title: "Spread the Light",
      description: "Watch as positivity ripples through the community.",
    },
  ]

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            Upload hope in three simple steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-xl" />
                <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
                  {step.number}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
