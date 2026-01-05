/**
 * Signature data
 */
export interface SignatureData {
  dataUrl: string;
  timestamp: string;
  signerName?: string;
  signerTitle?: string;
}

/**
 * SignatureCapture component props
 */
export interface SignatureCaptureProps {
  onSave: (signature: SignatureData) => void;
  onCancel?: () => void;
  signerName?: string;
  signerTitle?: string;
  documentTitle?: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  inverted?: boolean;
  className?: string;
}
