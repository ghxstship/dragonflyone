export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials when no image */
  initials?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape variant */
  shape?: "circle" | "square";
  /** Show online status indicator */
  status?: "online" | "offline" | "away" | "busy";
  /** Border style */
  bordered?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export interface AvatarGroupProps {
  /** Maximum avatars to show before +N indicator */
  max?: number;
  /** Size for all avatars */
  size?: AvatarProps["size"];
  /** Children (Avatar components) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}
