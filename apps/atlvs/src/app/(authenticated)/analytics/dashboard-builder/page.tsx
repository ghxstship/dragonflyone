"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, BarChart3, PieChart, LineChart, Table, Loader2, AlertTriangle } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  EnterprisePageHeader,
  Grid,
  H3,
  Stack,
  Text,
} from '@ghxstship/ui';
import { useDashboardBuilder, type DashboardConfig } from "@ghxstship/config";

interface Widget {
  id: string;
  title: string;
  type: "chart" | "table" | "metric" | "pie" | "line";
  size: "small" | "medium" | "large";
}

interface DashboardWithWidgets extends DashboardConfig {
  widgets: Widget[];
}

const widgetTypes = [
  { type: "chart", icon: <BarChart3 className="size-5" />, label: "Bar Chart" },
  { type: "line", icon: <LineChart className="size-5" />, label: "Line Chart" },
  { type: "pie", icon: <PieChart className="size-5" />, label: "Pie Chart" },
  { type: "table", icon: <Table className="size-5" />, label: "Data Table" },
  { type: "metric", icon: <LayoutGrid className="size-5" />, label: "Metric Card" },
];

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const generateWidgetsFromCount = (count: number): Widget[] => {
  const types: Widget["type"][] = ["chart", "table", "metric", "pie", "line"];
  const sizes: Widget["size"][] = ["small", "medium", "large"];
  return Array.from({ length: count }, (_, i) => ({
    id: `w${i}`,
    title: `Widget ${i + 1}`,
    type: types[i % types.length],
    size: sizes[i % sizes.length],
  }));
};

export default function DashboardBuilderPage() {
  const { dashboards, isLoading, error, refetch, createDashboard } = useDashboardBuilder();
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardWithWidgets | null>(null);

  const dashboardsWithWidgets: DashboardWithWidgets[] = dashboards.map((d: DashboardConfig) => ({
    ...d,
    widgets: generateWidgetsFromCount(d.widgetCount || 0),
  }));

  useEffect(() => {
    if (dashboardsWithWidgets.length > 0 && !selectedDashboard) {
      setSelectedDashboard(dashboardsWithWidgets[0]);
    }
  }, [dashboardsWithWidgets, selectedDashboard]);

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Dashboard Builder" subtitle="Build and customize analytics dashboards" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading dashboards...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Dashboard Builder" subtitle="Build and customize analytics dashboards" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load dashboards</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const handleCreateDashboard = () => {
    createDashboard({ name: `New Dashboard ${dashboards.length + 1}`, description: "Custom dashboard" });
  };

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Dashboard Builder"
        subtitle="Build and customize analytics dashboards"
        showFavorite
        showSettings
      />

      <Grid cols={4} gap={6} className="sm:grid-cols-1 lg:grid-cols-4">
        <Card inverted className="border-2 border-ink-800 p-4 col-span-1">
          <Stack gap={4}>
            <div className="flex items-center justify-between">
              <H3 className="text-white">Dashboards</H3>
              <Button variant="ghost" size="sm" onClick={handleCreateDashboard}>
                <Plus className="size-4" />
              </Button>
            </div>
            <Stack gap={2}>
              {dashboardsWithWidgets.map((dashboard: DashboardWithWidgets) => (
                <Button
                  key={dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                  className={`p-3 rounded-card text-left transition-all ${
                    selectedDashboard?.id === dashboard.id 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-ink-900/50 border-2 border-transparent hover:border-ink-700"
                  }`}
                >
                  <Body size="sm" className="text-white">{dashboard.name}</Body>
                  <Body size="sm" className="text-grey-400">{dashboard.widgets.length} widgets</Body>
                  {dashboard.isDefault && <Badge variant="ghost" className="mt-1">Default</Badge>}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Card>

        <div className="col-span-3">
          {selectedDashboard ? (
            <Stack gap={4}>
              <Card inverted className="border-2 border-ink-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <H3 className="text-white">{selectedDashboard.name}</H3>
                    <Body size="sm" className="text-grey-400">Last updated: {formatDate(selectedDashboard.lastModified)}</Body>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">
                      <Plus className="size-4 mr-1" /> Add Widget
                    </Button>
                  </div>
                </div>
              </Card>

              <Grid cols={3} gap={4} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {selectedDashboard.widgets.map((widget) => (
                  <Card 
                    key={widget.id} 
                    inverted 
                    className={`border-2 border-ink-800 p-4 ${widget.size === "large" ? "col-span-2" : ""}`}
                  >
                    <Stack gap={3}>
                      <div className="flex items-center justify-between">
                        <Body size="sm" className="text-grey-400">{widget.title}</Body>
                        <Badge variant="outline" className="capitalize">{widget.type}</Badge>
                      </div>
                      <div className="h-32 bg-ink-900/50 rounded-card flex items-center justify-center">
                        {widget.type === "chart" && <BarChart3 className="size-12 text-grey-600" />}
                        {widget.type === "line" && <LineChart className="size-12 text-grey-600" />}
                        {widget.type === "pie" && <PieChart className="size-12 text-grey-600" />}
                        {widget.type === "table" && <Table className="size-12 text-grey-600" />}
                        {widget.type === "metric" && <LayoutGrid className="size-12 text-grey-600" />}
                      </div>
                    </Stack>
                  </Card>
                ))}
              </Grid>

              <Card inverted className="border-2 border-dashed border-ink-700 p-6">
                <Stack gap={4} className="items-center">
                  <Body className="text-grey-400">Add a new widget</Body>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {widgetTypes.map((wt) => (
                      <Button
                        key={wt.type}
                        className="p-3 rounded-card bg-ink-900/50 border-2 border-ink-700 hover:border-primary transition-colors flex flex-col items-center gap-2"
                      >
                        <Text className="text-grey-400">{wt.icon}</Text>
                        <Body size="sm" className="text-grey-400">{wt.label}</Body>
                      </Button>
                    ))}
                  </div>
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Card inverted className="border-2 border-ink-800 p-8">
              <Stack gap={4} className="items-center justify-center py-12">
                <LayoutGrid className="size-12 text-grey-600" />
                <Body className="text-grey-400">Select a dashboard to edit</Body>
              </Stack>
            </Card>
          )}
        </div>
      </Grid>
    </Stack>
  );
}
