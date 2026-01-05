/**
 * Refund data
 */
export interface RefundData {
  paymentId: string;
  amount: number;
  reason: string;
  notes?: string;
}

/**
 * Refund reason option
 */
export interface RefundReasonOption {
  value: string;
  label: string;
}

/**
 * RefundDialog component props
 */
export interface RefundDialogProps {
  /** Whether the dialog is open (standardized prop name) */
  open: boolean;
  /** @deprecated Use `open` instead */
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: (refundData: RefundData) => Promise<void>;
  paymentId: string;
  originalAmount: number;
  amountPaid: number;
  currency?: string;
  customerName?: string;
  transactionDate?: string;
  /** @deprecated Use `loading` instead */
  isProcessing?: boolean;
  /** Loading/processing state (standardized prop name) */
  loading?: boolean;
  error?: string | null;
  inverted?: boolean;
  className?: string;
}
