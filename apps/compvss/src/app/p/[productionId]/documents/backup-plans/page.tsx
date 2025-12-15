"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid, Spinner, Alert, Button, Badge } from "@ghxstship/ui";
import { Shield, CheckCircle, AlertTriangle, Clock, Plus } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../../lib/supabase";

interface BackupPlan {
  id: string;
  name: string;
  category: string;
  status: 'tested' | 'pending' | 'draft';
  last_tested_at: string | null;
  priority: 'high' | 'medium' | 'low';
}

export default function BackupPlansPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading: loadingProduction } = useProject(productionId);
  
  const { data: backupPlans, isLoading: loadingPlans, error } = useQuery({
    queryKey: ['backup_plans', productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_documents')
        .select('*')
        .eq('production_id', productionId)
        .eq('document_type', 'backup_plan')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as BackupPlan[];
    },
    enabled: !!productionId,
  });

  const isLoading = loadingProduction || loadingPlans;

  if (isLoading) {
    return (
      <Stack gap={4} className="items-center justify-center py-12">
        <Spinner size="lg" />
        <Body>Loading backup plans...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={4}>
        <Alert variant="error">Failed to load backup plans. Please try again.</Alert>
      </Stack>
    );
  }

  const plans = backupPlans || [];
  const testedPlans = plans.filter(p => p.status === 'tested');
  const lastTested = testedPlans.length > 0 && testedPlans[0].last_tested_at
    ? new Date(testedPlans[0].last_tested_at).toLocaleDateString()
    : 'Never';

  const stats = {
    total: plans.length,
    tested: testedPlans.length,
    pending: plans.filter(p => p.status === 'pending').length,
    lastTest: lastTested,
  };

  return (
    <Stack gap={8}>
      <Stack direction="horizontal" className="items-start justify-between">
        <SectionHeader kicker={production?.name || 'Production'} title="Backup Plans" description="Contingency and emergency procedures" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New Plan</Button>
      </Stack>
      <Grid cols={4} gap={4}>
        <StatCard label="Total Plans" value={stats.total.toString()} icon={<Shield size={20} />} />
        <StatCard label="Tested" value={stats.tested.toString()} icon={<CheckCircle size={20} />} />
        <StatCard label="Pending Test" value={stats.pending.toString()} icon={<AlertTriangle size={20} />} />
        <StatCard label="Last Test" value={stats.lastTest} icon={<Clock size={20} />} />
      </Grid>
      {plans.length === 0 ? (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4} className="items-center py-8">
              <Shield size={48} className="text-grey-400" />
              <H3>No Backup Plans Yet</H3>
              <Body className="text-grey-500">Create contingency plans for your production.</Body>
              <Button variant="solid"><Plus size={16} className="mr-2" />Create Plan</Button>
            </Stack>
          </CardBody>
        </Card>
      ) : (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Backup Plan Library</H3>
              {plans.map((plan) => (
                <Stack key={plan.id} direction="horizontal" gap={4} className="items-center justify-between border-b border-grey-100 pb-4 last:border-0">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Shield size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="font-weight-semibold">{plan.name}</Body>
                      <Body size="sm" className="text-grey-500">{plan.category}</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant={plan.priority === 'high' ? 'error' : plan.priority === 'medium' ? 'warning' : 'ghost'}>
                      {plan.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={plan.status === 'tested' ? 'success' : plan.status === 'pending' ? 'warning' : 'ghost'}>
                      {plan.status.toUpperCase()}
                    </Badge>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
