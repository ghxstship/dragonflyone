'use client';

import { useQuery } from '@tanstack/react-query';

export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  value: number;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  assignedTo?: string;
}

const DEMO_ASSETS: Asset[] = [
  { id: 'A-001', name: 'LED Wall Panel Set (20)', category: 'Video', serialNumber: 'LED-2024-001', value: 45000, status: 'in-use', location: 'Main Stage', assignedTo: 'Video Team' },
  { id: 'A-002', name: 'Moving Head Fixtures (24)', category: 'Lighting', serialNumber: 'MH-2024-012', value: 72000, status: 'in-use', location: 'Main Stage', assignedTo: 'Lighting Team' },
  { id: 'A-003', name: 'Line Array System', category: 'Audio', serialNumber: 'LA-2024-005', value: 125000, status: 'in-use', location: 'FOH', assignedTo: 'Audio Team' },
  { id: 'A-004', name: 'Stage Deck (100 sections)', category: 'Staging', serialNumber: 'SD-2024-008', value: 35000, status: 'available', location: 'Warehouse' },
  { id: 'A-005', name: 'Truss System', category: 'Rigging', serialNumber: 'TR-2024-003', value: 28000, status: 'maintenance', location: 'Shop' },
];

export const productionAssetsKeys = {
  all: ['production-assets'] as const,
  list: (productionId: string) => [...productionAssetsKeys.all, 'list', productionId] as const,
};

export function useProductionAssetsList(productionId?: string) {
  return useQuery({
    queryKey: productionAssetsKeys.list(productionId || ''),
    queryFn: async () => {
      if (!productionId) return DEMO_ASSETS;
      const response = await fetch(`/api/productions/${productionId}/assets`);
      if (response.status === 401) {
        return DEMO_ASSETS;
      }
      if (!response.ok) {
        return DEMO_ASSETS;
      }
      const data = await response.json();
      return data.assets?.length > 0 ? data.assets : DEMO_ASSETS;
    },
    enabled: !!productionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductionAssetsData(productionId?: string) {
  const assetsQuery = useProductionAssetsList(productionId);
  const assets = assetsQuery.data || DEMO_ASSETS;

  const totalValue = assets.reduce((sum: number, a: Asset) => sum + a.value, 0);
  const inUseCount = assets.filter((a: Asset) => a.status === 'in-use').length;
  const maintenanceCount = assets.filter((a: Asset) => a.status === 'maintenance').length;

  return {
    assets,
    totalValue,
    inUseCount,
    maintenanceCount,
    isLoading: assetsQuery.isLoading,
    error: assetsQuery.error,
    refetch: assetsQuery.refetch,
  };
}
