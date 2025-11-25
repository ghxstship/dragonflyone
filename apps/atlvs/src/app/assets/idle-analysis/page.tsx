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

interface IdleAsset {
  id: string;
  name: string;
  category: string;
  idleDays: number;
  lastUsed: string;
  location: string;
  value: number;
  monthlyCarryCost: number;
  recommendation: "Sell" | "Rent Out" | "Redeploy" | "Monitor";
}

const mockIdleAssets: IdleAsset[] = [
  { id: "AST-101", name: "Meyer Sound LYON", category: "Audio", idleDays: 45, lastUsed: "2024-10-10", location: "Warehouse A", value: 85000, monthlyCarryCost: 850, recommendation: "Rent Out" },
  { id: "AST-102", name: "Robe MegaPointe (12)", category: "Lighting", idleDays: 62, lastUsed: "2024-09-23", location: "Warehouse B", value: 48000, monthlyCarryCost: 480, recommendation: "Redeploy" },
  { id: "AST-103", name: "Blackmagic ATEM 4K", category: "Video", idleDays: 90, lastUsed: "2024-08-26", location: "Warehouse A", value: 12000, monthlyCarryCost: 120, recommendation: "Sell" },
  { id: "AST-104", name: "CM Lodestar 2T (8)", category: "Rigging", idleDays: 30, lastUsed: "2024-10-25", location: "Warehouse C", value: 32000, monthlyCarryCost: 320, recommendation: "Monitor" },
  { id: "AST-105", name: "Stageline SL100", category: "Staging", idleDays: 120, lastUsed: "2024-07-26", location: "Yard", value: 95000, monthlyCarryCost: 1200, recommendation: "Sell" },
];

const categories = ["All", "Audio", "Lighting", "Video", "Rigging", "Staging"];

export default function IdleAnalysisPage() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<IdleAsset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredAssets = categoryFilter === "All" ? mockIdleAssets : mockIdleAssets.filter(a => a.category === categoryFilter);
  const totalIdleValue = mockIdleAssets.reduce((s, a) => s + a.value, 0);
  const totalCarryCost = mockIdleAssets.reduce((s, a) => s + a.monthlyCarryCost, 0);
  const avgIdleDays = Math.round(mockIdleAssets.reduce((s, a) => s + a.idleDays, 0) / mockIdleAssets.length);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Sell": return "text-red-400";
      case "Rent Out": return "text-green-400";
      case "Redeploy": return "text-blue-400";
      case "Monitor": return "text-yellow-400";
      default: return "text-ink-400";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Idle Asset Analysis</H1>
            <Label className="text-ink-400">Asset utilization rates and idle time analysis</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Idle Assets" value={mockIdleAssets.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Idle Value" value={formatCurrency(totalIdleValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Monthly Carry Cost" value={formatCurrency(totalCarryCost)} trend="down" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Idle Days" value={avgIdleDays} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
            <Stack gap={4}>
              <H3>Idle Cost Impact</H3>
              <Grid cols={3} gap={4}>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-red-400 text-2xl">{formatCurrency(totalCarryCost * 12)}</Label>
                  <Label className="text-ink-400">Annual Carry Cost</Label>
                </Card>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-yellow-400 text-2xl">{formatCurrency(totalIdleValue * 0.15)}</Label>
                  <Label className="text-ink-400">Potential Rental Revenue</Label>
                </Card>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-green-400 text-2xl">{formatCurrency(totalIdleValue * 0.6)}</Label>
                  <Label className="text-ink-400">Liquidation Value</Label>
                </Card>
              </Grid>
            </Stack>
          </Card>

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
                <TableHead className="text-ink-400">Idle Days</TableHead>
                <TableHead className="text-ink-400">Last Used</TableHead>
                <TableHead className="text-ink-400">Value</TableHead>
                <TableHead className="text-ink-400">Carry Cost</TableHead>
                <TableHead className="text-ink-400">Recommendation</TableHead>
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
                      <Label className={`font-mono ${asset.idleDays > 60 ? "text-red-400" : asset.idleDays > 30 ? "text-yellow-400" : "text-white"}`}>{asset.idleDays}</Label>
                      <ProgressBar value={Math.min(asset.idleDays, 120) / 1.2} className="h-1" />
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="text-ink-400">{asset.lastUsed}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">{formatCurrency(asset.value)}</Label></TableCell>
                  <TableCell><Label className="font-mono text-red-400">{formatCurrency(asset.monthlyCarryCost)}/mo</Label></TableCell>
                  <TableCell><Label className={getRecommendationColor(asset.recommendation)}>{asset.recommendation}</Label></TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>Details</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Asset Registry</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets/performance")}>Performance</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedAsset} onClose={() => setSelectedAsset(null)}>
        <ModalHeader><H3>{selectedAsset?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedAsset.category}</Badge>
                <Label className={getRecommendationColor(selectedAsset.recommendation)}>{selectedAsset.recommendation}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Idle Days</Label><Label className="font-mono text-white text-xl">{selectedAsset.idleDays}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Last Used</Label><Label className="text-white">{selectedAsset.lastUsed}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Asset Value</Label><Label className="font-mono text-white text-xl">{formatCurrency(selectedAsset.value)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Monthly Carry</Label><Label className="font-mono text-red-400 text-xl">{formatCurrency(selectedAsset.monthlyCarryCost)}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Location</Label><Label className="text-white">{selectedAsset.location}</Label></Stack>
              <Card className="p-4 border border-ink-700">
                <Stack gap={2}>
                  <Label className="text-ink-400">Recommendation Analysis</Label>
                  <Body className="text-ink-300">
                    {selectedAsset.recommendation === "Sell" && "Asset has been idle for extended period. Consider liquidating to recover capital."}
                    {selectedAsset.recommendation === "Rent Out" && "High-value asset with rental potential. List on rental marketplace."}
                    {selectedAsset.recommendation === "Redeploy" && "Asset can be utilized on upcoming projects. Check project requirements."}
                    {selectedAsset.recommendation === "Monitor" && "Recently idle. Continue monitoring for utilization opportunities."}
                  </Body>
                </Stack>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button>
          {selectedAsset?.recommendation === "Sell" && <Button variant="outline" className="text-red-400">List for Sale</Button>}
          {selectedAsset?.recommendation === "Rent Out" && <Button variant="solid">List for Rental</Button>}
          {selectedAsset?.recommendation === "Redeploy" && <Button variant="solid">Assign to Project</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
