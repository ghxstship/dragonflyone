/**
 * Payment form data
 */
export interface PaymentFormData {
  paymentMethodId?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  saveCard?: boolean;
}

/**
 * Saved payment method
 */
export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

/**
 * PaymentForm component props
 */
export interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
  onCancel?: () => void;
  isProcessing?: boolean;
  error?: string | null;
  savedMethods?: SavedPaymentMethod[];
  allowSaveCard?: boolean;
  inverted?: boolean;
  className?: string;
}
