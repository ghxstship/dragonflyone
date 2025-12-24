"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Users, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  EnterprisePageHeader,
  Grid,
  H2,
  H3,
  Stack,
} from '@ghxstship/ui';
import { useClientRetention, type ClientRetention } from "@ghxstship/config";

interface ClientCohort {
  name: string;
  total: number;
  retained: number;
  rate: number;
  trend: "up" | "down" | "stable";
}

export default function ClientRetentionPage() {
  const { clients, isLoading, error, refetch } = useClientRetention();

  const { cohorts, atRiskClients, stats } = useMemo(() => {
    const activeClients = clients.filter((c: ClientRetention) => c.status === "Active");
    const atRisk = clients.filter((c: ClientRetention) => c.status === "At Risk");
    const churned = clients.filter((c: ClientRetention) => c.status === "Churned");
    const newClients = clients.filter((c: ClientRetention) => c.status === "New");

    const segmentGroups = clients.reduce((acc: Record<string, ClientRetention[]>, client: ClientRetention) => {
      const segment = client.segment || "Other";
      if (!acc[segment]) acc[segment] = [];
      acc[segment].push(client);
      return acc;
    }, {});

    const computedCohorts: ClientCohort[] = Object.entries(segmentGroups).map(([name, segmentClients]) => {
      const active = segmentClients.filter((c: ClientRetention) => c.status === "Active").length;
      const rate = segmentClients.length > 0 ? Math.round((active / segmentClients.length) * 100) : 0;
      return {
        name,
        total: segmentClients.length,
        retained: active,
        rate,
        trend: rate >= 90 ? "up" as const : rate >= 80 ? "stable" as const : "down" as const,
      };
    });

    return {
      cohorts: computedCohorts.length > 0 ? computedCohorts : [
        { name: "Enterprise", total: 0, retained: 0, rate: 0, trend: "stable" as const },
      ],
      atRiskClients: atRisk.slice(0, 5).map((c: ClientRetention) => ({
        name: c.clientName,
        lastActivity: `${c.daysSinceLastDeal} days ago`,
        healthScore: c.healthScore,
        reason: c.healthScore < 40 ? "Low engagement" : "Declining activity",
      })),
      stats: {
        total: clients.length,
        active: activeClients.length,
        atRisk: atRisk.length,
        churned: churned.length,
        newClients: newClients.length,
        retentionRate: clients.length > 0 ? Math.round((activeClients.length / clients.length) * 100) : 0,
      },
    };
  }, [clients]);

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Client Retention" subtitle="Analyze client retention metrics and trends" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading retention data...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Client Retention" subtitle="Analyze client retention metrics and trends" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load retention data</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Client Retention"
        subtitle="Analyze client retention metrics and trends"
        showFavorite
        showSettings
      />

      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-grey-400">
              <RefreshCw className="size-4" />
              <Body size="sm">Retention Rate</Body>
            </div>
            <H2 className="text-success">{stats.retentionRate}%</H2>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-grey-400">Total Clients</Body>
            <H2 className="text-white">{stats.total}</H2>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="size-4" />
              <Body size="sm">New Clients</Body>
            </div>
            <H2 className="text-white">{stats.newClients}</H2>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-error">
              <TrendingDown className="size-4" />
              <Body size="sm">Churned</Body>
            </div>
            <H2 className="text-white">{stats.churned}</H2>
          </Stack>
        </Card>
      </Grid>

      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <H3 className="text-white">Retention by Cohort</H3>
            <Stack gap={3}>
              {cohorts.map((cohort) => (
                <div key={cohort.name} className="flex items-center justify-between p-3 rounded-card bg-ink-900/50">
                  <div className="flex items-center gap-3">
                    <Users className="size-4 text-grey-400" />
                    <div>
                      <Body size="sm" className="text-white">{cohort.name}</Body>
                      <Body size="sm" className="text-grey-400">{cohort.retained}/{cohort.total} clients</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cohort.rate >= 90 ? "solid" : "outline"} className={cohort.rate >= 90 ? "text-success" : "text-warning"}>
                      {cohort.rate}%
                    </Badge>
                    {cohort.trend === "up" && <TrendingUp className="size-4 text-success" />}
                    {cohort.trend === "down" && <TrendingDown className="size-4 text-error" />}
                  </div>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              <H3 className="text-white">At-Risk Clients</H3>
            </div>
            <Stack gap={3}>
              {atRiskClients.map((client) => (
                <div key={client.name} className="flex items-center justify-between p-3 rounded-card bg-ink-900/50">
                  <div>
                    <Body size="sm" className="text-white">{client.name}</Body>
                    <Body size="sm" className="text-grey-400">{client.reason} • {client.lastActivity}</Body>
                  </div>
                  <Badge variant="ghost" className="text-error">
                    Health: {client.healthScore}%
                  </Badge>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Grid>

      <Card inverted className="border-2 border-ink-800 p-6">
        <Stack gap={4}>
          <H3 className="text-white">Client Distribution</H3>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-2">
            <div className="p-3 rounded-card bg-ink-900/50 text-center">
              <Body size="sm" className="text-grey-400">Active</Body>
              <H3 className="text-success">{stats.active}</H3>
            </div>
            <div className="p-3 rounded-card bg-ink-900/50 text-center">
              <Body size="sm" className="text-grey-400">At Risk</Body>
              <H3 className="text-warning">{stats.atRisk}</H3>
            </div>
            <div className="p-3 rounded-card bg-ink-900/50 text-center">
              <Body size="sm" className="text-grey-400">Churned</Body>
              <H3 className="text-error">{stats.churned}</H3>
            </div>
            <div className="p-3 rounded-card bg-ink-900/50 text-center">
              <Body size="sm" className="text-grey-400">New</Body>
              <H3 className="text-info">{stats.newClients}</H3>
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
