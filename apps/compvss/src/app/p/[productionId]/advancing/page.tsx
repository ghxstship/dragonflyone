"use client";

/**
 * Production Advancing Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Send, CheckCircle, Clock, List, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, ProgressBar, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";

interface AdvanceItem {
  id: string;
  category: string;
  item: string;
  status: "pending" | "sent" | "confirmed";
  recipient: string;
}

const DEMO_ADVANCES: AdvanceItem[] = [
  { id: "1", category: "Technical", item: "Stage plot and input list", status: "confirmed", recipient: "Venue Tech" },
  { id: "2", category: "Technical", item: "Lighting requirements", status: "sent", recipient: "Lighting Director" },
  { id: "3", category: "Hospitality", item: "Catering requirements", status: "pending", recipient: "Catering Manager" },
  { id: "4", category: "Logistics", item: "Load-in schedule", status: "confirmed", recipient: "Production Manager" },
  { id: "5", category: "Logistics", item: "Parking and access", status: "pending", recipient: "Venue Ops" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const, icon: <Clock className="size-4" /> },
  sent: { label: "Sent", variant: "info" as const, icon: <Send className="size-4" /> },
  confirmed: { label: "Confirmed", variant: "success" as const, icon: <CheckCircle className="size-4" /> },
};

export default function ProductionAdvancingPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [category, setCategory] = useState("all");

  const { data: advances = [], isLoading, error, refetch } = useQuery<AdvanceItem[]>({
    queryKey: ["production-advancing", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/advancing`);
      if (!response.ok) return DEMO_ADVANCES;
      const data = await response.json();
      return data.items?.length ? data.items : DEMO_ADVANCES;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(advances.map((a: AdvanceItem) => a.category)))];
  const filteredAdvances = category === "all" ? advances : advances.filter((item: AdvanceItem) => item.category === category);

  const stats = {
    total: advances.length,
    confirmed: advances.filter((a: AdvanceItem) => a.status === "confirmed").length,
    sent: advances.filter((a: AdvanceItem) => a.status === "sent").length,
    pending: advances.filter((a: AdvanceItem) => a.status === "pending").length,
  };
  const progress = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "checklist",
      label: "Checklist",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Items" value={stats.total.toString()} icon={<List className="size-5" />} />
            <StatCard label="Confirmed" value={stats.confirmed.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Sent" value={stats.sent.toString()} icon={<Send className="size-5" />} />
            <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <Box className="flex justify-between mb-2">
              <Body className="font-weight-medium">Advance Progress</Body>
              <Body className="font-weight-bold">{Math.round(progress)}%</Body>
            </Box>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <Box className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </Box>

          <Stack gap={2}>
            {filteredAdvances.map((item: AdvanceItem) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <Card key={item.id} className="p-4">
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-4">
                      <Box className={`p-2 rounded-card ${item.status === "confirmed" ? "bg-success/20" : item.status === "sent" ? "bg-info/20" : "bg-surface-elevated"}`}>
                        {config.icon}
                      </Box>
                      <Box>
                        <Body className="font-weight-medium">{item.item}</Body>
                        <Body size="sm" className="text-on-dark-muted">To: {item.recipient}</Body>
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
    {
      id: "send",
      label: "Send Advance",
      icon: <Mail className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Send Advance Package" description="Send advance information to recipients" />
          <Card className="p-8 text-center mt-4">
            <Mail className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">Ready to Send</Body>
            <Body className="text-on-dark-muted mb-4">Send advance package to all pending recipients</Body>
            <Button variant="solid" icon={<Send className="size-4" />} iconPosition="left">Send Advance</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Advancing", description: "Manage production advance information" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
