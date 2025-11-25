"use client";

import React, { useState, useMemo } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
  available: colors.white,
  selected: colors.black,
  sold: colors.grey400,
  reserved: colors.grey300,
  accessible: colors.grey700,
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
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stage */}
      {showStage && (
        <div
          style={{
            width: "100%",
            padding: `${1 * zoom}rem ${2 * zoom}rem`,
            backgroundColor: colors.grey900,
            color: colors.white,
            fontFamily: typography.heading,
            fontSize: `calc(${fontSizes.h4MD} * ${zoom})`,
            textAlign: "center",
            letterSpacing: letterSpacing.mega,
            textTransform: "uppercase",
          }}
        >
          {stageLabel}
        </div>
      )}

      {/* Seating Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: `${1.5 * zoom}rem`,
          padding: `${1 * zoom}rem`,
          overflow: "auto",
        }}
      >
        {sections.map((section) => {
          const sectionSeats = seatsBySection[section.id];
          if (!sectionSeats) return null;

          const rows = Object.keys(sectionSeats).sort();

          return (
            <div
              key={section.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: `${0.5 * zoom}rem`,
              }}
            >
              {/* Section Label */}
              <div
                style={{
                  fontFamily: typography.mono,
                  fontSize: `calc(${fontSizes.monoSM} * ${zoom})`,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.widest,
                  textTransform: "uppercase",
                  marginBottom: `${0.5 * zoom}rem`,
                }}
              >
                {section.name}
              </div>

              {/* Rows */}
              {rows.map((row) => (
                <div
                  key={row}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: `${seatGap}px`,
                  }}
                >
                  {/* Row Label */}
                  <span
                    style={{
                      width: `${seatSize}px`,
                      fontFamily: typography.mono,
                      fontSize: `calc(${fontSizes.monoXS} * ${zoom})`,
                      color: colors.grey500,
                      textAlign: "right",
                      paddingRight: `${4 * zoom}px`,
                    }}
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
                        style={{
                          width: `${seatSize}px`,
                          height: `${seatSize}px`,
                          backgroundColor: statusColors[status],
                          border: `${borderWidths.medium} solid ${
                            status === "selected" ? colors.black : colors.grey400
                          }`,
                          borderRadius: "2px",
                          cursor: isClickable ? "pointer" : "not-allowed",
                          transition: transitions.fast,
                          transform: isHovered && isClickable ? "scale(1.15)" : "scale(1)",
                          position: "relative",
                          padding: 0,
                        }}
                        aria-label={`Row ${seat.row}, Seat ${seat.number}, ${statusLabels[status]}`}
                      >
                        {status === "accessible" && (
                          <span
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: colors.white,
                              fontSize: `${10 * zoom}px`,
                            }}
                          >
                            ♿
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Row Label (right side) */}
                  <span
                    style={{
                      width: `${seatSize}px`,
                      fontFamily: typography.mono,
                      fontSize: `calc(${fontSizes.monoXS} * ${zoom})`,
                      color: colors.grey500,
                      textAlign: "left",
                      paddingLeft: `${4 * zoom}px`,
                    }}
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
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: colors.black,
            color: colors.white,
            padding: "0.75rem 1.25rem",
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            letterSpacing: letterSpacing.wide,
            display: "flex",
            gap: "1.5rem",
            zIndex: 100,
          }}
        >
          <span>
            ROW {hoveredSeat.row} / SEAT {hoveredSeat.number}
          </span>
          {hoveredSeat.price && (
            <span>
              ${hoveredSeat.price.toFixed(2)}
            </span>
          )}
          {hoveredSeat.priceCategory && (
            <span style={{ color: colors.grey400 }}>
              {hoveredSeat.priceCategory}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            padding: "1rem",
            borderTop: `1px solid ${colors.grey200}`,
          }}
        >
          {(Object.keys(statusColors) as Array<keyof typeof statusColors>).map((status) => (
            <div
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: statusColors[status],
                  border: `${borderWidths.medium} solid ${
                    status === "selected" ? colors.black : colors.grey400
                  }`,
                  borderRadius: "2px",
                }}
              />
              <span
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoXS,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                }}
              >
                {statusLabels[status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            backgroundColor: colors.grey100,
            border: `${borderWidths.medium} solid ${colors.black}`,
          }}
        >
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey700,
              letterSpacing: letterSpacing.wide,
            }}
          >
            {selectedSeats.length} SEAT{selectedSeats.length !== 1 ? "S" : ""} SELECTED
            {maxSelection && ` (MAX ${maxSelection})`}
          </div>
          <div
            style={{
              fontFamily: typography.heading,
              fontSize: fontSizes.h5MD,
              color: colors.black,
            }}
          >
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
