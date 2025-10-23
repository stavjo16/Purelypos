"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface ThumbsUpButtonProps {
  videoId: string
  initialLikeCount: number
  initialIsLiked: boolean
  isAuthenticated: boolean
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return ""

  let anonymousId = localStorage.getItem("purelypos_anonymous_id")
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("purelypos_anonymous_id", anonymousId)
  }
  return anonymousId
}

function getLocalLikes(): Set<string> {
  if (typeof window === "undefined") return new Set()

  const likes = localStorage.getItem("purelypos_liked_videos")
  return likes ? new Set(JSON.parse(likes)) : new Set()
}

function setLocalLikes(likes: Set<string>) {
  if (typeof window === "undefined") return

  localStorage.setItem("purelypos_liked_videos", JSON.stringify([...likes]))
}

export function ThumbsUpButton({ videoId, initialLikeCount, initialIsLiked, isAuthenticated }: ThumbsUpButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      const localLikes = getLocalLikes()
      setIsLiked(localLikes.has(videoId))
    }
  }, [videoId, isAuthenticated])

  const handleLike = async () => {
    setIsLoading(true)

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      const anonymousId = !isAuthenticated ? getAnonymousId() : undefined

      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonymousId }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle like")
      }

      const data = await response.json()

      if (!isAuthenticated) {
        const localLikes = getLocalLikes()
        if (data.liked) {
          localLikes.add(videoId)
        } else {
          localLikes.delete(videoId)
        }
        setLocalLikes(localLikes)
      }

      setIsLiked(data.liked)
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1))

      router.refresh()
    } catch (error) {
      console.error("Error toggling like:", error)
      // Revert optimistic update
      setIsLiked(!newIsLiked)
      setLikeCount((prev) => (newIsLiked ? prev - 1 : prev + 1))
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
