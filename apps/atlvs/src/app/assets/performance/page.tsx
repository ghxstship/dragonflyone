"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface AssetPerformance {
  id: string;
  name: string;
  category: string;
  utilizationRate: number;
  uptime: number;
  failureCount: number;
  mtbf: number;
  mttr: number;
  healthScore: number;
  predictedFailure?: string;
  lastMaintenance: string;
}

const mockAssets: AssetPerformance[] = [
  { id: "AST-001", name: "L-Acoustics K2 Array", category: "Audio", utilizationRate: 78, uptime: 99.2, failureCount: 1, mtbf: 2400, mttr: 4, healthScore: 92, lastMaintenance: "2024-10-15" },
  { id: "AST-002", name: "Clay Paky Sharpy Plus", category: "Lighting", utilizationRate: 85, uptime: 98.5, failureCount: 3, mtbf: 1800, mttr: 2, healthScore: 88, predictedFailure: "2025-02-15", lastMaintenance: "2024-11-01" },
  { id: "AST-003", name: "ROE Visual CB5 Panels", category: "Video", utilizationRate: 62, uptime: 99.8, failureCount: 0, mtbf: 3200, mttr: 1, healthScore: 98, lastMaintenance: "2024-09-20" },
  { id: "AST-004", name: "CM Lodestar 1T Hoists", category: "Rigging", utilizationRate: 71, uptime: 99.5, failureCount: 2, mtbf: 2100, mttr: 6, healthScore: 85, predictedFailure: "2025-01-20", lastMaintenance: "2024-10-25" },
  { id: "AST-005", name: "DiGiCo SD12 Console", category: "Audio", utilizationRate: 92, uptime: 100, failureCount: 0, mtbf: 4000, mttr: 0, healthScore: 100, lastMaintenance: "2024-11-10" },
];

const categories = ["All", "Audio", "Lighting", "Video", "Rigging", "Power", "Staging"];

export default function AssetPerformancePage() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<AssetPerformance | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredAssets = categoryFilter === "All" ? mockAssets : mockAssets.filter(a => a.category === categoryFilter);

  const avgUtilization = Math.round(mockAssets.reduce((s, a) => s + a.utilizationRate, 0) / mockAssets.length);
  const avgUptime = (mockAssets.reduce((s, a) => s + a.uptime, 0) / mockAssets.length).toFixed(1);
  const totalFailures = mockAssets.reduce((s, a) => s + a.failureCount, 0);
  const atRiskCount = mockAssets.filter(a => a.predictedFailure).length;

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Asset Performance Analytics</H1>
            <Label className="text-ink-400">Performance metrics and failure prediction for all assets</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Avg Utilization" value={`${avgUtilization}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Uptime" value={`${avgUptime}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Failures (YTD)" value={totalFailures} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="At Risk Assets" value={atRiskCount} trend={atRiskCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Button variant="outlineWhite">Export Report</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Asset</TableHead>
                <TableHead className="text-ink-400">Category</TableHead>
                <TableHead className="text-ink-400">Utilization</TableHead>
                <TableHead className="text-ink-400">Uptime</TableHead>
                <TableHead className="text-ink-400">MTBF</TableHead>
                <TableHead className="text-ink-400">Health</TableHead>
                <TableHead className="text-ink-400">Prediction</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{asset.name}</Label>
                      <Label size="xs" className="text-ink-500">{asset.id}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Badge variant="outline">{asset.category}</Badge></TableCell>
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="font-mono text-white">{asset.utilizationRate}%</Label>
                      <ProgressBar value={asset.utilizationRate} className="h-1" />
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="font-mono text-white">{asset.uptime}%</Label></TableCell>
                  <TableCell><Label className="font-mono text-ink-300">{asset.mtbf}h</Label></TableCell>
                  <TableCell><Label className={`font-mono ${getHealthColor(asset.healthScore)}`}>{asset.healthScore}</Label></TableCell>
                  <TableCell>
                    {asset.predictedFailure ? (
                      <Label className="text-orange-400">{asset.predictedFailure}</Label>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Asset Registry</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets/maintenance")}>Maintenance</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedAsset} onClose={() => setSelectedAsset(null)}>
        <ModalHeader><H3>{selectedAsset?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Badge variant="outline">{selectedAsset.category}</Badge>
                <Label className={getHealthColor(selectedAsset.healthScore)}>Health: {selectedAsset.healthScore}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Utilization Rate</Label><Label className="font-mono text-white text-xl">{selectedAsset.utilizationRate}%</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Uptime</Label><Label className="font-mono text-white text-xl">{selectedAsset.uptime}%</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">MTBF (hrs)</Label><Label className="font-mono text-white">{selectedAsset.mtbf}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">MTTR (hrs)</Label><Label className="font-mono text-white">{selectedAsset.mttr}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Failures (YTD)</Label><Label className="font-mono text-white">{selectedAsset.failureCount}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Last Maintenance</Label><Label className="text-white">{selectedAsset.lastMaintenance}</Label></Stack>
              </Grid>
              {selectedAsset.predictedFailure && (
                <Card className="p-4 border border-orange-800 bg-orange-900/20">
                  <Stack gap={2}>
                    <Label className="text-orange-400">⚠️ Predicted Failure</Label>
                    <Label className="text-white">{selectedAsset.predictedFailure}</Label>
                    <Label className="text-ink-400">Schedule preventive maintenance before this date</Label>
                  </Stack>
                </Card>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button>
          <Button variant="solid">Schedule Maintenance</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
