"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Video, LinkIcon } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type UploadMode = "file" | "link"

export default function UploadPage() {
  const [mode, setMode] = useState<UploadMode>("file")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a valid video file")
        return
      }

      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB")
        return
      }

      setFile(selectedFile)
      setError(null)

      // Create preview URL
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "file" && !file) {
      setError("Please select a video file")
      return
    }

    if (mode === "link" && !videoUrl.trim()) {
      setError("Please enter a video URL")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()

      formData.append("mode", mode)
      formData.append("title", title)
      formData.append("description", description)

      if (mode === "file" && file) {
        formData.append("file", file)
      } else if (mode === "link") {
        formData.append("videoUrl", videoUrl)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)
      setVideoUrl("")
      setPreviewUrl(null)

      // Redirect to gallery
      router.push("/videos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunrise-50 to-sky-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-sunrise-600">
            PURELYPOS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/videos">
              <Button variant="ghost">View Videos</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Share Your Positivity</h1>
            <p className="text-lg text-gray-600">Upload a video or share a link to brighten someone&apos;s day</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Share positive, uplifting content with the PURELYPOS community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <Button
                  type="button"
                  variant={mode === "file" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => {
                    setMode("file")
                    setVideoUrl("")
                    setError(null)
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={mode === "link" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => {
                    setMode("link")
                    setFile(null)
                    setPreviewUrl(null)
                    setError(null)
                  }}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Give your video a positive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what makes this video special..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {mode === "file" ? (
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sunrise-400 transition-colors">
                      <input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label htmlFor="video" className="cursor-pointer">
                        {previewUrl ? (
                          <div className="space-y-4">
                            <video src={previewUrl} controls className="max-h-64 mx-auto rounded-lg" />
                            <p className="text-sm text-gray-600">{file?.name}</p>
                            <Button type="button" variant="outline" size="sm">
                              Change Video
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="rounded-full bg-sunrise-100 p-4">
                                <Video className="h-8 w-8 text-sunrise-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-900">Click to upload video</p>
                              <p className="text-sm text-gray-500">MP4, MOV, AVI up to 100MB</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL *</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">Supports YouTube, Vimeo, and other video platforms</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "file" ? "Uploading..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      {mode === "file" ? (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Add Video Link
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
