import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ScannedAsset {
  id: string;
  barcode: string;
  name: string;
  category: string;
  status: 'available' | 'checked_out' | 'maintenance' | 'retired';
  location: string;
  last_scan: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  serial_number?: string;
}

export interface ScanHistory {
  id: string;
  barcode: string;
  asset_name: string;
  action: 'check_in' | 'check_out' | 'inventory' | 'transfer';
  scanned_by: string;
  timestamp: string;
  location: string;
}

export interface ScanAssetParams {
  barcode: string;
  action: 'check_in' | 'check_out' | 'inventory' | 'transfer';
  location?: string;
  notes?: string;
}

const API_BASE = '/api/assets/scan';

async function fetchAssetByBarcode(barcode: string): Promise<ScannedAsset> {
  const response = await fetch(`${API_BASE}?barcode=${encodeURIComponent(barcode)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset');
  }
  const data = await response.json();
  return data.asset;
}

async function fetchScanHistory(): Promise<ScanHistory[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch scan history');
  }
  const data = await response.json();
  return data.data || [];
}

async function recordScan(params: ScanAssetParams): Promise<ScanHistory> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('supabase-auth-token') : null;
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record scan');
  }
  const data = await response.json();
  return data.scan;
}

export function useAssetLookup(barcode: string | null) {
  return useQuery({
    queryKey: ['asset-lookup', barcode],
    queryFn: () => fetchAssetByBarcode(barcode!),
    enabled: !!barcode && barcode.trim().length > 0,
    retry: false,
    staleTime: 0,
  });
}

export function useScanHistory() {
  return useQuery({
    queryKey: ['scan-history'],
    queryFn: fetchScanHistory,
    staleTime: 30000, // 30 seconds
  });
}

export function useRecordScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
    },
  });
}

export function useAssetScan() {
  const scanHistoryQuery = useScanHistory();
  const recordScanMutation = useRecordScan();

  return {
    scanHistory: scanHistoryQuery.data || [],
    isLoadingHistory: scanHistoryQuery.isLoading,
    historyError: scanHistoryQuery.error,
    recordScan: recordScanMutation.mutate,
    recordScanAsync: recordScanMutation.mutateAsync,
    isRecording: recordScanMutation.isPending,
    recordError: recordScanMutation.error,
    refetchHistory: scanHistoryQuery.refetch,
  };
}
