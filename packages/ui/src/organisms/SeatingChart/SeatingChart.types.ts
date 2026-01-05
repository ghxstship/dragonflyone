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
