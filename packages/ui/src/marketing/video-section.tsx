"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Play } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

/**
 * VideoSection - Embedded video with poster
 * 2026 Best Practices:
 * - Lazy load video for performance
 * - Custom poster image
 * - Modal or inline playback
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface VideoSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Video URL (YouTube, Vimeo, or direct) */
  videoUrl: string;
  /** Poster image URL */
  posterUrl?: string;
  /** Video provider */
  provider?: "youtube" | "vimeo" | "direct";
  /** Playback mode */
  mode?: "inline" | "modal";
  /** Aspect ratio */
  aspectRatio?: "16:9" | "4:3" | "1:1";
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  className?: string;
}

function getEmbedUrl(url: string, provider: string): string {
  if (provider === "youtube") {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (provider === "vimeo") {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  return url;
}

export const VideoSection = forwardRef<HTMLElement, VideoSectionProps>(
  function VideoSection(
    {
      kicker,
      title,
      description,
      videoUrl,
      posterUrl,
      provider = "youtube",
      mode = "inline",
      aspectRatio = "16:9",
      sectionVariant = "dark",
      className,
    },
    ref
  ) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sectionVariantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    const aspectClasses = {
      "16:9": "aspect-video",
      "4:3": "aspect-[4/3]",
      "1:1": "aspect-square",
    };

    const handlePlay = () => {
      if (mode === "modal") {
        setIsModalOpen(true);
      } else {
        setIsPlaying(true);
      }
    };

    const embedUrl = getEmbedUrl(videoUrl, provider);

    return (
      <>
        <section
          ref={ref}
          className={clsx("py-20 md:py-32", sectionVariantClasses[sectionVariant], className)}
        >
          <Container size="lg">
            {/* Section Header */}
            {(kicker || title || description) && (
              <Stack gap={4} className="mb-12 text-center items-center">
                {kicker && <Kicker>{kicker}</Kicker>}
                {title && <H2 className="text-text-primary">{title}</H2>}
                {description && (
                  <Body size="lg" className="text-text-muted max-w-2xl">
                    {description}
                  </Body>
                )}
              </Stack>
            )}

            {/* Video Container */}
            <div
              className={clsx(
                "relative rounded-card overflow-hidden border-2 border-border",
                aspectClasses[aspectRatio]
              )}
            >
              {isPlaying && mode === "inline" ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video"
                />
              ) : (
                <>
                  {/* Poster */}
                  {posterUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${posterUrl})` }}
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                      variant="solid"
                      size="lg"
                      onClick={handlePlay}
                      icon={<Play className="size-6 ml-1" />}
                      className="rounded-full size-20 p-0 flex items-center justify-center shadow-primary"
                      aria-label="Play video"
                    />
                  </div>
                </>
              )}
            </div>
          </Container>
        </section>

        {/* Modal */}
        {mode === "modal" && (
          <OverlayLayout
            type="modal"
            size="xl"
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            closeOnEscape
            closeOnBackdrop
            preventScroll
            animation="scale"
            inverted
            showClose
            ariaLabel="Video player"
            contentClassName="p-0 bg-black"
          >
            <div className={clsx("rounded-card overflow-hidden", aspectClasses[aspectRatio])}>
              <iframe
                src={isModalOpen ? embedUrl : ""}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video"
              />
            </div>
          </OverlayLayout>
        )}
      </>
    );
  }
);

export default VideoSection;
