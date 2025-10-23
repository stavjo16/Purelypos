"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AlertCircle, Search } from "lucide-react"
import { DeleteVideoButton } from "@/components/delete-video-button"
import { ThumbsUpButton } from "@/components/thumbs-up-button"
import { ShareButton } from "@/components/share-button"

type Video = {
  id: string
  title: string
  description: string | null
  video_url: string
  video_source: string
  user_id: string
  created_at: string
}

type Profile = {
  user_id: string
  display_name: string
  bio: string | null
  photo_url: string | null
}

type VideosListProps = {
  videos: Video[]
  profiles: Profile[]
  likeCountMap: Map<string, number>
  userLikesSet: Set<string>
  isAuthenticated: boolean
  userIsAdmin: boolean
  userId: string | null
}

function getEmbedUrl(url: string): { embedUrl: string | null; isDirectVideo: boolean; error?: string } {
  try {
    const urlObj = new URL(url)

    // Check if it's a direct video file
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
    const pathname = urlObj.pathname.toLowerCase()
    if (videoExtensions.some((ext) => pathname.endsWith(ext))) {
      return { embedUrl: url, isDirectVideo: true }
    }

    // YouTube - handle multiple URL formats
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId: string | null = null

      if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1).split("?")[0]
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0]
      } else if (urlObj.pathname.includes("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split("?")[0]
      } else {
        videoId = urlObj.searchParams.get("v")
      }

      if (videoId) {
        return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isDirectVideo: false }
      }
    }

    // Vimeo - handle multiple URL formats
    if (urlObj.hostname.includes("vimeo.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      const videoId = pathParts[pathParts.length - 1]

      if (videoId && /^\d+$/.test(videoId)) {
        return { embedUrl: `https://player.vimeo.com/video/${videoId}`, isDirectVideo: false }
      }
    }

    return {
      embedUrl: null,
      isDirectVideo: false,
      error: "This video platform is not supported. Please use YouTube, Vimeo, or a direct video file link.",
    }
  } catch {
    return {
      embedUrl: null,
      isDirectVideo: false,
      error: "Invalid video URL",
    }
  }
}

export function VideosList({
  videos,
  profiles,
  likeCountMap,
  userLikesSet,
  isAuthenticated,
  userIsAdmin,
  userId,
}: VideosListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Create a map of user_id to profile for quick lookup
  const profileMap = new Map(profiles.map((p) => [p.user_id, p]))

  // Filter videos based on search query
  const filteredVideos = videos.filter((video) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const profile = profileMap.get(video.user_id)

    // Search in title, description, uploader name, and uploader bio
    return (
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query) ||
      profile?.display_name.toLowerCase().includes(query) ||
      profile?.bio?.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search videos by title, description, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredVideos.length} {filteredVideos.length === 1 ? "video" : "videos"}
          </p>
        )}
      </div>

      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredVideos.map((video) => {
            const videoInfo =
              video.video_source === "link"
                ? getEmbedUrl(video.video_url)
                : { embedUrl: video.video_url, isDirectVideo: true }
            const isOwner = userId && video.user_id === userId
            const canDelete = userIsAdmin || isOwner
            const likeCount = likeCountMap.get(video.id) || 0
            const isLiked = userLikesSet.has(video.id)
            const profile = profileMap.get(video.user_id)

            return (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      {video.description && <CardDescription className="mt-2">{video.description}</CardDescription>}
                    </div>
                    {canDelete && <DeleteVideoButton videoId={video.id} />}
                  </div>
                  {profile && (
                    <Link
                      href={`/user/${video.user_id}`}
                      className="block mt-4 pt-4 border-t hover:bg-muted/50 rounded-lg transition-colors -mx-6 px-6 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.display_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                            {profile.display_name}
                          </p>
                          {profile.bio && (
                            <p className="text-xs text-gray-600 truncate" title={profile.bio}>
                              {profile.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {videoInfo.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{videoInfo.error}</AlertDescription>
                    </Alert>
                  ) : videoInfo.embedUrl && !videoInfo.isDirectVideo ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={videoInfo.embedUrl}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : videoInfo.embedUrl ? (
                    <video src={videoInfo.embedUrl} controls className="w-full rounded-lg" />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Unable to load video</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-2 w-full">
                    <ThumbsUpButton
                      videoId={video.id}
                      initialLikeCount={likeCount}
                      initialIsLiked={isLiked}
                      isAuthenticated={isAuthenticated}
                    />
                    <ShareButton
                      url={`https://purelypos.com/videos/${video.id}`}
                      title={video.title}
                      description={video.description || "Check out this positive video on PURELYPOS!"}
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchQuery ? `No videos found matching "${searchQuery}"` : "No videos yet"}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
