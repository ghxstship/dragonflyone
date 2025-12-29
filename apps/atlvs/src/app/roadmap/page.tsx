"use client";

/**
 * Roadmap Page
 * Product roadmap and upcoming features
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Rocket, CheckCircle, Clock, Zap, List, Calendar } from "lucide-react";
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

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  quarter: string;
  status: "completed" | "in_progress" | "planned";
  category: string;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  { id: "1", title: "Real-time Collaboration", description: "Live editing and presence indicators", quarter: "Q4 2024", status: "completed", category: "Collaboration" },
  { id: "2", title: "Mobile App v2", description: "Redesigned mobile experience", quarter: "Q4 2024", status: "completed", category: "Mobile" },
  { id: "3", title: "AI-Powered Scheduling", description: "Smart scheduling suggestions", quarter: "Q1 2025", status: "in_progress", category: "AI" },
  { id: "4", title: "Advanced Analytics", description: "Custom dashboards and reports", quarter: "Q1 2025", status: "in_progress", category: "Analytics" },
  { id: "5", title: "Workflow Automation", description: "Automated task workflows", quarter: "Q2 2025", status: "planned", category: "Automation" },
  { id: "6", title: "Multi-language Support", description: "Support for 10+ languages", quarter: "Q2 2025", status: "planned", category: "Localization" },
];

const STATUS_CONFIG = {
  completed: { label: "Completed", variant: "success" as const, icon: <CheckCircle className="size-4" /> },
  in_progress: { label: "In Progress", variant: "info" as const, icon: <Zap className="size-4" /> },
  planned: { label: "Planned", variant: "warning" as const, icon: <Clock className="size-4" /> },
};

export default function RoadmapPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "roadmap",
      label: "Roadmap",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <Card className="p-4 text-center">
              <CheckCircle className="size-6 text-success mx-auto mb-2" />
              <Body className="font-weight-bold font-weight-bold">{ROADMAP_ITEMS.filter((i) => i.status === "completed").length}</Body>
              <Body size="sm" className="text-grey-400">Completed</Body>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="size-6 text-info mx-auto mb-2" />
              <Body className="font-weight-bold font-weight-bold">{ROADMAP_ITEMS.filter((i) => i.status === "in_progress").length}</Body>
              <Body size="sm" className="text-grey-400">In Progress</Body>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="size-6 text-warning mx-auto mb-2" />
              <Body className="font-weight-bold font-weight-bold">{ROADMAP_ITEMS.filter((i) => i.status === "planned").length}</Body>
              <Body size="sm" className="text-grey-400">Planned</Body>
            </Card>
          </Grid>

          <div className="space-y-4">
            {ROADMAP_ITEMS.map((item) => {
              const statusConfig = STATUS_CONFIG[item.status];
              return (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-card ${item.status === "completed" ? "bg-success/20" : item.status === "in_progress" ? "bg-info/20" : "bg-grey-800"}`}>
                        {statusConfig.icon}
                      </div>
                      <div>
                        <Body className="font-weight-bold font-weight-medium">{item.title}</Body>
                        <Body className="text-grey-400">{item.description}</Body>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.quarter}</Badge>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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
      id: "request",
      label: "Request Feature",
      icon: <Rocket className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Request a Feature" description="Have an idea? We'd love to hear it!" />
          <Card className="p-8 text-center mt-4">
            <Rocket className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Share Your Ideas</Body>
            <Body className="text-grey-400 mb-4">Help us build the features you need</Body>
            <Button variant="solid" onClick={() => router.push("/contact")}>Submit Feature Request</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Product", title: "Roadmap", description: "See what we're building next" }}
      tabs={tabs}
    />
  );
}
