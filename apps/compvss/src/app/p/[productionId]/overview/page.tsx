"use client";

import { useParams, useRouter } from "next/navigation";
import {
  DetailPage, Badge, Body, Button, Card, CardBody, EmptyState, H3, Label, Spinner, Stack, StatCard, Box, Grid} from '@ghxstship/ui';
import {
  Calendar, Users, Clock, CheckCircle, AlertTriangle, MapPin, Package, Shield, Radio, Truck} from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";
import { useCrew } from "../../../../hooks/useCrew";
import { useEquipment } from "../../../../hooks/useEquipment";

/**
 * Production Overview Page
 * Dashboard for a specific production showing crew, schedule, and operations status
 */
export default function ProductionOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  
  const { data: production, isLoading, error } = useProject(productionId);
  const { data: crewData } = useCrew();
  const { data: equipmentData } = useEquipment();
  
  if (isLoading) {
    return (
      <DetailPage
        header={{ title: "Production", description: "Loading..." }}
        backButton={{ label: "Back to Projects", onClick: () => router.push('/projects') }}
      >
        <Stack gap={4} className="items-center justify-center py-16">
          <Spinner size="lg" />
          <Body>Loading production...</Body>
        </Stack>
      </DetailPage>
    );
  }

  if (error || !production) {
    return (
      <DetailPage
        header={{ title: "Production Not Found" }}
        backButton={{ label: "Back to Projects", onClick: () => router.push('/projects') }}
      >
        <EmptyState
          title="Production Not Found"
          description={error ? (error instanceof Error ? error.message : String(error)) : "The requested production could not be found."}
          action={{ label: "Back to Projects", onClick: () => router.push('/projects') }}
        />
      </DetailPage>
    );
  }

  const crew = crewData || [];
  const equipment = equipmentData || [];
  
  const metrics = {
    crew: { 
      total: crew.length || 0, 
      confirmed: crew.filter(c => c.availability === 'available').length || 0, 
      checkedIn: crew.filter(c => c.availability === 'busy').length || 0, 
      pending: crew.filter(c => c.availability === 'on-leave').length || 0 
    },
    schedule: { totalCues: 24, completed: 18, upcoming: 4, delayed: 2 },
    equipment: { 
      total: equipment.length || 0, 
      deployed: equipment.filter(e => e.status === 'in_use').length || 0, 
      inTransit: equipment.filter(e => e.status === 'maintenance').length || 0, 
      issues: equipment.filter(e => e.condition === 'poor').length || 0 
    },
    safety: { incidents: 0, nearMisses: 2, openIssues: 3 },
  };

  const crewPercentage = metrics.crew.total > 0 ? Math.round((metrics.crew.confirmed / metrics.crew.total) * 100) : 0;
  const schedulePercentage = Math.round((metrics.schedule.completed / metrics.schedule.totalCues) * 100);

  const overviewContent = (
    <Stack gap={8}>
      <Stack direction="horizontal" gap={2} className="flex-wrap">
        <Badge variant={production.status === "active" ? "success" : "info"}>
          {production.status.toUpperCase()}
        </Badge>
        {production.code && (
          <Badge variant="outline">
            <MapPin size={12} className="mr-1" />
            {production.code}
          </Badge>
        )}
        {production.start_date && (
          <Badge variant="outline">
            <Calendar size={12} className="mr-1" />
            {new Date(production.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        )}
      </Stack>

      {/* Key Metrics */}
      <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Crew"
          value={`${metrics.crew.checkedIn}/${metrics.crew.total}`}
          icon={<Users size={20} />}
          trend="up"
          trendValue={`${crewPercentage}% confirmed`}
        />
        <StatCard
          label="Schedule"
          value={`${metrics.schedule.completed}/${metrics.schedule.totalCues}`}
          icon={<Clock size={20} />}
          trend={metrics.schedule.delayed > 0 ? "down" : "up"}
          trendValue={`${schedulePercentage}% complete`}
        />
        <StatCard
          label="Equipment"
          value={metrics.equipment.deployed.toString()}
          icon={<Package size={20} />}
          trend={metrics.equipment.issues > 0 ? "down" : "up"}
          trendValue={`${metrics.equipment.issues} issues`}
        />
        <StatCard
          label="Safety"
          value={metrics.safety.incidents.toString()}
          icon={<Shield size={20} />}
          trend={metrics.safety.incidents === 0 ? "up" : "down"}
          trendValue={`${metrics.safety.openIssues} open issues`}
        />
      </Grid>

      {/* Quick Actions & Status */}
      <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Quick Actions</H3>
              <Grid cols={2} gap={3}>
                <Button variant="outline" size="sm" className="justify-start">
                  <Radio size={16} className="mr-2" />
                  Show Call
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Users size={16} className="mr-2" />
                  Crew Check-in
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Clock size={16} className="mr-2" />
                  Run of Show
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Package size={16} className="mr-2" />
                  Equipment Status
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <AlertTriangle size={16} className="mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Truck size={16} className="mr-2" />
                  Deliveries
                </Button>
              </Grid>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Alerts</H3>
              <Stack gap={3}>
                {metrics.schedule.delayed > 0 && (
                  <Box className="flex items-center gap-3 rounded border-2 border-warning-500/30 bg-warning-50 p-3">
                    <Clock size={20} className="text-warning-600" />
                    <Box>
                      <Body className="font-weight-medium">
                        {metrics.schedule.delayed} Delayed Cues
                      </Body>
                      <Label className="text-muted">
                        Review schedule adjustments
                      </Label>
                    </Box>
                  </Box>
                )}
                {metrics.equipment.issues > 0 && (
                  <Box className="flex items-center gap-3 rounded border-2 border-error-500/30 bg-error-50 p-3">
                    <Package size={20} className="text-error-600" />
                    <Box>
                      <Body className="font-weight-medium">
                        {metrics.equipment.issues} Equipment Issues
                      </Body>
                      <Label className="text-muted">
                        Check maintenance queue
                      </Label>
                    </Box>
                  </Box>
                )}
                {metrics.crew.pending > 0 && (
                  <Box className="flex items-center gap-3 rounded border-2 border-primary-500/30 bg-primary-50 p-3">
                    <Users size={20} className="text-primary-600" />
                    <Box>
                      <Body className="font-weight-medium">
                        {metrics.crew.pending} Pending Confirmations
                      </Body>
                      <Label className="text-muted">
                        Follow up with crew members
                      </Label>
                    </Box>
                  </Box>
                )}
                {metrics.safety.openIssues > 0 && (
                  <Box className="flex items-center gap-3 rounded border-2 border-warning-500/30 bg-warning-50 p-3">
                    <Shield size={20} className="text-warning-600" />
                    <Box>
                      <Body className="font-weight-medium">
                        {metrics.safety.openIssues} Open Safety Issues
                      </Body>
                      <Label className="text-muted">
                        Review and resolve
                      </Label>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Upcoming Cues */}
      <Card variant="elevated">
        <CardBody>
          <Stack gap={4}>
            <H3>Upcoming Cues</H3>
            <Stack gap={2}>
              {[
                { cue: "Sound Check - Main Stage", time: "14:00", status: "in-progress", owner: "Audio Team" },
                { cue: "Lighting Focus", time: "15:30", status: "upcoming", owner: "Lighting Team" },
                { cue: "Artist Arrival", time: "16:00", status: "upcoming", owner: "Artist Relations" },
                { cue: "House Open", time: "17:00", status: "upcoming", owner: "Front of House" },
                { cue: "Show Start", time: "18:00", status: "upcoming", owner: "Stage Manager" },
              ].map((cue, index) => (
                <Box
                  key={index}
                  className="flex items-center gap-3 border-b border-ink-200 py-3 last:border-0"
                >
                  <Box className="flex size-8 items-center justify-center rounded bg-ink-100">
                    {cue.status === "in-progress" ? (
                      <Clock size={16} className="text-primary-600" />
                    ) : (
                      <CheckCircle size={16} className="text-ink-400" />
                    )}
                  </Box>
                  <Box className="flex-1">
                    <Body className="font-weight-medium">{cue.cue}</Body>
                    <Label className="text-muted">{cue.owner}</Label>
                  </Box>
                  <Badge variant={cue.status === "in-progress" ? "info" : "outline"}>
                    {cue.time}
                  </Badge>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: production.name,
        description: production.description || `${production.start_date || ''} - ${production.end_date || ''}`,
      }}
      backButton={{ label: "Back to Projects", onClick: () => router.push('/projects') }}
    >
      {overviewContent}
    </DetailPage>
  );
}
