import { Hero } from "@/components/hero"
import { WhatIsPurelypos } from "@/components/what-is-purelypos"
import { HowItWorks } from "@/components/how-it-works"
import { WhyItMatters } from "@/components/why-it-matters"
import { JoinCommunity } from "@/components/join-community"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhatIsPurelypos />
      <HowItWorks />
      <WhyItMatters />
      <JoinCommunity />
      <Footer />
    </main>
  )
}
