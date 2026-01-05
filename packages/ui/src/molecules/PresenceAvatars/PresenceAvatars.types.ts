import type { HTMLAttributes } from "react";

export interface PresenceUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  status?: "online" | "away" | "offline";
  lastActive?: string;
}

export interface PresenceAvatarsProps extends HTMLAttributes<HTMLDivElement> {
  /** List of users currently present */
  users: PresenceUser[];
  /** Maximum avatars to show before +N */
  maxVisible?: number;
  /** Size of avatars */
  size?: "sm" | "md" | "lg";
  /** Show status indicator */
  showStatus?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Click handler for avatar */
  onUserClick?: (user: PresenceUser) => void;
}
