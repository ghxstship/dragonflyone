"use client";

import { useState } from "react";
import { Database, Table, Download, Play, Clock, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  Stack,
} from '@ghxstship/ui';
import { useDataWarehouse, type DataSource } from "@ghxstship/config";

const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

const getStatusColor = (status: DataSource["status"]) => {
  switch (status) {
    case "Connected": return "text-success";
    case "Syncing": return "text-info";
    case "Error": return "text-error";
    default: return "text-grey-400";
  }
};

export default function DataWarehousePage() {
  const { dataSources, isLoading, error, refetch, syncDataSource } = useDataWarehouse();
  const [query, setQuery] = useState("");

  const totalRecords = dataSources.reduce((sum: number, s: DataSource) => sum + (s.recordCount || 0), 0);
  const connectedSources = dataSources.filter((s: DataSource) => s.status === "Connected").length;


  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Data Warehouse" subtitle="Access and query the data warehouse" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading data sources...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Data Warehouse" subtitle="Access and query the data warehouse" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load data sources</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Data Warehouse"
        subtitle="Access and query the data warehouse"
        showFavorite
        showSettings
      />

      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-grey-400">
              <Database className="size-4" />
              <Body size="sm">Data Sources</Body>
            </div>
            <H3 className="text-white">{dataSources.length}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-grey-400">Total Records</Body>
            <H3 className="text-white">{formatNumber(totalRecords)}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-grey-400">Connected</Body>
            <H3 className="text-success">{connectedSources}</H3>
          </Stack>
        </Card>
        <Card inverted className="border-2 border-ink-800 p-4">
          <Stack gap={2}>
            <Body size="sm" className="text-grey-400">Sync Status</Body>
            <H3 className="text-white">{dataSources.filter((s: DataSource) => s.status === "Syncing").length > 0 ? "Syncing" : "Idle"}</H3>
          </Stack>
        </Card>
      </Grid>

      <Card inverted className="border-2 border-ink-800 p-6">
        <Stack gap={4}>
          <H3 className="text-white">SQL Query Editor</H3>
          <div className="relative">
            <Input
              placeholder="Enter SQL query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Play className="size-4 mr-1" /> Run Query
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="size-4 mr-1" /> Export Results
            </Button>
            <Button variant="ghost" size="sm" onClick={() => syncDataSource(dataSources[0]?.id || "")}>
              <RefreshCw className="size-4 mr-1" /> Sync Data
            </Button>
          </div>
        </Stack>
      </Card>

      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <H3 className="text-white">Data Sources ({connectedSources} connected)</H3>
            <Stack gap={2}>
              {dataSources.map((source: DataSource) => (
                <div key={source.id} className="flex items-center justify-between p-3 rounded-card bg-ink-900/50">
                  <div className="flex items-center gap-3">
                    <Table className="size-4 text-grey-400" />
                    <div>
                      <Body size="sm" className="text-white font-mono">{source.name}</Body>
                      <Body size="sm" className="text-grey-400">{formatNumber(source.recordCount)} records • {source.type}</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="ghost" className={getStatusColor(source.status)}>{source.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => syncDataSource(source.id)}>
                      <RefreshCw className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <H3 className="text-white">Sync Schedule</H3>
            <Stack gap={2}>
              {dataSources.map((source: DataSource) => (
                <div key={source.id} className="p-3 rounded-card bg-ink-900/50">
                  <Body size="sm" className="text-white font-mono">{source.name}</Body>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-grey-400">
                      <Clock className="size-3" />
                      <Body size="sm">{source.lastSync || "Never"}</Body>
                    </div>
                    <Badge variant="ghost">{source.syncFrequency}</Badge>
                  </div>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}
