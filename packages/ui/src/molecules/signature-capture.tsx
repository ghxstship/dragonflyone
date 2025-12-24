"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check, X, Pen } from "lucide-react";
import clsx from "clsx";

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
  className?: string;
}

export interface SignatureData {
  dataUrl: string;
  timestamp: string;
  signerName?: string;
  signerTitle?: string;
}

export function SignatureCapture({
  onSave,
  onCancel,
  signerName,
  signerTitle,
  documentTitle,
  width = 500,
  height = 200,
  strokeColor = "#000000",
  strokeWidth = 2,
  className,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [strokeColor, strokeWidth]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave({
      dataUrl,
      timestamp: new Date().toISOString(),
      signerName,
      signerTitle,
    });
  };

  return (
    <div className={clsx("bg-background border-2 border-border rounded-card", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-body-md font-weight-semibold">Electronic Signature</h3>
        {documentTitle && (
          <p className="text-body-sm text-muted-foreground mt-1">
            Signing: {documentTitle}
          </p>
        )}
      </div>

      {/* Signer Info */}
      {(signerName || signerTitle) && (
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          {signerName && (
            <p className="text-body-sm">
              <span className="text-muted-foreground">Name:</span> {signerName}
            </p>
          )}
          {signerTitle && (
            <p className="text-body-sm">
              <span className="text-muted-foreground">Title:</span> {signerTitle}
            </p>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="p-4">
        <div className="relative border-2 border-border rounded-card overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <Pen className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-body-sm">Sign here</p>
              </div>
            </div>
          )}

          {/* Signature Line */}
          <div className="absolute bottom-4 left-8 right-8 border-b-2 border-muted-foreground/30" />
        </div>

        {/* Clear Button */}
        <button
          onClick={clearSignature}
          disabled={!hasSignature}
          className="mt-2 flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Eraser className="h-4 w-4" />
          Clear Signature
        </button>
      </div>

      {/* Agreement */}
      <div className="px-4 pb-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-body-sm text-muted-foreground">
            I agree that my electronic signature is the legal equivalent of my manual signature on this document.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-4 border-t border-border bg-muted/30">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-border rounded-button text-body-sm hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!hasSignature || !agreedToTerms}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          Apply Signature
        </button>
      </div>

      {/* Legal Notice */}
      <div className="px-4 pb-4">
        <p className="text-body-xs text-muted-foreground text-center">
          By signing, you acknowledge that you have read and agree to the terms of this document.
          Your signature will be timestamped and recorded for legal purposes.
        </p>
      </div>
    </div>
  );
}

export default SignatureCapture;
