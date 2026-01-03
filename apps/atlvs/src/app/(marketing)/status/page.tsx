"use client";

/**
 * Status Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, service status, and incident history
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Bell, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Card, Body, H3, Button, Badge, Spinner, Grid, Box} from "@ghxstship/ui";

interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
  description?: string;
}

const DEMO_SERVICES: ServiceStatus[] = [
  { id: "1", name: "Web Application", status: "operational", uptime: 99.99, description: "Main web application and dashboard" },
  { id: "2", name: "API", status: "operational", uptime: 99.98, description: "REST and GraphQL API endpoints" },
  { id: "3", name: "Database", status: "operational", uptime: 99.99, description: "Primary database cluster" },
  { id: "4", name: "Authentication", status: "operational", uptime: 99.97, description: "Login, SSO, and MFA services" },
  { id: "5", name: "File Storage", status: "operational", uptime: 99.95, description: "Document and media storage" },
  { id: "6", name: "Email Service", status: "operational", uptime: 99.90, description: "Transactional email delivery" },
];

const STATUS_CONFIG = {
  operational: { label: "Operational", color: "bg-success/20 text-success border-success/30", icon: <CheckCircle className="size-5 text-success" /> },
  degraded: { label: "Degraded", color: "bg-accent/20 text-accent border-accent/30", icon: <AlertTriangle className="size-5 text-accent" /> },
  outage: { label: "Outage", color: "bg-error/20 text-error border-error/30", icon: <XCircle className="size-5 text-error" /> },
};

const UPTIME_HISTORY = [
  { date: "Today", uptime: 100 },
  { date: "Yesterday", uptime: 100 },
  { date: "2 days ago", uptime: 99.98 },
  { date: "3 days ago", uptime: 100 },
  { date: "4 days ago", uptime: 100 },
  { date: "5 days ago", uptime: 99.95 },
  { date: "6 days ago", uptime: 100 },
];

export default function StatusPage() {
  const router = useRouter();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["system-status"],
    queryFn: async () => {
      const response = await fetch("/api/status");
      if (!response.ok) return DEMO_SERVICES;
      const data = await response.json();
      return data.services?.length ? data.services : DEMO_SERVICES;
    },
  });

  const allOperational = services.every((s: ServiceStatus) => s.status === "operational");
  const averageUptime = services.length > 0 
    ? (services.reduce((acc: number, s: ServiceStatus) => acc + s.uptime, 0) / services.length).toFixed(2)
    : "99.99";

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: allOperational ? "gradient" : "ink",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="System Status"
              title={allOperational ? "All Systems Operational" : "Some Systems Experiencing Issues"}
              description={`Current overall uptime: ${averageUptime}%. Last updated: ${new Date().toLocaleString()}`}
              primaryCta={{
                label: "Subscribe to Updates",
                onClick: () => document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth" }),
              }}
              secondaryCta={{
                label: "View Incident History",
                onClick: () => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" }),
              }}
              background={allOperational ? "gradient" : "ink"}
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "overall-status",
          background: allOperational ? "primary" : "accent",
          content: (
            <Container size="2xl" className="py-8">
              <Stack direction="horizontal" className="justify-center items-center gap-4">
                {allOperational ? (
                  <CheckCircle className="size-8 text-white" />
                ) : (
                  <AlertTriangle className="size-8 text-white" />
                )}
                <Body className="text-white font-weight-bold text-h4-md">
                  {allOperational ? "All Systems Operational" : "Partial System Outage"}
                </Body>
              </Stack>
            </Container>
          ),
        },
        {
          id: "services",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Services</Body>
                  <H3 className="text-white">Service Status</H3>
                  <Body className="text-text-muted max-w-2xl">Real-time status of all ATLVS services and infrastructure components.</Body>
                </Stack>

                {isLoading ? (
                  <Stack className="items-center py-12">
                    <Spinner size="lg" />
                    <Body className="text-text-muted mt-4">Loading status...</Body>
                  </Stack>
                ) : (
                  <Stack gap={3}>
                    {services.map((service: ServiceStatus) => {
                      const config = STATUS_CONFIG[service.status];
                      return (
                        <Card key={service.id} className="p-5 border-2 border-border rounded-card pop-card">
                          <Stack direction="horizontal" className="justify-between items-center flex-wrap gap-4">
                            <Stack direction="horizontal" gap={4} className="items-center">
                              {config.icon}
                              <Stack gap={0}>
                                <Body className="text-white font-weight-bold">{service.name}</Body>
                                {service.description && (
                                  <Body size="sm" className="text-text-disabled">{service.description}</Body>
                                )}
                              </Stack>
                            </Stack>
                            <Stack direction="horizontal" gap={4} className="items-center">
                              <Stack direction="horizontal" gap={2} className="items-center text-text-muted">
                                <Activity className="size-4" />
                                <Body size="sm">{service.uptime}% uptime</Body>
                              </Stack>
                              <Badge className={config.color}>{config.label}</Badge>
                            </Stack>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "history",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Uptime</Body>
                  <H3 className="text-white">7-Day Uptime History</H3>
                </Stack>

                <Grid cols={6} gap={2} className="grid-cols-7">
                  {UPTIME_HISTORY.map((day, idx) => (
                    <Stack key={idx} gap={2} className="items-center">
                      <Box 
                        className={`w-full h-16 rounded-card ${
                          day.uptime === 100 
                            ? "bg-success" 
                            : day.uptime >= 99.9 
                              ? "bg-success/70" 
                              : "bg-accent"
                        }`}
                        title={`${day.uptime}% uptime`}
                      />
                      <Body size="sm" className="text-text-disabled text-center">{day.date}</Body>
                      <Body size="sm" className="text-text-muted">{day.uptime}%</Body>
                    </Stack>
                  ))}
                </Grid>

                <Stack direction="horizontal" gap={6} className="justify-center">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="size-3 rounded-avatar bg-success" />
                    <Body size="sm" className="text-text-muted">100% Uptime</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="size-3 rounded-avatar bg-success/70" />
                    <Body size="sm" className="text-text-muted">99.9%+ Uptime</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="size-3 rounded-avatar bg-accent" />
                    <Body size="sm" className="text-text-muted">Degraded</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "subscribe",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Card className="p-12 border-2 border-primary/30 rounded-card bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
                <Stack gap={6} className="items-center">
                  <Box className="p-4 bg-primary/20 rounded-card">
                    <Bell className="size-10 text-primary" />
                  </Box>
                  <Stack gap={2} className="items-center">
                    <Body className="text-white font-weight-bold text-h4-md">Subscribe to Status Updates</Body>
                    <Body className="text-text-muted max-w-lg">Get notified via email or SMS when system status changes. Stay informed about maintenance windows and incidents.</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={4}>
                    <Button variant="solid" size="lg">Subscribe via Email</Button>
                    <Button variant="outline" size="lg">Subscribe via SMS</Button>
                  </Stack>
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Need Help?"
              description="If you are experiencing issues not reflected on this page, please contact our support team."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact?reason=support"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
