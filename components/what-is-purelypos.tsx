import { Heart, Shield, Share2, MessageCircle } from "lucide-react"

export function WhatIsPurelypos() {
  const features = [
    {
      icon: Heart,
      title: "100% positive-content policy",
      description: "Every video is vetted to ensure it spreads joy, not negativity",
    },
    {
      icon: Shield,
      title: "Built-in kindness moderation",
      description: "Our community guidelines protect the positive space we've created",
    },
    {
      icon: Share2,
      title: "Simple upload and share tools",
      description: "Share your moments of joy in seconds with our intuitive platform",
    },
    {
      icon: MessageCircle,
      title: "Comment threads that celebrate",
      description: "Engage in conversations that uplift, not criticize",
    },
  ]

  return (
    <section className="py-24 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            The world's first positivity, only video platform.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
            Social media should make you feel better, not worse. PURELYPOS filters out negativity and creates a home for
            uplifting stories, funny moments, and good news that reminds us how beautiful people can be.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-muted/50 hover:bg-muted transition-colors border border-border"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
