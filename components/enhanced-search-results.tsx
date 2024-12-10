"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Link } from "lucide-react";
import { BotMessage } from "./ai-response";
import { Search, Image as ImageIcon, Video } from "lucide-react";

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

interface RelatedQuestion {
  text: string;
  url: string;
}

interface VideoResult {
  title: string;
  url: string;
  thumbnailUrl: string;
}

interface EnhancedSearchResultsProps {
  query: string;
  images?: { url: string; description: string }[];
  sources: SearchResult[];
  answer: string;
  relatedQuestions?: RelatedQuestion[];
  videos?: VideoResult[];
}

export default function EnhancedSearchResults({
  query,
  images = [],
  sources,
  relatedQuestions = [],
  videos = [],
}: EnhancedSearchResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
        <Search className="h-4 w-4" />
        Search results for: <span className="px-1">{query}</span>
      </div>
      {/* Images Grid Section */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center w-fit">
            <ImageIcon className="h-4 w-4 mr-1" />
            Images
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.slice(0, 4).map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-video relative">
                    <Image
                      src={image.url}
                      alt={image.description}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sources Section */}
      <div className="space-y-2">
        <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center w-fit">
          <Link className="h-4 w-4 mr-1" />
          Sources
        </div>
        <div className="grid gap-2">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-6 w-6 mt-1">
                <AvatarImage
                  src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}`}
                  alt={source.title}
                />
                <AvatarFallback>
                  <Globe className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="font-medium">{source.title}</div>
                <div className="text-sm text-muted-foreground">
                  {new URL(source.url).hostname}
                </div>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {index + 1}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center w-fit">
            <Video className="h-4 w-4 mr-1" />
            Videos
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {videos.slice(0, 4).map((video, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-video relative">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <div className="mt-2 text-xs truncate">{video.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Related</h2>
          <div className="space-y-2">
            {relatedQuestions.map((question, index) => (
              <a
                key={index}
                href={question.url}
                className="flex items-center space-x-2 text-blue-600 hover:underline"
              >
                <span>→</span>
                <span>{question.text}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
