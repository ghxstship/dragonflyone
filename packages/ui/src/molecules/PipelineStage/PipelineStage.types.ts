/**
 * PipelineStage component props
 */
export interface PipelineStageProps {
  id: string;
  name: string;
  color: string;
  probability: number;
  dealCount: number;
  totalValue: number;
  weightedValue: number;
  children?: React.ReactNode;
  onAddDeal?: () => void;
  onSettings?: () => void;
  isDropTarget?: boolean;
  inverted?: boolean;
  className?: string;
}
