"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface WinLossRecord {
  id: string;
  opportunity: string;
  client: string;
  value: number;
  result: "Won" | "Lost";
  competitor?: string;
  reason: string;
  closeDate: string;
  salesRep: string;
  lessons?: string;
}

const mockRecords: WinLossRecord[] = [
  { id: "WL-001", opportunity: "Summer Festival 2025", client: "Festival Productions", value: 450000, result: "Won", closeDate: "2024-11-20", salesRep: "John Smith", reason: "Strong relationship, competitive pricing", lessons: "Early engagement with client was key" },
  { id: "WL-002", opportunity: "Corporate Gala", client: "Tech Corp", value: 125000, result: "Won", closeDate: "2024-11-15", salesRep: "Sarah Johnson", reason: "Technical expertise, past performance" },
  { id: "WL-003", opportunity: "Concert Series", client: "Live Nation", value: 780000, result: "Lost", competitor: "Competitor A", closeDate: "2024-11-10", salesRep: "John Smith", reason: "Price too high", lessons: "Need to be more competitive on large deals" },
  { id: "WL-004", opportunity: "Theater Production", client: "Broadway Inc", value: 95000, result: "Won", closeDate: "2024-11-05", salesRep: "Mike Davis", reason: "Specialized theater experience" },
  { id: "WL-005", opportunity: "Sports Event", client: "Stadium Group", value: 320000, result: "Lost", competitor: "Competitor B", closeDate: "2024-10-28", salesRep: "Emily Chen", reason: "Incumbent advantage", lessons: "Earlier relationship building needed" },
];

export default function WinLossPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<WinLossRecord | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const wonRecords = mockRecords.filter(r => r.result === "Won");
  const lostRecords = mockRecords.filter(r => r.result === "Lost");
  const winRate = Math.round((wonRecords.length / mockRecords.length) * 100);
  const wonValue = wonRecords.reduce((s, r) => s + r.value, 0);
  const lostValue = lostRecords.reduce((s, r) => s + r.value, 0);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredRecords = activeTab === "all" ? mockRecords :
    activeTab === "won" ? wonRecords : lostRecords;

  const lossReasons = lostRecords.reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const winReasons = wonRecords.reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Win/Loss Analysis</H1>
            <Label className="text-ink-400">Track outcomes and competitive intelligence</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Win Rate" value={`${winRate}%`} trend={winRate >= 50 ? "up" : "down"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Won Value" value={formatCurrency(wonValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Lost Value" value={formatCurrency(lostValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Opportunities" value={mockRecords.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={2} gap={4}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={4}>
                <H3>Win Rate Trend</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-400">Current Period</Label>
                    <Label className="font-mono text-green-400">{winRate}%</Label>
                  </Stack>
                  <ProgressBar value={winRate} className="h-4" />
                </Stack>
                <Grid cols={2} gap={4}>
                  <Card className="p-3 border border-green-800 bg-green-900/20 text-center">
                    <Label className="font-mono text-green-400 text-2xl">{wonRecords.length}</Label>
                    <Label className="text-ink-400">Won</Label>
                  </Card>
                  <Card className="p-3 border border-red-800 bg-red-900/20 text-center">
                    <Label className="font-mono text-red-400 text-2xl">{lostRecords.length}</Label>
                    <Label className="text-ink-400">Lost</Label>
                  </Card>
                </Grid>
              </Stack>
            </Card>
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={4}>
                <H3>Top Loss Reasons</H3>
                <Stack gap={2}>
                  {Object.entries(lossReasons).map(([reason, count], idx) => (
                    <Stack key={idx} gap={1}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-ink-300">{reason}</Label>
                        <Label className="font-mono text-red-400">{count}</Label>
                      </Stack>
                      <ProgressBar value={(count / lostRecords.length) * 100} className="h-2" />
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "won"} onClick={() => setActiveTab("won")}>Won</Tab>
                <Tab active={activeTab === "lost"} onClick={() => setActiveTab("lost")}>Lost</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowAnalysisModal(true)}>View Analysis</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Opportunity</TableHead>
                <TableHead className="text-ink-400">Client</TableHead>
                <TableHead className="text-ink-400">Value</TableHead>
                <TableHead className="text-ink-400">Result</TableHead>
                <TableHead className="text-ink-400">Reason</TableHead>
                <TableHead className="text-ink-400">Close Date</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="border-ink-800">
                  <TableCell><Label className="text-white">{record.opportunity}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{record.client}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">{formatCurrency(record.value)}</Label></TableCell>
                  <TableCell><Label className={record.result === "Won" ? "text-green-400" : "text-red-400"}>{record.result}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{record.reason}</Label></TableCell>
                  <TableCell><Label className="text-ink-400">{record.closeDate}</Label></TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>Details</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities")}>Opportunities</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        <ModalHeader><H3>Opportunity Details</H3></ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Stack gap={4}>
              <Body className="text-white">{selectedRecord.opportunity}</Body>
              <Badge variant={selectedRecord.result === "Won" ? "solid" : "outline"} className={selectedRecord.result === "Won" ? "bg-green-600" : ""}>{selectedRecord.result}</Badge>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Client</Label><Label className="text-white">{selectedRecord.client}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Value</Label><Label className="font-mono text-white">{formatCurrency(selectedRecord.value)}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Close Date</Label><Label className="text-white">{selectedRecord.closeDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Sales Rep</Label><Label className="text-white">{selectedRecord.salesRep}</Label></Stack>
              </Grid>
              {selectedRecord.competitor && <Stack gap={1}><Label className="text-ink-400">Lost To</Label><Label className="text-red-400">{selectedRecord.competitor}</Label></Stack>}
              <Stack gap={1}><Label className="text-ink-400">Reason</Label><Body className="text-ink-300">{selectedRecord.reason}</Body></Stack>
              {selectedRecord.lessons && <Stack gap={1}><Label className="text-ink-400">Lessons Learned</Label><Body className="text-ink-300">{selectedRecord.lessons}</Body></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAnalysisModal} onClose={() => setShowAnalysisModal(false)}>
        <ModalHeader><H3>Competitive Analysis</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label className="text-ink-400">Win Factors</Label>
              {Object.entries(winReasons).map(([reason, count], idx) => (
                <Card key={idx} className="p-3 border border-green-800 bg-green-900/20">
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-green-400">{reason}</Label>
                    <Label className="font-mono text-green-400">{count}x</Label>
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Stack gap={2}>
              <Label className="text-ink-400">Loss Factors</Label>
              {Object.entries(lossReasons).map(([reason, count], idx) => (
                <Card key={idx} className="p-3 border border-red-800 bg-red-900/20">
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-red-400">{reason}</Label>
                    <Label className="font-mono text-red-400">{count}x</Label>
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Stack gap={2}>
              <Label className="text-ink-400">Competitors</Label>
              {["Competitor A", "Competitor B"].map((comp, idx) => (
                <Card key={idx} className="p-3 border border-ink-700">
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-white">{comp}</Label>
                    <Label className="text-ink-400">{lostRecords.filter(r => r.competitor === comp).length} wins against us</Label>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>Close</Button>
          <Button variant="solid">Export Report</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
