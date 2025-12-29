"use client";

/**
 * Production Wrap Page
 * Post-production wrap and closeout
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Clock, FileText, DollarSign, Users, List, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  ProgressBar,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface WrapItem {
  id: string;
  category: string;
  item: string;
  status: "pending" | "completed";
  assignee: string;
}

const DEMO_WRAP_ITEMS: WrapItem[] = [
  { id: "1", category: "Financial", item: "Finalize vendor payments", status: "completed", assignee: "Emily Davis" },
  { id: "2", category: "Financial", item: "Submit expense reports", status: "completed", assignee: "Lisa Brown" },
  { id: "3", category: "Financial", item: "Close purchase orders", status: "pending", assignee: "Emily Davis" },
  { id: "4", category: "Documentation", item: "Archive production documents", status: "pending", assignee: "John Smith" },
  { id: "5", category: "Documentation", item: "Create post-mortem report", status: "pending", assignee: "Sarah Williams" },
  { id: "6", category: "Team", item: "Collect team feedback", status: "pending", assignee: "Mike Johnson" },
  { id: "7", category: "Team", item: "Process contractor payments", status: "pending", assignee: "Emily Davis" },
  { id: "8", category: "Equipment", item: "Return rental equipment", status: "completed", assignee: "Alex Chen" },
];

const CATEGORIES = ["All", "Financial", "Documentation", "Team", "Equipment"];

export default function ProductionWrapPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.productionId as string;
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: wrapItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-wrap", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/wrap`);
      if (!response.ok) return DEMO_WRAP_ITEMS;
      const data = await response.json();
      return data.items?.length ? data.items : DEMO_WRAP_ITEMS;
    },
  });

  const filteredItems = selectedCategory === "All" ? wrapItems : wrapItems.filter((item: WrapItem) => item.category === selectedCategory);

  const stats = {
    total: wrapItems.length,
    completed: wrapItems.filter((i: WrapItem) => i.status === "completed").length,
    pending: wrapItems.filter((i: WrapItem) => i.status === "pending").length,
  };
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "checklist",
      label: "Wrap Checklist",
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
            <div className="flex justify-between mb-2">
              <Body className="font-weight-medium">Wrap Progress</Body>
              <Body className="font-weight-bold">{Math.round(progress)}%</Body>
            </div>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <div className="flex gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredItems.map((item: WrapItem) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-card ${item.status === "completed" ? "bg-success/20" : "bg-grey-800"}`}>
                      {item.status === "completed" ? <CheckCircle className="size-4 text-success" /> : <Clock className="size-4 text-grey-400" />}
                    </div>
                    <div>
                      <Body className={`font-weight-medium ${item.status === "completed" ? "line-through text-grey-500" : ""}`}>{item.item}</Body>
                      <Body size="sm" className="text-grey-400">{item.assignee}</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={item.status === "completed" ? "success" : "warning"}>{item.status === "completed" ? "Done" : "Pending"}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Production Summary</Body>
              <Body size="sm" className="text-grey-400 mb-4">Complete overview of the production including timeline, budget, and team</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <DollarSign className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Financial Report</Body>
              <Body size="sm" className="text-grey-400 mb-4">Detailed breakdown of all expenses, payments, and budget variance</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <Users className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Team Report</Body>
              <Body size="sm" className="text-grey-400 mb-4">Team member contributions, hours worked, and feedback summary</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <CheckCircle className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Post-Mortem</Body>
              <Body size="sm" className="text-grey-400 mb-4">Lessons learned, what went well, and areas for improvement</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Wrap",
        description: "Complete production wrap and closeout",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
