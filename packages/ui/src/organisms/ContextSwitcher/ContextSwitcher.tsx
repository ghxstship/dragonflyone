"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Dropdown, DropdownItem } from "../../molecules/Dropdown/index.js";
import {
  ChevronDown,
  ChevronLeft,
  FolderKanban,
  Calendar,
  MapPin,
  Check,
  Plus,
  Search,
} from "lucide-react";
import type { 
  ContextSwitcherProps, 
  ProductionContext 
} from "./ContextSwitcher.types.js";

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

function StatusBadge({
  status,
  inverted = true,
}: {
  status: ProductionContext["status"];
  inverted?: boolean;
}) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-success-500/20 text-success-400 border-success-500/30",
    },
    upcoming: {
      label: "Upcoming",
      className: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    },
    past: {
      label: "Past",
      className: inverted
        ? "bg-surface-elevated/50 text-text-muted border-border"
        : "bg-muted text-text-muted border-border",
    },
    draft: {
      label: "Draft",
      className: "bg-warning-500/20 text-warning-400 border-warning-500/30",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        "px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// PRODUCTION ITEM COMPONENT
// =============================================================================

function ProductionItem({
  production,
  isSelected,
  inverted = true,
  onClick,
}: {
  production: ProductionContext;
  isSelected?: boolean;
  inverted?: boolean;
  onClick?: () => void;
}) {
  return (
    <DropdownItem inverted={inverted} onClick={onClick}>
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={clsx(
              "w-8 h-8 rounded flex items-center justify-center shrink-0 border-2",
              inverted
                ? "bg-surface-elevated border-border"
                : "bg-muted border-border"
            )}
          >
            <FolderKanban
              size={16}
              className={inverted ? "text-text-muted" : "text-text-muted"}
            />
          </div>
          <div className="min-w-0">
            <div
              className={clsx(
                "text-sm font-medium truncate",
                inverted ? "text-text-primary" : "text-text-primary"
              )}
            >
              {production.name}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {production.venue && (
                <span
                  className={clsx(
                    "flex items-center gap-1 truncate",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  <MapPin size={10} />
                  {production.venue}
                </span>
              )}
              {production.startDate && (
                <span
                  className={clsx(
                    "flex items-center gap-1",
                    inverted ? "text-text-disabled" : "text-text-disabled"
                  )}
                >
                  <Calendar size={10} />
                  {new Date(production.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={production.status} inverted={inverted} />
          {isSelected && <Check size={16} className="text-primary-500" />}
        </div>
      </div>
    </DropdownItem>
  );
}

// =============================================================================
// CONTEXT SWITCHER COMPONENT
// =============================================================================

export const ContextSwitcher = forwardRef<HTMLDivElement, ContextSwitcherProps>(
  function ContextSwitcher(
    {
      contextLevel,
      currentProduction,
      productions = [],
      onSelectProduction,
      onExitProduction,
      onCreateProduction,
      inverted = true,
      className,
    },
    ref
  ) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter productions by search query
    const filteredProductions = productions.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.venue?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group productions by status
    const activeProductions = filteredProductions.filter(
      (p) => p.status === "active"
    );
    const upcomingProductions = filteredProductions.filter(
      (p) => p.status === "upcoming"
    );
    const draftProductions = filteredProductions.filter(
      (p) => p.status === "draft"
    );
    const pastProductions = filteredProductions.filter(
      (p) => p.status === "past"
    );

    // Platform level trigger
    const platformTrigger = (
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded border-2 cursor-pointer transition-all",
          inverted
            ? "border-border hover:border-border-primary text-text-primary hover:bg-surface-elevated"
            : "border-border hover:border-border-primary text-text-primary hover:bg-muted",
          className
        )}
      >
        <FolderKanban
          size={18}
          className={inverted ? "text-text-muted" : "text-text-muted"}
        />
        <span className="text-sm font-semibold">All Productions</span>
        <ChevronDown
          size={14}
          className={inverted ? "text-text-disabled" : "text-text-disabled"}
        />
      </div>
    );

    // Production level trigger
    const productionTrigger = currentProduction ? (
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded border-2 cursor-pointer transition-all",
          inverted
            ? "border-primary-500/50 bg-primary-500/10 hover:bg-primary-500/20 text-white"
            : "border-primary-500/50 bg-primary-50 hover:bg-primary-100 text-text-primary",
          className
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExitProduction?.();
          }}
          className={clsx(
            "p-1 -ml-1 rounded transition-colors",
            inverted
              ? "hover:bg-surface-elevated text-text-muted hover:text-text-primary"
              : "hover:bg-muted text-text-muted hover:text-text-primary"
          )}
          aria-label="Back to all productions"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate max-w-[180px]">
            {currentProduction.name}
          </span>
          <StatusBadge status={currentProduction.status} inverted={inverted} />
        </div>
        <ChevronDown
          size={14}
          className={inverted ? "text-text-disabled" : "text-text-disabled"}
        />
      </div>
    ) : (
      platformTrigger
    );

    const trigger =
      contextLevel === "production" ? productionTrigger : platformTrigger;

    return (
      <div ref={ref}>
        <Dropdown trigger={trigger} align="left" inverted={inverted}>
          {/* Search */}
          <div className={clsx("p-2 border-b", inverted ? "border-border" : "border-border")}>
            <div
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded border-2",
                inverted
                  ? "bg-surface-inverse border-border"
                  : "bg-surface-primary border-border"
              )}
            >
              <Search
                size={14}
                className={inverted ? "text-text-disabled" : "text-text-disabled"}
              />
              <input
                type="text"
                placeholder="Search productions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  "flex-1 bg-transparent text-sm outline-none",
                  inverted
                    ? "text-text-primary placeholder:text-text-muted"
                    : "text-text-primary placeholder:text-text-muted"
                )}
              />
            </div>
          </div>

          {/* Productions List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Active Productions */}
            {activeProductions.length > 0 && (
              <>
                <div
                  className={clsx(
                    "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  Active
                </div>
                {activeProductions.map((production) => (
                  <ProductionItem
                    key={production.id}
                    production={production}
                    isSelected={currentProduction?.id === production.id}
                    inverted={inverted}
                    onClick={() => onSelectProduction?.(production)}
                  />
                ))}
              </>
            )}

            {/* Upcoming Productions */}
            {upcomingProductions.length > 0 && (
              <>
                <div
                  className={clsx(
                    "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  Upcoming
                </div>
                {upcomingProductions.map((production) => (
                  <ProductionItem
                    key={production.id}
                    production={production}
                    isSelected={currentProduction?.id === production.id}
                    inverted={inverted}
                    onClick={() => onSelectProduction?.(production)}
                  />
                ))}
              </>
            )}

            {/* Draft Productions */}
            {draftProductions.length > 0 && (
              <>
                <div
                  className={clsx(
                    "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  Drafts
                </div>
                {draftProductions.map((production) => (
                  <ProductionItem
                    key={production.id}
                    production={production}
                    isSelected={currentProduction?.id === production.id}
                    inverted={inverted}
                    onClick={() => onSelectProduction?.(production)}
                  />
                ))}
              </>
            )}

            {/* Past Productions */}
            {pastProductions.length > 0 && (
              <>
                <div
                  className={clsx(
                    "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  Past
                </div>
                {pastProductions.map((production) => (
                  <ProductionItem
                    key={production.id}
                    production={production}
                    isSelected={currentProduction?.id === production.id}
                    inverted={inverted}
                    onClick={() => onSelectProduction?.(production)}
                  />
                ))}
              </>
            )}

            {/* Empty State */}
            {filteredProductions.length === 0 && (
              <div
                className={clsx(
                  "px-4 py-8 text-center text-sm",
                  inverted ? "text-text-muted" : "text-text-muted"
                )}
              >
                {searchQuery
                  ? "No productions found"
                  : "No productions available"}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className={clsx(
              "border-t",
              inverted ? "border-border" : "border-border"
            )}
          >
            <DropdownItem inverted={inverted} onClick={onCreateProduction}>
              <span className="flex items-center gap-2 text-primary-500 font-medium">
                <Plus size={16} />
                New Production
              </span>
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    );
  }
);

export default ContextSwitcher;
