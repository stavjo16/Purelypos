import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PURELYPOS - See the good. Share the good.",
  description: "The world's first positivity-only video platform. Upload, share, and comment on only positive videos.",
  metadataBase: new URL("https://purelypos.com"),
  openGraph: {
    title: "PURELYPOS - See the good. Share the good.",
    description:
      "The world's first positivity-only video platform. Upload, share, and comment on only positive videos.",
    url: "https://purelypos.com",
    siteName: "PURELYPOS",
    type: "website",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
