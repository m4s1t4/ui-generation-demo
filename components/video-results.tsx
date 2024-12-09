'use client'
import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from 'lucide-react'
interface Video {
  title: string
  link: string
  thumbnail: string
  duration?: string
  views?: number
  date?: string
}

interface VideoCarouselProps {
  videos: Video[] | undefined
}

export function VideoCarousel({ videos = [] }: VideoCarouselProps) {
  console.log('VideoCarousel props:', videos)

  if (!videos || videos.length === 0) {
    console.log('No videos provided')
    return null
  }

  const getVideoId = (url: string) => {
    try {
      const urlParams = new URLSearchParams(new URL(url).search)
      return urlParams.get('v') || url.split('watch?v=')[1]
    } catch {
      return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center w-fit">
        <Link className="h-4 w-4 mr-1" />
        Videos
      </div>
      <Carousel className="w-full">
        <CarouselContent>
          {videos.map((video, index) => {
            const videoId = getVideoId(video.link)
            if (!videoId) return null

            return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card>
                  <CardContent className="flex flex-col p-4">
                    <div className="aspect-video relative">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg absolute inset-0"
                      />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium line-clamp-2">{video.title}</h4>
                      {video.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {video.duration}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {videos.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  )
}
