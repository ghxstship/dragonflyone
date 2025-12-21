"use client";

import React from "react";
import clsx from "clsx";

// =============================================================================
// TYPES
// =============================================================================

export interface PresenceUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  status?: "online" | "away" | "offline";
  lastActive?: string;
}

export interface PresenceAvatarsProps {
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
  /** Additional className */
  className?: string;
  /** Click handler for avatar */
  onUserClick?: (user: PresenceUser) => void;
}

// =============================================================================
// SIZE MAPPINGS
// =============================================================================

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

const statusSizeClasses = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

const overlapClasses = {
  sm: "-ml-2",
  md: "-ml-3",
  lg: "-ml-4",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusColor(status?: PresenceUser["status"]): string {
  switch (status) {
    case "online":
      return "bg-success-500";
    case "away":
      return "bg-warning-500";
    case "offline":
      return "bg-grey-400";
    default:
      return "bg-success-500";
  }
}

// =============================================================================
// AVATAR COMPONENT
// =============================================================================

function PresenceAvatar({
  user,
  size = "md",
  showStatus = true,
  showTooltip = true,
  inverted = false,
  onClick,
}: {
  user: PresenceUser;
  size?: PresenceAvatarsProps["size"];
  showStatus?: boolean;
  showTooltip?: boolean;
  inverted?: boolean;
  onClick?: () => void;
}) {
  const [showTooltipState, setShowTooltipState] = React.useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          "relative flex items-center justify-center rounded-full border-2 font-semibold transition-transform hover:scale-110 hover:z-content-overlay",
          sizeClasses[size],
          inverted ? "border-ink-900" : "border-white",
          onClick ? "cursor-pointer" : "cursor-default"
        )}
        style={{
          backgroundColor: user.color || "#6366f1",
          color: "white",
        }}
        aria-label={`${user.name}${user.status ? ` - ${user.status}` : ""}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(user.name)}</span>
        )}
      </button>

      {/* Status indicator */}
      {showStatus && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2",
            statusSizeClasses[size],
            getStatusColor(user.status),
            inverted ? "border-ink-900" : "border-white"
          )}
          aria-hidden="true"
        />
      )}

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div
          className={clsx(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap z-tooltip pointer-events-none",
            inverted ? "bg-white text-ink-900" : "bg-ink-900 text-white"
          )}
        >
          <div className="font-semibold">{user.name}</div>
          {user.status && (
            <div className={clsx("text-[10px]", inverted ? "text-ink-500" : "text-ink-400")}>
              {user.status === "online" ? "Online" : user.status === "away" ? "Away" : "Offline"}
            </div>
          )}
          {/* Arrow */}
          <div
            className={clsx(
              "absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent",
              inverted ? "border-t-white" : "border-t-ink-900"
            )}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// OVERFLOW INDICATOR
// =============================================================================

function OverflowIndicator({
  count,
  size = "md",
  inverted = false,
  users,
}: {
  count: number;
  size?: PresenceAvatarsProps["size"];
  inverted?: boolean;
  users: PresenceUser[];
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={clsx(
          "flex items-center justify-center rounded-full border-2 font-semibold",
          sizeClasses[size],
          inverted
            ? "bg-ink-700 border-ink-900 text-ink-300"
            : "bg-ink-200 border-white text-ink-600"
        )}
      >
        +{count}
      </div>

      {/* Tooltip with all hidden users */}
      {showTooltip && (
        <div
          className={clsx(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded text-xs z-tooltip pointer-events-none min-w-max",
            inverted ? "bg-white text-ink-900" : "bg-ink-900 text-white"
          )}
        >
          <div className="font-semibold mb-1">{count} more viewing</div>
          <div className="space-y-0.5">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <span
                  className={clsx("w-2 h-2 rounded-full", getStatusColor(user.status))}
                />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div
            className={clsx(
              "absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent",
              inverted ? "border-t-white" : "border-t-ink-900"
            )}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PresenceAvatars({
  users,
  maxVisible = 5,
  size = "md",
  showStatus = true,
  showTooltip = true,
  inverted = false,
  className,
  onUserClick,
}: PresenceAvatarsProps) {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const hiddenUsers = users.slice(maxVisible);
  const hasOverflow = hiddenUsers.length > 0;

  return (
    <div className={clsx("flex items-center", className)}>
      {/* Avatars */}
      <div className="flex items-center">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={clsx(index > 0 && overlapClasses[size])}
            style={{ zIndex: visibleUsers.length - index }}
          >
            <PresenceAvatar
              user={user}
              size={size}
              showStatus={showStatus}
              showTooltip={showTooltip}
              inverted={inverted}
              onClick={onUserClick ? () => onUserClick(user) : undefined}
            />
          </div>
        ))}

        {/* Overflow indicator */}
        {hasOverflow && (
          <div className={overlapClasses[size]} style={{ zIndex: 0 }}>
            <OverflowIndicator
              count={hiddenUsers.length}
              size={size}
              inverted={inverted}
              users={hiddenUsers}
            />
          </div>
        )}
      </div>

      {/* Viewing count */}
      <span
        className={clsx(
          "ml-3 text-sm font-medium",
          inverted ? "text-ink-400" : "text-ink-500"
        )}
      >
        {users.length} viewing
      </span>
    </div>
  );
}

export default PresenceAvatars;
