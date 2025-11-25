'use client';

import { useState } from 'react';

interface CrewRequirement {
  role: string;
  count: number;
  skills?: string[];
}

interface EquipmentRequirement {
  type: string;
  quantity: number;
}

interface AllocationResult {
  success: boolean;
  conflicts: Array<{
    type: string;
    role?: string;
    equipment_type?: string;
    required: number;
    available: number;
  }>;
  allocations: Array<{
    resource_type: string;
    resource_id: string;
    resource_name: string;
    role?: string;
    equipment_type?: string;
  }>;
  auto_assigned: boolean;
  message: string;
}

export function useResourceAllocation() {
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocateResources = async (
    projectId: string,
    startDate: string,
    endDate: string,
    crewRequirements: CrewRequirement[],
    equipmentRequirements: EquipmentRequirement[],
    autoAssign: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/resources/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          start_date: startDate,
          end_date: endDate,
          crew_requirements: crewRequirements,
          equipment_requirements: equipmentRequirements,
          auto_assign: autoAssign,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        return data;
      } else {
        setError(data.error || 'Failed to allocate resources');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    result,
    loading,
    error,
    allocateResources,
  };
}
