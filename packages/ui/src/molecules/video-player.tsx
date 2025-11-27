"use client";

import { forwardRef, useState, useRef, useEffect, HTMLAttributes } from "react";
import clsx from "clsx";

export interface VideoPlayerProps extends HTMLAttributes<HTMLDivElement> {
  /** Video source URL */
  src: string;
  /** Poster image URL */
  poster?: string;
  /** Video title for accessibility */
  title?: string;
  /** Auto play video (muted by default) */
  autoPlay?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Show controls */
  controls?: boolean;
  /** Muted by default */
  muted?: boolean;
  /** Aspect ratio */
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
  /** Apply B&W filter */
  grayscale?: boolean;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback when video plays */
  onPlay?: () => void;
  /** Callback when video pauses */
  onPause?: () => void;
}

const aspectRatioClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "21:9": "aspect-[21/9]",
};

export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      poster,
      title,
      autoPlay = false,
      loop = false,
      controls = true,
      muted = true,
      aspectRatio = "16:9",
      grayscale = false,
      onEnded,
      onPlay,
      onPause,
      className,
      ...props
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      };

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        onEnded?.();
      };

      const handlePlay = () => {
        setIsPlaying(true);
        onPlay?.();
      };

      const handlePause = () => {
        setIsPlaying(false);
        onPause?.();
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }, [onEnded, onPlay, onPause]);

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !isMuted;
      setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    };

    const toggleFullscreen = () => {
      const container = ref && "current" in ref ? ref.current : null;
      if (!container) return;

      if (!isFullscreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "relative bg-black overflow-hidden group",
          aspectRatioClasses[aspectRatio],
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        {...props}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          className={clsx(
            "w-full h-full object-cover",
            grayscale && "grayscale"
          )}
          aria-label={title}
        />

        {/* Custom Controls */}
        {controls && (
          <div
            className={clsx(
              "absolute inset-0 flex flex-col justify-end transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Play/Pause overlay button */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {!isPlaying && (
                <div className="w-spacing-20 h-spacing-20 bg-white flex items-center justify-center">
                  <svg
                    className="w-spacing-8 h-spacing-8 text-black ml-spacing-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>

            {/* Bottom controls */}
            <div className="relative z-10 p-spacing-4 flex flex-col gap-gap-xs">
              {/* Progress bar */}
              <div
                className="h-spacing-1 bg-grey-700 cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute w-spacing-3 h-spacing-3 bg-white -mt-spacing-1 -ml-spacing-1 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, top: "50%" }}
                />
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-gap-md">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-spacing-10 h-spacing-10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Mute/Unmute */}
                  <button
                    onClick={toggleMute}
                    className="w-spacing-10 h-spacing-10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  {/* Time */}
                  <span className="font-code text-mono-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-gap-xs">
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-spacing-10 h-spacing-10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                      </svg>
                    ) : (
                      <svg className="w-spacing-5 h-spacing-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default VideoPlayer;
