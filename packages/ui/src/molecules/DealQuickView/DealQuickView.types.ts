/**
 * Deal assignee information
 */
export interface DealAssignee {
  full_name: string;
  email?: string;
}

/**
 * Deal stage information
 */
export interface DealStage {
  name: string;
  color: string;
}

/**
 * Deal information for quick view
 */
export interface DealInfo {
  id: string;
  deal_number: string;
  name: string;
  value: number;
  probability: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  expected_close_date?: string;
  assignee?: DealAssignee;
  stage?: DealStage;
  notes?: string;
  source?: string;
  created_at: string;
}

/**
 * DealQuickView component props
 */
export interface DealQuickViewProps {
  deal: DealInfo;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveStage?: () => void;
  inverted?: boolean;
  className?: string;
}
