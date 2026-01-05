export interface ProductionContext {
  id: string;
  name: string;
  status: "active" | "upcoming" | "past" | "draft";
  startDate?: string;
  endDate?: string;
  venue?: string;
}

export interface ContextSwitcherProps {
  /** Current context level */
  contextLevel: "platform" | "production";
  /** Current production (if in production context) */
  currentProduction?: ProductionContext;
  /** Available productions to switch to */
  productions?: ProductionContext[];
  /** Callback when switching to a production */
  onSelectProduction?: (production: ProductionContext) => void;
  /** Callback when returning to platform level */
  onExitProduction?: () => void;
  /** Callback to create new production */
  onCreateProduction?: () => void;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}
