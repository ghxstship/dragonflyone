"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, BarChart3, PieChart, LineChart, Table, AlertTriangle } from "lucide-react";
import {
  DetailPage, Badge, Body, Box, Button, Card, Grid, H3, Stack, Text, Spinner, EmptyState} from '@ghxstship/ui';
import { useDashboardBuilder, type DashboardConfig, useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";

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
  const { hasRole } = useAuthContext();
  const { dashboards, isLoading, error, refetch, createDashboard } = useDashboardBuilder();
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardWithWidgets | null>(null);

  const canManageDashboards = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const dashboardsWithWidgets: DashboardWithWidgets[] = dashboards.map((d: DashboardConfig) => ({
    ...d,
    widgets: generateWidgetsFromCount(d.widgetCount || 0),
  }));

  useEffect(() => {
    if (dashboardsWithWidgets.length > 0 && !selectedDashboard) {
      setSelectedDashboard(dashboardsWithWidgets[0]);
    }
  }, [dashboardsWithWidgets, selectedDashboard]);

  const handleCreateDashboard = () => {
    createDashboard({ name: `New Dashboard ${dashboards.length + 1}`, description: "Custom dashboard" });
  };

  if (isLoading) {
    return (
      <DetailPage
        header={{ title: "Dashboard Builder", description: "Loading..." }}
        backButton={{ label: "Back to Analytics", href: "/analytics" }}
      >
        <Stack gap={4} className="items-center justify-center py-16">
          <Spinner size="lg" />
          <Body>Loading dashboards...</Body>
        </Stack>
      </DetailPage>
    );
  }

  if (error) {
    return (
      <DetailPage
        header={{ title: "Dashboard Builder" }}
        backButton={{ label: "Back to Analytics", href: "/analytics" }}
      >
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Failed to Load Dashboards"
          description="Could not load dashboards. Please try again."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </DetailPage>
    );
  }

  const builderContent = (

      <Grid cols={4} gap={6} className="sm:grid-cols-1 lg:grid-cols-4">
        <Card inverted className="border-2 border-border p-4 col-span-1">
          <Stack gap={4}>
            <Stack direction="horizontal" className="justify-between items-center">
              <H3 className="text-white">Dashboards</H3>
              {canManageDashboards && (
                <Button variant="ghost" size="sm" onClick={handleCreateDashboard}>
                  <Plus className="size-4" />
                </Button>
              )}
            </Stack>
            <Stack gap={2}>
              {dashboardsWithWidgets.map((dashboard: DashboardWithWidgets) => (
                <Button
                  key={dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                  className={`p-3 rounded-card text-left transition-all ${
                    selectedDashboard?.id === dashboard.id 
                      ? "bg-primary/20 border-2 border-primary" 
                      : "bg-surface-inverse/50 border-2 border-transparent hover:border-border"
                  }`}
                >
                  <Body size="sm" className="text-white">{dashboard.name}</Body>
                  <Body size="sm" className="text-text-muted">{dashboard.widgets.length} widgets</Body>
                  {dashboard.isDefault && <Badge variant="ghost" className="mt-1">Default</Badge>}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Box className="col-span-3">
          {selectedDashboard ? (
            <Stack gap={4}>
              <Card inverted className="border-2 border-border p-4">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Box>
                    <H3 className="text-white">{selectedDashboard.name}</H3>
                    <Body size="sm" className="text-text-muted">Last updated: {formatDate(selectedDashboard.lastModified)}</Body>
                  </Box>
                  {canManageDashboards && (
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">
                        <Plus className="size-4 mr-1" /> Add Widget
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Card>

              <Grid cols={3} gap={4} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {selectedDashboard.widgets.map((widget) => (
                  <Card 
                    key={widget.id} 
                    inverted 
                    className={`border-2 border-border p-4 ${widget.size === "large" ? "col-span-2" : ""}`}
                  >
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Body size="sm" className="text-text-muted">{widget.title}</Body>
                        <Badge variant="outline" className="capitalize">{widget.type}</Badge>
                      </Stack>
                      <Box className="h-32 bg-surface-inverse/50 rounded-card flex items-center justify-center">
                        {widget.type === "chart" && <BarChart3 className="size-12 text-text-disabled" />}
                        {widget.type === "line" && <LineChart className="size-12 text-text-disabled" />}
                        {widget.type === "pie" && <PieChart className="size-12 text-text-disabled" />}
                        {widget.type === "table" && <Table className="size-12 text-text-disabled" />}
                        {widget.type === "metric" && <LayoutGrid className="size-12 text-text-disabled" />}
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Grid>

              {canManageDashboards && (
                <Card inverted className="border-2 border-dashed border-border p-6">
                  <Stack gap={4} className="items-center">
                    <Body className="text-text-muted">Add a new widget</Body>
                    <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
                      {widgetTypes.map((wt) => (
                        <Button
                          key={wt.type}
                          className="p-3 rounded-card bg-surface-inverse/50 border-2 border-border hover:border-primary transition-colors flex flex-col items-center gap-2"
                        >
                          <Text className="text-text-muted">{wt.icon}</Text>
                          <Body size="sm" className="text-text-muted">{wt.label}</Body>
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Stack>
          ) : (
            <Card inverted className="border-2 border-border p-8">
              <Stack gap={4} className="items-center justify-center py-12">
                <LayoutGrid className="size-12 text-text-disabled" />
                <Body className="text-text-muted">Select a dashboard to edit</Body>
              </Stack>
            </Card>
          )}
        </Box>
      </Grid>
  );

  return (
    <DetailPage
      header={{
        kicker: "Analytics",
        title: "Dashboard Builder",
        description: "Build and customize analytics dashboards",
      }}
      backButton={{ label: "Back to Analytics", href: "/analytics" }}
      actions={
        canManageDashboards ? (
          <Button variant="solid" size="sm" onClick={handleCreateDashboard}>
            <Plus className="size-4 mr-2" />
            New Dashboard
          </Button>
        ) : undefined
      }
    >
      {builderContent}
    </DetailPage>
  );
}
