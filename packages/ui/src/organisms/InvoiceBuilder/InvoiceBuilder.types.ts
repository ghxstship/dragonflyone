export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category?: string;
  taxable?: boolean;
}

export interface InvoiceBuilderProps {
  lineItems: InvoiceLineItem[];
  onChange: (items: InvoiceLineItem[]) => void;
  taxRate?: number;
  serviceChargeRate?: number;
  discountAmount?: number;
  onTaxRateChange?: (rate: number) => void;
  onServiceChargeChange?: (rate: number) => void;
  onDiscountChange?: (amount: number) => void;
  currency?: string;
  readonly?: boolean;
  className?: string;
}
