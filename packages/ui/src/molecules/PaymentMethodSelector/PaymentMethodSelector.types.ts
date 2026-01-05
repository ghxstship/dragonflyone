/**
 * Payment method type
 */
export type PaymentMethodType = "card" | "bank" | "wallet";

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault?: boolean;
}

/**
 * PaymentMethodSelector component props
 */
export interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethodId?: string | null;
  onSelect: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
  onDelete?: (methodId: string) => void;
  onAddNew?: () => void;
  allowAddNew?: boolean;
  showActions?: boolean;
  inverted?: boolean;
  className?: string;
}
