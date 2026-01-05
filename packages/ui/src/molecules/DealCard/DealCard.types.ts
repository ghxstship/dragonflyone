/**
 * DealCard component props
 */
export interface DealCardProps {
  id: string;
  dealNumber: string;
  name: string;
  value: number;
  probability: number;
  contactName?: string;
  expectedCloseDate?: string;
  assigneeName?: string;
  stageName?: string;
  stageColor?: string;
  onClick?: () => void;
  onQuickView?: () => void;
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}
