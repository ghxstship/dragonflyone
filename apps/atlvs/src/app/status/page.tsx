"use client";

/**
 * Status Page
 * System status and uptime
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Clock, List, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
}

const DEMO_SERVICES: ServiceStatus[] = [
  { id: "1", name: "Web Application", status: "operational", uptime: 99.99 },
  { id: "2", name: "API", status: "operational", uptime: 99.98 },
  { id: "3", name: "Database", status: "operational", uptime: 99.99 },
  { id: "4", name: "Authentication", status: "operational", uptime: 99.97 },
  { id: "5", name: "File Storage", status: "operational", uptime: 99.95 },
  { id: "6", name: "Email Service", status: "operational", uptime: 99.90 },
];

const STATUS_CONFIG = {
  operational: { label: "Operational", variant: "success" as const, icon: <CheckCircle className="size-5 text-success" /> },
  degraded: { label: "Degraded", variant: "warning" as const, icon: <AlertTriangle className="size-5 text-warning" /> },
  outage: { label: "Outage", variant: "error" as const, icon: <XCircle className="size-5 text-error" /> },
};

export default function StatusPage() {
  const router = useRouter();

  const { data: services = [], isLoading, error, refetch } = useQuery({
    queryKey: ["system-status"],
    queryFn: async () => {
      const response = await fetch("/api/status");
      if (!response.ok) return DEMO_SERVICES;
      const data = await response.json();
      return data.services?.length ? data.services : DEMO_SERVICES;
    },
  });

  const allOperational = services.every((s: ServiceStatus) => s.status === "operational");

  const tabs = [
    {
      id: "status",
      label: "Status",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className={`p-6 mb-6 ${allOperational ? "border-success" : "border-warning"}`}>
            <div className="flex items-center gap-4">
              {allOperational ? <CheckCircle className="size-8 text-success" /> : <AlertTriangle className="size-8 text-warning" />}
              <div>
                <Body className="font-weight-bold font-weight-bold">{allOperational ? "All Systems Operational" : "Some Systems Degraded"}</Body>
                <Body className="text-grey-400">Last updated: {new Date().toLocaleString()}</Body>
              </div>
            </div>
          </Card>

          <SectionHeader title="Services" />
          <div className="space-y-2 mt-4">
            {services.map((service: ServiceStatus) => {
              const config = STATUS_CONFIG[service.status];
              return (
                <Card key={service.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {config.icon}
                      <Body className="font-weight-medium">{service.name}</Body>
                    </div>
                    <div className="flex items-center gap-4">
                      <Body size="sm" className="text-grey-400">{service.uptime}% uptime</Body>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      ),
    },
    {
      id: "subscribe",
      label: "Subscribe",
      icon: <Bell className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Status Updates" description="Get notified about system status changes" />
          <Card className="p-8 text-center mt-4">
            <Bell className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Subscribe to Updates</Body>
            <Body className="text-grey-400 mb-4">Receive notifications when system status changes</Body>
            <Button variant="solid">Subscribe</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "System", title: "Status", description: "Current system status and uptime" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
