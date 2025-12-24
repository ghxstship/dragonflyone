"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Body,
  Button,
  Card,
  CardBody,
  Container,
  EmptyState,
  SectionHeader,
  Spinner,
  Stack,
  StatCard,
} from '@ghxstship/ui';
import { FastForward, Plus, Clock, CheckCircle, Grid } from "lucide-react";
import { useAdvances } from "../../../../hooks/useAdvancing";
import { useProject } from "../../../../hooks/useProjects";

export default function ProductionAdvancingPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  
  const { data: production } = useProject(productionId);
  const { data: advancesData, isLoading, error } = useAdvances({ project_id: productionId });

  const advances = advancesData?.advances || [];
  
  const advanceStats = {
    total: advances.length,
    pending: advances.filter(a => a.status === 'draft' || a.status === 'submitted' || a.status === 'under_review').length,
    approved: advances.filter(a => a.status === 'approved' || a.status === 'in_progress').length,
    fulfilled: advances.filter(a => a.status === 'fulfilled').length,
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    draft: "outline" as "solid", submitted: "warning", under_review: "warning", approved: "info", in_progress: "info", fulfilled: "success", rejected: "error", cancelled: "error",
  };

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text="Loading advances..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState
          title="Failed to Load Advances"
          description={error instanceof Error ? error.message : "An error occurred while loading advances."}
          action={{ label: "Try Again", onClick: () => window.location.reload() }}
        />
      </Container>
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Advancing"
          description="Manage artist advances and rider fulfillment"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/advancing/new`)}>
            <Plus size={16} className="mr-2" />
            New Request
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/advancing/catalog`)}>
            <Grid size={16} className="mr-2" />
            Catalog
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Requests" value={advanceStats.total.toString()} icon={<FastForward size={20} />} />
        <StatCard label="Pending" value={advanceStats.pending.toString()} icon={<Clock size={20} />} trend={advanceStats.pending > 5 ? "down" : "up"} />
        <StatCard label="Approved" value={advanceStats.approved.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Fulfilled" value={advanceStats.fulfilled.toString()} icon={<CheckCircle size={20} />} trend="up" />
      </div>

      {advances.length === 0 ? (
        <EmptyState
          title="No Advances Yet"
          description="Create your first advance request to get started."
          action={{ label: "New Request", onClick: () => router.push(`/p/${productionId}/advancing/new`) }}
        />
      ) : (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={0}>
              {advances.map((advance, index) => (
                <div 
                  key={advance.id} 
                  className={`flex cursor-pointer items-center justify-between border-grey-200 p-4 transition-all hover:bg-grey-50 ${index < advances.length - 1 ? "border-b" : ""}`}
                  onClick={() => router.push(`/p/${productionId}/advancing/${advance.id}`)}
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FastForward size={20} className="text-primary" />
                    <Stack gap={1}>
                      <Body className="font-weight-medium">{advance.activation_name || advance.team_workspace || 'Advance Request'}</Body>
                      <Body size="sm" className="text-grey-500">
                        {advance.submitter?.full_name || 'Unknown'} · {advance.submitted_at ? `Submitted ${new Date(advance.submitted_at).toLocaleDateString()}` : 'Draft'}
                      </Body>
                    </Stack>
                  </Stack>
                  <Badge variant={statusColors[advance.status] || "info"}>{advance.status?.toUpperCase() || 'DRAFT'}</Badge>
                </div>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
