"use client";

import { useParams } from "next/navigation";
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Container,
  H3,
  Body,
  Label,
} from "@ghxstship/ui";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Package,
  Shield,
  Radio,
  Truck,
} from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

/**
 * Production Overview Page
 * Dashboard for a specific production showing crew, schedule, and operations status
 */
export default function ProductionOverviewPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  
  // Find the production
  const production = compvssDemoProductions.find((p) => p.id === productionId);
  
  if (!production) {
    return (
      <Container>
        <SectionHeader
          kicker="Production"
          title="Production Not Found"
          description="The requested production could not be found."
        />
      </Container>
    );
  }

  // Mock metrics for the production
  const metrics = {
    crew: { total: 45, confirmed: 38, checkedIn: 32, pending: 7 },
    schedule: { totalCues: 24, completed: 18, upcoming: 4, delayed: 2 },
    equipment: { total: 156, deployed: 142, inTransit: 8, issues: 6 },
    safety: { incidents: 0, nearMisses: 2, openIssues: 3 },
  };

  const crewPercentage = Math.round((metrics.crew.confirmed / metrics.crew.total) * 100);
  const schedulePercentage = Math.round((metrics.schedule.completed / metrics.schedule.totalCues) * 100);

  return (
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={4}>
        <SectionHeader
          kicker="Production"
          title={production.name}
          description={`${production.venue} | ${production.startDate} - ${production.endDate}`}
        />
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <Badge variant={production.status === "active" ? "success" : "info"}>
            {production.status.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            <MapPin size={12} className="mr-1" />
            {production.venue}
          </Badge>
          <Badge variant="outline">
            <Calendar size={12} className="mr-1" />
            {new Date(production.startDate || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Quick Actions & Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Quick Actions</H3>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* Alerts & Notifications */}
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Alerts</H3>
              <Stack gap={3}>
                {metrics.schedule.delayed > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-warning-500/30 bg-warning-50 p-3">
                    <Clock size={20} className="text-warning-600" />
                    <div>
                      <Body className="font-medium">
                        {metrics.schedule.delayed} Delayed Cues
                      </Body>
                      <Label className="text-muted">
                        Review schedule adjustments
                      </Label>
                    </div>
                  </div>
                )}
                {metrics.equipment.issues > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-error-500/30 bg-error-50 p-3">
                    <Package size={20} className="text-error-600" />
                    <div>
                      <Body className="font-medium">
                        {metrics.equipment.issues} Equipment Issues
                      </Body>
                      <Label className="text-muted">
                        Check maintenance queue
                      </Label>
                    </div>
                  </div>
                )}
                {metrics.crew.pending > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-primary-500/30 bg-primary-50 p-3">
                    <Users size={20} className="text-primary-600" />
                    <div>
                      <Body className="font-medium">
                        {metrics.crew.pending} Pending Confirmations
                      </Body>
                      <Label className="text-muted">
                        Follow up with crew members
                      </Label>
                    </div>
                  </div>
                )}
                {metrics.safety.openIssues > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-warning-500/30 bg-warning-50 p-3">
                    <Shield size={20} className="text-warning-600" />
                    <div>
                      <Body className="font-medium">
                        {metrics.safety.openIssues} Open Safety Issues
                      </Body>
                      <Label className="text-muted">
                        Review and resolve
                      </Label>
                    </div>
                  </div>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </div>

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
                <div
                  key={index}
                  className="flex items-center gap-3 border-b border-ink-200 py-3 last:border-0"
                >
                  <div className="flex size-8 items-center justify-center rounded bg-ink-100">
                    {cue.status === "in-progress" ? (
                      <Clock size={16} className="text-primary-600" />
                    ) : (
                      <CheckCircle size={16} className="text-ink-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Body className="font-medium">{cue.cue}</Body>
                    <Label className="text-muted">{cue.owner}</Label>
                  </div>
                  <Badge variant={cue.status === "in-progress" ? "info" : "outline"}>
                    {cue.time}
                  </Badge>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
