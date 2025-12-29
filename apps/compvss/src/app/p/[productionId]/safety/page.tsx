"use client";

/**
 * Production Safety Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Shield, AlertTriangle, CheckCircle, FileText, Plus, List, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  ProgressBar,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface SafetyItem {
  id: string;
  category: string;
  item: string;
  status: "compliant" | "pending" | "non_compliant";
  notes: string;
}

const DEMO_SAFETY: SafetyItem[] = [
  { id: "1", category: "Fire Safety", item: "Fire extinguishers inspected", status: "compliant", notes: "Last inspection Dec 1" },
  { id: "2", category: "Fire Safety", item: "Emergency exits marked", status: "compliant", notes: "" },
  { id: "3", category: "Electrical", item: "PAT testing complete", status: "pending", notes: "Scheduled for Dec 18" },
  { id: "4", category: "Rigging", item: "Load calculations verified", status: "compliant", notes: "" },
  { id: "5", category: "Crowd", item: "Crowd management plan", status: "pending", notes: "Under review" },
];

const STATUS_CONFIG = {
  compliant: { label: "Compliant", variant: "success" as const, icon: <CheckCircle className="size-4" /> },
  pending: { label: "Pending", variant: "warning" as const, icon: <AlertTriangle className="size-4" /> },
  non_compliant: { label: "Non-Compliant", variant: "error" as const, icon: <AlertTriangle className="size-4" /> },
};

export default function ProductionSafetyPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [category, setCategory] = useState("all");

  const { data: safetyItems = [], isLoading, error, refetch } = useQuery<SafetyItem[]>({
    queryKey: ["production-safety", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/safety`);
      if (!response.ok) return DEMO_SAFETY;
      const data = await response.json();
      return data.items?.length ? data.items : DEMO_SAFETY;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(safetyItems.map((s: SafetyItem) => s.category)))];
  const filteredItems = category === "all" ? safetyItems : safetyItems.filter((item: SafetyItem) => item.category === category);

  const stats = {
    total: safetyItems.length,
    compliant: safetyItems.filter((s: SafetyItem) => s.status === "compliant").length,
    pending: safetyItems.filter((s: SafetyItem) => s.status === "pending").length,
    nonCompliant: safetyItems.filter((s: SafetyItem) => s.status === "non_compliant").length,
  };
  const complianceRate = stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "checklist",
      label: "Checklist",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Items" value={stats.total.toString()} icon={<ClipboardList className="size-5" />} />
            <StatCard label="Compliant" value={stats.compliant.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Pending" value={stats.pending.toString()} icon={<AlertTriangle className="size-5" />} />
            <StatCard label="Compliance" value={`${Math.round(complianceRate)}%`} icon={<Shield className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <div className="flex justify-between mb-2">
              <Body className="font-weight-medium">Overall Compliance</Body>
              <Body className="font-weight-bold">{Math.round(complianceRate)}%</Body>
            </div>
            <ProgressBar value={complianceRate} size="lg" />
          </Card>

          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredItems.map((item: SafetyItem) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-card ${item.status === "compliant" ? "bg-success/20" : item.status === "pending" ? "bg-warning/20" : "bg-error/20"}`}>
                        {config.icon}
                      </div>
                      <div>
                        <Body className="font-weight-medium">{item.item}</Body>
                        {item.notes && <Body size="sm" className="text-grey-400">{item.notes}</Body>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
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
      id: "documents",
      label: "Documents",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Safety Documents" description="Required safety documentation" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
            {["Risk Assessment", "Emergency Plan", "Fire Safety Certificate", "Insurance Certificate"].map((doc) => (
              <Card key={doc} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-grey-400" />
                    <Body className="font-weight-medium">{doc}</Body>
                  </div>
                  <Button variant="outline" size="sm">Upload</Button>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Safety", description: "Safety compliance and documentation" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Item</Button>}
    />
  );
}
