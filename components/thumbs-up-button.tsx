"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface ThumbsUpButtonProps {
  videoId: string
  initialLikeCount: number
  initialIsLiked: boolean
  isAuthenticated: boolean
}

export function ThumbsUpButton({ videoId, initialLikeCount, initialIsLiked, isAuthenticated }: ThumbsUpButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle like")
      }

      const data = await response.json()

      setIsLiked(data.liked)
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1))

      router.refresh()
    } catch (error) {
      console.error("Error toggling like:", error)
      setIsLiked(initialIsLiked)
      setLikeCount(initialLikeCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="gap-2"
    >
      <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likeCount}</span>
    </Button>
  )
}
