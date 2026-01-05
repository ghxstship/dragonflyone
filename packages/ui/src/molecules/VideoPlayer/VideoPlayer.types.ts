import type { HTMLAttributes } from "react";

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
