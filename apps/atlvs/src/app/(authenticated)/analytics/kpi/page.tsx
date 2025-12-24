"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Target, BarChart3, Activity, DollarSign, Users } from "lucide-react";
import {
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Badge,
  EnterprisePageHeader,
  Button,
} from "@ghxstship/ui";

interface KPIMetric {
  id: string;
  name: string;
  value: string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  target: string;
  targetStatus: "on_track" | "at_risk" | "off_track";
  category: string;
}

const kpiData: KPIMetric[] = [
  { id: "revenue", name: "Total Revenue", value: "$2.4M", change: 14.3, changeType: "increase", target: "$2.5M", targetStatus: "on_track", category: "financial" },
  { id: "deals", name: "Deals Closed", value: "47", change: 23.7, changeType: "increase", target: "50", targetStatus: "on_track", category: "sales" },
  { id: "pipeline", name: "Pipeline Value", value: "$8.2M", change: 5.1, changeType: "increase", target: "$10M", targetStatus: "at_risk", category: "sales" },
  { id: "utilization", name: "Resource Utilization", value: "78%", change: -4.9, changeType: "decrease", target: "85%", targetStatus: "off_track", category: "operations" },
  { id: "nps", name: "Net Promoter Score", value: "72", change: 5.9, changeType: "increase", target: "75", targetStatus: "on_track", category: "customer" },
  { id: "projects", name: "Active Projects", value: "24", change: 14.3, changeType: "increase", target: "25", targetStatus: "on_track", category: "operations" },
  { id: "retention", name: "Client Retention", value: "94%", change: 2.2, changeType: "increase", target: "95%", targetStatus: "on_track", category: "customer" },
  { id: "margin", name: "Gross Margin", value: "42%", change: 5.0, changeType: "increase", target: "45%", targetStatus: "at_risk", category: "financial" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "financial": return <DollarSign className="size-4" />;
    case "sales": return <Target className="size-4" />;
    case "operations": return <Activity className="size-4" />;
    case "customer": return <Users className="size-4" />;
    default: return <BarChart3 className="size-4" />;
  }
};

function KPICard({ kpi }: { kpi: KPIMetric }) {
  const statusColors = {
    on_track: "text-success border-success/30",
    at_risk: "text-warning border-warning/30",
    off_track: "text-error border-error/30",
  };

  return (
    <Card inverted className="border-2 border-ink-800 p-6">
      <Stack gap={4}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-grey-400">
            {getCategoryIcon(kpi.category)}
            <Body size="sm" className="capitalize">{kpi.category}</Body>
          </div>
          <Badge variant="outline" className={statusColors[kpi.targetStatus]}>
            {kpi.targetStatus.replace("_", " ")}
          </Badge>
        </div>
        
        <div>
          <Body size="sm" className="text-grey-400">{kpi.name}</Body>
          <H2 className="text-white">{kpi.value}</H2>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {kpi.changeType === "increase" ? (
              <TrendingUp className="size-4 text-success" />
            ) : kpi.changeType === "decrease" ? (
              <TrendingDown className="size-4 text-error" />
            ) : (
              <Activity className="size-4 text-grey-400" />
            )}
            <Body size="sm" className={kpi.changeType === "increase" ? "text-success" : kpi.changeType === "decrease" ? "text-error" : "text-grey-400"}>
              {kpi.change > 0 ? "+" : ""}{kpi.change}%
            </Body>
          </div>
          <Body size="sm" className="text-grey-500">Target: {kpi.target}</Body>
        </div>
      </Stack>
    </Card>
  );
}

export default function KPIDashboardPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = ["all", "financial", "sales", "operations", "customer"];
  const filteredKPIs = activeCategory === "all" 
    ? kpiData 
    : kpiData.filter(kpi => kpi.category === activeCategory);

  const onTrackCount = kpiData.filter(k => k.targetStatus === "on_track").length;
  const atRiskCount = kpiData.filter(k => k.targetStatus === "at_risk").length;
  const offTrackCount = kpiData.filter(k => k.targetStatus === "off_track").length;

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="KPI Dashboard"
        subtitle="Track key performance indicators across your organization"
        showFavorite
        showSettings
      />

      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-grey-400">Total KPIs</Body>
            <H3 className="text-white">{kpiData.length}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-success/30 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-success">On Track</Body>
            <H3 className="text-success">{onTrackCount}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-warning/30 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-warning">At Risk</Body>
            <H3 className="text-warning">{atRiskCount}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-error/30 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-error">Off Track</Body>
            <H3 className="text-error">{offTrackCount}</H3>
          </Stack>
        </Card>
      </Grid>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={`capitalize ${activeCategory === cat ? "bg-primary text-white" : ""}`}
          >
            {cat === "all" ? "All KPIs" : cat}
          </Button>
        ))}
      </div>

      <Grid cols={4} gap={6} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {filteredKPIs.map(kpi => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </Grid>
    </Stack>
  );
}
