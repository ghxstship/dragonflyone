/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * Organization information
 */
export interface InvoiceOrganization {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

/**
 * Client information
 */
export interface InvoiceClient {
  name: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
}

/**
 * Invoice data
 */
export interface InvoiceData {
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  service_charge_rate?: number;
  service_charge_amount?: number;
  discount_amount?: number;
  total_amount: number;
  amount_paid?: number;
  balance_due?: number;
  notes?: string;
  terms?: string;
}

/**
 * InvoicePreview component props
 */
export interface InvoicePreviewProps {
  invoice: InvoiceData;
  organization: InvoiceOrganization;
  client: InvoiceClient;
  inverted?: boolean;
  className?: string;
}
