'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FileText, Check, Pen, AlertCircle } from 'lucide-react';

interface ContractSigningData {
  id: string;
  title: string;
  content: string;
  signer_name: string;
  signer_email: string;
  status: 'pending' | 'signed' | 'expired' | 'voided';
  organization: {
    name: string;
    logo_url?: string;
  };
  created_at: string;
}

export default function ContractSigningPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [contract, setContract] = useState<ContractSigningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    async function fetchContract() {
      try {
        const response = await fetch(`/api/contracts/sign/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Contract not found or has expired');
          } else {
            setError('Failed to load contract');
          }
          return;
        }
        const data = await response.json();
        setContract(data);
      } catch (err) {
        setError('Failed to load contract');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchContract();
    }
  }, [token]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSign = async () => {
    if (!signatureData || !agreed) return;
    setSigning(true);
    try {
      const response = await fetch(`/api/contracts/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData }),
      });
      if (response.ok) {
        setContract((prev) => prev ? { ...prev, status: 'signed' } : null);
      }
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="animate-pulse text-ink-500">Loading contract...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-ink-400 mx-auto mb-4" />
          <h1 className="text-h5-md font-weight-semibold text-ink-900 mb-2">Contract Not Found</h1>
          <p className="text-ink-500">{error || 'This signing link may have expired.'}</p>
        </div>
      </div>
    );
  }

  if (contract.status === 'signed') {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-card shadow-sm border-2 border-ink-200 max-w-md">
          <Check className="h-16 w-16 text-success-600 mx-auto mb-4" />
          <h1 className="text-h4-md font-weight-bold text-ink-900 mb-2">Contract Signed</h1>
          <p className="text-ink-500">
            Thank you for signing the contract. A copy has been sent to your email.
          </p>
        </div>
      </div>
    );
  }

  if (contract.status === 'voided' || contract.status === 'expired') {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-card shadow-sm border-2 border-ink-200 max-w-md">
          <AlertCircle className="h-16 w-16 text-error-600 mx-auto mb-4" />
          <h1 className="text-h4-md font-weight-bold text-ink-900 mb-2">Contract Unavailable</h1>
          <p className="text-ink-500">
            This contract has been {contract.status}. Please contact the sender for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-card shadow-sm border-2 border-ink-200 overflow-hidden">
          <div className="p-6 border-b border-ink-200">
            <h1 className="text-h4-md font-weight-bold text-ink-900">{contract.title}</h1>
            <p className="text-body-sm text-ink-500 mt-1">
              From {contract.organization.name}
            </p>
          </div>

          <div className="p-6 border-b border-ink-200">
            <div className="prose prose-ink max-w-none">
              <div
                className="text-ink-600 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </div>
          </div>

          <div className="p-6 bg-ink-100">
            <h2 className="text-h6-md font-weight-semibold text-ink-900 mb-4 flex items-center gap-2">
              <Pen className="h-5 w-5" />
              Your Signature
            </h2>
            <p className="text-body-sm text-ink-500 mb-4">
              Sign below using your mouse or finger (on touch devices)
            </p>
            <div className="border-2 border-dashed border-ink-300 rounded-card p-4 bg-white mb-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={clearSignature}
                className="text-body-sm text-ink-500 hover:text-ink-700"
              >
                Clear signature
              </button>
              <p className="text-body-sm text-ink-500">
                Signing as: <strong>{contract.signer_name}</strong>
              </p>
            </div>
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5"
              />
              <span className="text-body-sm text-ink-600">
                I agree to the terms of this contract and acknowledge that my electronic signature
                has the same legal effect as a handwritten signature.
              </span>
            </label>
            <button
              onClick={handleSign}
              disabled={!signatureData || !agreed || signing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-button hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-5 w-5" />
              {signing ? 'Signing...' : 'Sign Contract'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
