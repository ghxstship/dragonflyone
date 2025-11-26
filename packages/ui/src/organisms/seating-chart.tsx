"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  status: "available" | "selected" | "sold" | "reserved" | "accessible";
  price?: number;
  priceCategory?: string;
}

export interface Section {
  id: string;
  name: string;
  color?: string;
}

export interface SeatingChartProps {
  /** Seats data */
  seats: Seat[];
  /** Sections data */
  sections: Section[];
  /** Selected seat IDs */
  selectedSeats?: string[];
  /** Maximum seats that can be selected */
  maxSelection?: number;
  /** Selection change handler */
  onSelectionChange?: (seatIds: string[]) => void;
  /** Seat click handler */
  onSeatClick?: (seat: Seat) => void;
  /** Show legend */
  showLegend?: boolean;
  /** Show stage indicator */
  showStage?: boolean;
  /** Stage label */
  stageLabel?: string;
  /** Zoom level (0.5 - 2) */
  zoom?: number;
  /** Custom className */
  className?: string;
}

const statusColors = {
  available: "#FFFFFF",
  selected: "#000000",
  sold: "#9CA3AF",
  reserved: "#D1D5DB",
  accessible: "#374151",
};

const statusLabels = {
  available: "Available",
  selected: "Selected",
  sold: "Sold",
  reserved: "Reserved",
  accessible: "Accessible",
};

export function SeatingChart({
  seats,
  sections,
  selectedSeats = [],
  maxSelection = 10,
  onSelectionChange,
  onSeatClick,
  showLegend = true,
  showStage = true,
  stageLabel = "STAGE",
  zoom = 1,
  className = "",
}: SeatingChartProps) {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Group seats by section and row
  const seatsBySection = useMemo(() => {
    const grouped: Record<string, Record<string, Seat[]>> = {};
    
    seats.forEach((seat) => {
      if (!grouped[seat.section]) {
        grouped[seat.section] = {};
      }
      if (!grouped[seat.section][seat.row]) {
        grouped[seat.section][seat.row] = [];
      }
      grouped[seat.section][seat.row].push(seat);
    });

    // Sort seats within each row by number
    Object.keys(grouped).forEach((section) => {
      Object.keys(grouped[section]).forEach((row) => {
        grouped[section][row].sort((a, b) => a.number - b.number);
      });
    });

    return grouped;
  }, [seats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "sold" || seat.status === "reserved") return;

    onSeatClick?.(seat);

    if (!onSelectionChange) return;

    const isSelected = selectedSeats.includes(seat.id);
    
    if (isSelected) {
      onSelectionChange(selectedSeats.filter((id) => id !== seat.id));
    } else if (selectedSeats.length < maxSelection) {
      onSelectionChange([...selectedSeats, seat.id]);
    }
  };

  const getSeatStatus = (seat: Seat): Seat["status"] => {
    if (selectedSeats.includes(seat.id)) return "selected";
    return seat.status;
  };

  const seatSize = 24 * zoom;
  const seatGap = 4 * zoom;

  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      {/* Stage */}
      {showStage && (
        <div
          className="w-full bg-grey-900 text-white font-heading text-center tracking-mega uppercase"
          style={{ padding: `${1 * zoom}rem ${2 * zoom}rem`, fontSize: `calc(1.125rem * ${zoom})` }}
        >
          {stageLabel}
        </div>
      )}

      {/* Seating Area */}
      <div
        className="flex flex-col items-center overflow-auto"
        style={{ gap: `${1.5 * zoom}rem`, padding: `${1 * zoom}rem` }}
      >
        {sections.map((section) => {
          const sectionSeats = seatsBySection[section.id];
          if (!sectionSeats) return null;

          const rows = Object.keys(sectionSeats).sort();

          return (
            <div
              key={section.id}
              className="flex flex-col items-center"
              style={{ gap: `${0.5 * zoom}rem` }}
            >
              {/* Section Label */}
              <div
                className="font-code text-grey-600 tracking-widest uppercase"
                style={{ fontSize: `calc(0.75rem * ${zoom})`, marginBottom: `${0.5 * zoom}rem` }}
              >
                {section.name}
              </div>

              {/* Rows */}
              {rows.map((row) => (
                <div
                  key={row}
                  className="flex items-center"
                  style={{ gap: `${seatGap}px` }}
                >
                  {/* Row Label */}
                  <span
                    className="font-code text-grey-500 text-right"
                    style={{ width: `${seatSize}px`, fontSize: `calc(0.625rem * ${zoom})`, paddingRight: `${4 * zoom}px` }}
                  >
                    {row}
                  </span>

                  {/* Seats */}
                  {sectionSeats[row].map((seat) => {
                    const status = getSeatStatus(seat);
                    const isClickable = status === "available" || status === "selected" || status === "accessible";
                    const isHovered = hoveredSeat?.id === seat.id;

                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={!isClickable}
                        className="relative p-0 rounded-sm transition-transform duration-fast"
                        style={{
                          width: `${seatSize}px`,
                          height: `${seatSize}px`,
                          backgroundColor: statusColors[status],
                          border: `2px solid ${status === "selected" ? "#000000" : "#9CA3AF"}`,
                          cursor: isClickable ? "pointer" : "not-allowed",
                          transform: isHovered && isClickable ? "scale(1.15)" : "scale(1)",
                        }}
                        aria-label={`Row ${seat.row}, Seat ${seat.number}, ${statusLabels[status]}`}
                      >
                        {status === "accessible" && (
                          <span
                            className="absolute inset-0 flex items-center justify-center text-white"
                            style={{ fontSize: `${10 * zoom}px` }}
                          >
                            ♿
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Row Label (right side) */}
                  <span
                    className="font-code text-grey-500 text-left"
                    style={{ width: `${seatSize}px`, fontSize: `calc(0.625rem * ${zoom})`, paddingLeft: `${4 * zoom}px` }}
                  >
                    {row}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hovered Seat Info */}
      {hoveredSeat && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 font-code text-mono-sm tracking-wide flex gap-6 z-tooltip">
          <span>
            ROW {hoveredSeat.row} / SEAT {hoveredSeat.number}
          </span>
          {hoveredSeat.price && (
            <span>
              ${hoveredSeat.price.toFixed(2)}
            </span>
          )}
          {hoveredSeat.priceCategory && (
            <span className="text-grey-400">
              {hoveredSeat.priceCategory}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-6 flex-wrap p-4 border-t border-grey-200">
          {(Object.keys(statusColors) as Array<keyof typeof statusColors>).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: statusColors[status],
                  border: `2px solid ${status === "selected" ? "#000000" : "#9CA3AF"}`,
                }}
              />
              <span className="font-code text-mono-xs text-grey-600 tracking-wide uppercase">
                {statusLabels[status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="flex justify-between items-center px-5 py-4 bg-grey-100 border-2 border-black">
          <div className="font-code text-mono-sm text-grey-700 tracking-wide">
            {selectedSeats.length} SEAT{selectedSeats.length !== 1 ? "S" : ""} SELECTED
            {maxSelection && ` (MAX ${maxSelection})`}
          </div>
          <div className="font-heading text-h5-md text-black">
            $
            {seats
              .filter((s) => selectedSeats.includes(s.id))
              .reduce((sum, s) => sum + (s.price || 0), 0)
              .toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatingChart;
