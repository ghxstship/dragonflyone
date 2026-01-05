"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check, X } from "lucide-react";
import { 
  signatureCaptureVariants,
  signatureCaptureHeaderVariants,
  signatureCaptureTitleVariants,
  signatureCaptureDocumentInfoVariants,
  signatureCaptureSignerInfoVariants,
  signatureCaptureCanvasContainerVariants,
  signatureCaptureCanvasVariants,
  signatureCaptureControlsContainerVariants,
  signatureCaptureActionsContainerVariants,
  signatureCaptureButtonVariants,
  signatureCaptureCheckboxContainerVariants,
  signatureCaptureCheckboxLabelVariants 
} from "./SignatureCapture.variants.js";
import type { 
  SignatureCaptureProps,
  SignatureData 
} from "./SignatureCapture.types.js";

/**
 * SignatureCapture component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Signature capture with canvas and controls
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <SignatureCapture
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 *   signerName="John Doe"
 *   documentTitle="Contract Agreement"
 *   inverted={false}
 * />
 * ```
 */
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
  inverted = false,
  className,
}: SignatureCaptureProps) {
  // State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
  }, [width, height, strokeColor, strokeWidth]);

  // Handle mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Handle touch events
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
  };

  // Save signature
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const timestamp = new Date().toISOString();

    const signatureData: SignatureData = {
      dataUrl,
      timestamp,
      signerName,
      signerTitle,
    };

    onSave(signatureData);
  };

  // Check if save is enabled
  const canSave = hasSignature && agreedToTerms;

  return (
    <div className={signatureCaptureVariants({ inverted, className })}>
      {/* Header */}
      <div className={signatureCaptureHeaderVariants({ inverted })}>
        <h3 className={signatureCaptureTitleVariants({ inverted })}>
          Digital Signature
        </h3>
        
        {documentTitle && (
          <p className={signatureCaptureDocumentInfoVariants({ inverted })}>
            Document: {documentTitle}
          </p>
        )}
        
        {(signerName || signerTitle) && (
          <div className={signatureCaptureSignerInfoVariants({ inverted })}>
            {signerName && <span>{signerName}</span>}
            {signerTitle && <span> • {signerTitle}</span>}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className={signatureCaptureCanvasContainerVariants({ inverted })}>
        <canvas
          ref={canvasRef}
          className={signatureCaptureCanvasVariants({ inverted })}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startTouchDrawing}
          onTouchMove={touchDraw}
          onTouchEnd={stopDrawing}
          style={{ width, height }}
        />
      </div>

      {/* Controls */}
      <div className={signatureCaptureControlsContainerVariants({ inverted })}>
        <div className={signatureCaptureActionsContainerVariants({ inverted })}>
          {/* Clear Button */}
          <button
            onClick={clearSignature}
            className={signatureCaptureButtonVariants({ 
              variant: "secondary", 
              inverted 
            })}
          >
            <Eraser className="w-4 h-4" />
            Clear
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Cancel */}
            {onCancel && (
              <button
                onClick={onCancel}
                className={signatureCaptureButtonVariants({ 
                  variant: "danger", 
                  inverted 
                })}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}

            {/* Save */}
            <button
              onClick={saveSignature}
              disabled={!canSave}
              className={signatureCaptureButtonVariants({ 
                variant: "primary", 
                disabled: !canSave, 
                inverted 
              })}
            >
              <Check className="w-4 h-4" />
              Save Signature
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className={signatureCaptureCheckboxContainerVariants({ inverted })}>
          <input
            type="checkbox"
            id="signature-terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 border-2 border-border rounded focus:ring-2 focus:ring-brand-primary"
          />
          <label 
            htmlFor="signature-terms" 
            className={signatureCaptureCheckboxLabelVariants({ inverted })}
          >
            I agree that this signature is legally binding and equivalent to a handwritten signature.
          </label>
        </div>
      </div>
    </div>
  );
}
