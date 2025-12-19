"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid, Badge, Spinner, Alert, Button } from "@ghxstship/ui";
import { BookOpen, CheckCircle, Clock, Plus, FileText } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useSOPs, useSOPStats } from "../../../../../hooks/useSOPs";

export default function SOPsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading: loadingProduction } = useProject(productionId);
  const { data: sops, isLoading: loadingSOPs, error } = useSOPs({ productionId });
  const { data: stats } = useSOPStats(productionId);

  const isLoading = loadingProduction || loadingSOPs;

  if (isLoading) {
    return (
      <Stack gap={4} className="items-center justify-center py-12">
        <Spinner size="lg" />
        <Body>Loading SOPs...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={4}>
        <Alert variant="error">Failed to load SOPs. Please try again.</Alert>
      </Stack>
    );
  }

  const sopList = sops || [];
  const sopStats = stats || { total: 0, approved: 0, review: 0, draft: 0 };

  return (
    <Stack gap={8}>
      <Stack direction="horizontal" className="items-start justify-between">
        <SectionHeader kicker={production?.name || 'Production'} title="Standard Operating Procedures" description="SOPs and operational guidelines" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New SOP</Button>
      </Stack>
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total SOPs" value={sopStats.total.toString()} icon={<BookOpen size={20} />} />
        <StatCard label="Approved" value={sopStats.approved.toString()} icon={<CheckCircle size={20} />} />
        <StatCard label="Under Review" value={sopStats.review.toString()} icon={<Clock size={20} />} />
        <StatCard label="Draft" value={sopStats.draft.toString()} icon={<FileText size={20} />} />
      </Grid>
      {sopList.length === 0 ? (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4} className="items-center py-8">
              <BookOpen size={48} className="text-grey-400" />
              <H3>No SOPs Yet</H3>
              <Body className="text-grey-500">Create your first Standard Operating Procedure to get started.</Body>
              <Button variant="solid"><Plus size={16} className="mr-2" />Create SOP</Button>
            </Stack>
          </CardBody>
        </Card>
      ) : (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>SOP Library</H3>
              {sopList.map((sop) => (
                <Stack key={sop.id} direction="horizontal" gap={4} className="items-center justify-between border-b border-grey-100 pb-4 last:border-0">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <BookOpen size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="font-weight-semibold">{sop.title}</Body>
                      <Body size="sm" className="text-grey-500">Version {sop.version}</Body>
                    </Stack>
                  </Stack>
                  <Badge variant={sop.status === 'approved' ? 'success' : sop.status === 'review' ? 'warning' : 'ghost'}>
                    {sop.status.toUpperCase()}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
