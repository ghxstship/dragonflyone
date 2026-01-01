"use client";

/**
 * Production Wrap Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, FileText, Download, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, ProgressBar, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";

interface WrapItem {
  id: string;
  category: string;
  item: string;
  status: "pending" | "completed";
  assignee: string;
}

const DEMO_WRAP: WrapItem[] = [
  { id: "1", category: "Financial", item: "Finalize vendor payments", status: "completed", assignee: "Finance Team" },
  { id: "2", category: "Financial", item: "Submit expense reports", status: "completed", assignee: "All Crew" },
  { id: "3", category: "Documentation", item: "Archive production documents", status: "pending", assignee: "PM" },
  { id: "4", category: "Equipment", item: "Return rental equipment", status: "completed", assignee: "Tech Team" },
  { id: "5", category: "Team", item: "Collect feedback", status: "pending", assignee: "PM" },
];

export default function ProductionWrapPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [category, setCategory] = useState("all");

  const { data: wrapItems = [], isLoading, error, refetch } = useQuery<WrapItem[]>({
    queryKey: ["production-wrap", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/wrap`);
      if (!response.ok) return DEMO_WRAP;
      const data = await response.json();
      return data.items?.length ? data.items : DEMO_WRAP;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(wrapItems.map((w: WrapItem) => w.category)))];
  const filteredItems = category === "all" ? wrapItems : wrapItems.filter((item: WrapItem) => item.category === category);

  const stats = {
    total: wrapItems.length,
    completed: wrapItems.filter((w: WrapItem) => w.status === "completed").length,
    pending: wrapItems.filter((w: WrapItem) => w.status === "pending").length,
  };
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "checklist",
      label: "Checklist",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Items" value={stats.total.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock className="size-5" />} />
            <StatCard label="Progress" value={`${Math.round(progress)}%`} icon={<CheckCircle className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <Box className="flex justify-between mb-2">
              <Body className="font-weight-medium">Wrap Progress</Body>
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
            {filteredItems.map((item: WrapItem) => (
              <Card key={item.id} className="p-4">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-4">
                    <Box className={`p-2 rounded-card ${item.status === "completed" ? "bg-success/20" : "bg-grey-800"}`}>
                      {item.status === "completed" ? <CheckCircle className="size-4 text-success" /> : <Clock className="size-4 text-on-dark-muted" />}
                    </Box>
                    <Box>
                      <Body className={`font-weight-medium ${item.status === "completed" ? "line-through text-on-dark-disabled" : ""}`}>{item.item}</Body>
                      <Body size="sm" className="text-on-dark-muted">{item.assignee}</Body>
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={item.status === "completed" ? "success" : "warning"}>{item.status === "completed" ? "Done" : "Pending"}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: <Download className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Wrap Reports" description="Generate and download wrap reports" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Production Summary</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Complete production overview</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Financial Report</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Budget and expense breakdown</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Wrap", description: "Production wrap and closeout" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
