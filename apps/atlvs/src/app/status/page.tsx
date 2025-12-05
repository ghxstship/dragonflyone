import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
  Badge,
} from "@ghxstship/ui";
import { CheckCircle, AlertCircle, Clock, ArrowRight, Bell, Activity } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const statusData = {
  hero: {
    headline: "SYSTEM STATUS",
    description: "Real-time status of ATLVS services and infrastructure.",
  },
  overall: {
    status: "operational",
    message: "All Systems Operational",
    uptime: "99.99%",
    lastUpdated: "December 4, 2024 at 10:45 PM EST",
  },
  services: [
    { name: "Web Application", status: "operational", latency: "45ms" },
    { name: "API", status: "operational", latency: "32ms" },
    { name: "Database", status: "operational", latency: "12ms" },
    { name: "File Storage", status: "operational", latency: "28ms" },
    { name: "Authentication", status: "operational", latency: "18ms" },
    { name: "Webhooks", status: "operational", latency: "55ms" },
    { name: "Email Delivery", status: "operational", latency: "120ms" },
    { name: "Background Jobs", status: "operational", latency: "85ms" },
  ],
  incidents: [
    {
      date: "November 28, 2024",
      title: "Scheduled Maintenance Completed",
      status: "resolved",
      description: "Database optimization completed successfully with no downtime.",
    },
    {
      date: "November 15, 2024",
      title: "API Latency Increase",
      status: "resolved",
      description: "Brief increase in API response times due to traffic spike. Resolved within 15 minutes.",
    },
  ],
  metrics: [
    { label: "Uptime (30 days)", value: "99.99%" },
    { label: "Avg Response Time", value: "45ms" },
    { label: "Incidents (30 days)", value: "0" },
    { label: "Scheduled Maintenance", value: "1" },
  ],
};

const statusColors = {
  operational: "text-success",
  degraded: "text-warning",
  outage: "text-error",
  resolved: "text-grey-500",
};

const statusIcons = {
  operational: CheckCircle,
  degraded: AlertCircle,
  outage: AlertCircle,
  resolved: CheckCircle,
};

export default function StatusPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Activity className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              STATUS
            </Label>
            <Display size="lg" className="text-white">
              {statusData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {statusData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Overall Status */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 shadow-brand-lg">
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack direction="horizontal" gap={4} className="items-center">
                <CheckCircle className="size-8 text-success" />
                <Stack gap={1}>
                  <H1 className="text-ink-950">{statusData.overall.message}</H1>
                  <Label size="xs" className="text-grey-500">
                    Last updated: {statusData.overall.lastUpdated}
                  </Label>
                </Stack>
              </Stack>
              <Stack className="text-right">
                <Display size="md" className="text-success">{statusData.overall.uptime}</Display>
                <Label size="xs" className="text-grey-500">30-day uptime</Label>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Metrics */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={4} gap={6}>
            {statusData.metrics.map((metric) => (
              <Card key={metric.label} className="border-2 border-ink-950 bg-white p-6 text-center shadow-md">
                <Stack gap={2}>
                  <Display size="md" className="text-ink-950">{metric.value}</Display>
                  <Label size="xs" className="text-grey-500">{metric.label}</Label>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Services */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">SERVICE STATUS</H1>
          </Stack>

          <Card className="border-2 border-ink-950 bg-white shadow-md">
            <Stack>
              {statusData.services.map((service, idx) => {
                const StatusIcon = statusIcons[service.status as keyof typeof statusIcons];
                const colorClass = statusColors[service.status as keyof typeof statusColors];
                return (
                  <Stack
                    key={service.name}
                    direction="horizontal"
                    className={`items-center justify-between p-4 ${idx !== statusData.services.length - 1 ? "border-b border-grey-200" : ""}`}
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <StatusIcon className={`size-5 ${colorClass}`} />
                      <Label size="sm" className="text-ink-950">{service.name}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                        <Clock className="size-4" />
                        <Label size="xs">{service.latency}</Label>
                      </Stack>
                      <Badge variant="outline" className="border-success text-success">
                        Operational
                      </Badge>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Recent Incidents */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-white">RECENT INCIDENTS</H1>
            <Body size="lg" className="text-on-dark-secondary">
              Past incidents and scheduled maintenance.
            </Body>
          </Stack>

          <Stack gap={4}>
            {statusData.incidents.map((incident) => (
              <Card key={incident.title} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
                <Stack gap={3}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <CheckCircle className="size-5 text-grey-500" />
                      <H3 size="sm" className="text-white">{incident.title}</H3>
                    </Stack>
                    <Label size="xs" className="text-on-dark-muted">{incident.date}</Label>
                  </Stack>
                  <Body size="sm" className="text-on-dark-secondary">
                    {incident.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Subscribe */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              GET STATUS UPDATES
            </Display>
            <Body size="lg" className="text-grey-600">
              Subscribe to receive notifications about system status and scheduled maintenance.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/settings/notifications">
                <Button variant="pop" size="lg" icon={<Bell />}>
                  Subscribe to Updates
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outline" size="lg" icon={<ArrowRight />}>
                  Report an Issue
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
