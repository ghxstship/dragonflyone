"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  ProgressBar,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Win/Loss Analysis"
        subtitle="Track outcomes and competitive intelligence"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Opportunities', href: '/opportunities' }, { label: 'Win Loss' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard label="Win Rate" value={`${winRate}%`} trend={winRate >= 50 ? "up" : "down"} />
              <StatCard label="Won Value" value={formatCurrency(wonValue)} />
              <StatCard label="Lost Value" value={formatCurrency(lostValue)} />
              <StatCard label="Total Opportunities" value={mockRecords.length.toString()} />
            </Grid>

            <Grid cols={2} gap={4}>
              <Card>
                <Stack gap={4}>
                  <H3>Win Rate Trend</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">Current Period</Body>
                      <Body className="font-mono">{winRate}%</Body>
                    </Stack>
                    <ProgressBar value={winRate} />
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Card>
                      <Stack className="text-center">
                        <Body className="font-mono">{wonRecords.length}</Body>
                        <Body className="text-body-sm">Won</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack className="text-center">
                        <Body className="font-mono">{lostRecords.length}</Body>
                        <Body className="text-body-sm">Lost</Body>
                      </Stack>
                    </Card>
                  </Grid>
                </Stack>
              </Card>
              <Card>
                <Stack gap={4}>
                  <H3>Top Loss Reasons</H3>
                  <Stack gap={2}>
                    {Object.entries(lossReasons).map(([reason, count], idx) => (
                      <Stack key={idx} gap={1}>
                        <Stack direction="horizontal" className="justify-between">
                          <Body>{reason}</Body>
                          <Body className="font-mono">{count}</Body>
                        </Stack>
                        <ProgressBar value={(count / lostRecords.length) * 100} />
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
              <Button variant="outline" onClick={() => setShowAnalysisModal(true)}>View Analysis</Button>
            </Stack>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell><Body>{record.opportunity}</Body></TableCell>
                    <TableCell><Body className="text-body-sm">{record.client}</Body></TableCell>
                    <TableCell><Body className="font-mono">{formatCurrency(record.value)}</Body></TableCell>
                    <TableCell><Badge variant={record.result === "Won" ? "solid" : "outline"}>{record.result}</Badge></TableCell>
                    <TableCell><Body className="text-body-sm">{record.reason}</Body></TableCell>
                    <TableCell><Body className="text-body-sm">{record.closeDate}</Body></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>Details</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/opportunities")}>Opportunities</Button>
              <Button variant="outline" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        <ModalHeader><H3>Opportunity Details</H3></ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRecord.opportunity}</Body>
              <Badge variant={selectedRecord.result === "Won" ? "solid" : "outline"}>{selectedRecord.result}</Badge>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Client</Body><Body>{selectedRecord.client}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Value</Body><Body className="font-mono">{formatCurrency(selectedRecord.value)}</Body></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Close Date</Body><Body>{selectedRecord.closeDate}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Sales Rep</Body><Body>{selectedRecord.salesRep}</Body></Stack>
              </Grid>
              {selectedRecord.competitor && <Stack gap={1}><Body className="text-body-sm">Lost To</Body><Body>{selectedRecord.competitor}</Body></Stack>}
              <Stack gap={1}><Body className="text-body-sm">Reason</Body><Body>{selectedRecord.reason}</Body></Stack>
              {selectedRecord.lessons && <Stack gap={1}><Body className="text-body-sm">Lessons Learned</Body><Body>{selectedRecord.lessons}</Body></Stack>}
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
              <Body className="text-body-sm">Win Factors</Body>
              {Object.entries(winReasons).map(([reason, count], idx) => (
                <Card key={idx}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>{reason}</Body>
                    <Body className="font-mono">{count}x</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Stack gap={2}>
              <Body className="text-body-sm">Loss Factors</Body>
              {Object.entries(lossReasons).map(([reason, count], idx) => (
                <Card key={idx}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>{reason}</Body>
                    <Body className="font-mono">{count}x</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Stack gap={2}>
              <Body className="text-body-sm">Competitors</Body>
              {["Competitor A", "Competitor B"].map((comp, idx) => (
                <Card key={idx}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>{comp}</Body>
                    <Body className="text-body-sm">{lostRecords.filter(r => r.competitor === comp).length} wins against us</Body>
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
    </PageLayout>
  );
}
