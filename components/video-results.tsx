import React, { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { SerperSearchResultItem } from "@/lib/types"

interface VideoCarouselProps {
  videos: SerperSearchResultItem[]
}

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const [currentVideo, setCurrentVideo] = useState(0)

  const getVideoId = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search)
    return urlParams.get('v')
  }

  return (
    <Carousel className="w-full max-w-3xl mx-auto">
      <CarouselContent>
        {videos.map((video, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-video items-center justify-center p-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getVideoId(video.link)}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
