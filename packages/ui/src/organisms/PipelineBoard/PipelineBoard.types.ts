export interface PipelineDeal {
  id: string;
  deal_number: string;
  name: string;
  value: number;
  probability: number;
  contact_name?: string;
  expected_close_date?: string;
  assignee?: { full_name: string };
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  order_index: number;
  deals: PipelineDeal[];
}

export interface PipelineBoardProps {
  stages: PipelineStage[];
  onDealMove: (dealId: string, fromStage: string, toStage: string) => void;
  onDealClick?: (deal: PipelineDeal) => void;
  onAddDeal?: (stageId: string) => void;
  onStageSettings?: (stageId: string) => void;
  isLoading?: boolean;
}
