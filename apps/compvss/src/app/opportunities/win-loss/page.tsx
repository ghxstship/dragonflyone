"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useWinLossRecords,
  type WinLossRecord,
} from '../../../hooks/useWinLossRecords';


export default function WinLossPage() {
  const router = useRouter();
  const { data: records = [] } = useWinLossRecords();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'won', 'lost'],
  });
  const [selectedRecord, setSelectedRecord] = useState<WinLossRecord | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const wonRecords = records.filter(r => r.result === "Won");
  const lostRecords = records.filter(r => r.result === "Lost");
  const winRate = records.length > 0 ? Math.round((wonRecords.length / records.length) * 100) : 0;
  const wonValue = wonRecords.reduce((s, r) => s + r.value, 0);
  const lostValue = lostRecords.reduce((s, r) => s + r.value, 0);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredRecords = activeTab === "all" ? records :
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
    <>
      <EnterprisePageHeader
        title="Win/Loss Analysis"
        subtitle="Track outcomes and competitive intelligence"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Win Rate" value={`${winRate}%`} trend={winRate >= 50 ? "up" : "down"} />
              <StatCard label="Won Value" value={formatCurrency(wonValue)} />
              <StatCard label="Lost Value" value={formatCurrency(lostValue)} />
              <StatCard label="Total Opportunities" value={records.length.toString()} />
            </Grid>

            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Card>
                <Stack gap={4}>
                  <H3>Win Rate Trend</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">Current Period</Body>
                      <Body className="font-mono">{winRate}%</Body>
                    </Stack>
                    <ProgressBar value={winRate} />
                  </Stack>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    <Card>
                      <Stack className="text-center">
                        <Body className="font-mono">{wonRecords.length}</Body>
                        <Body size="sm" className="">Won</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack className="text-center">
                        <Body className="font-mono">{lostRecords.length}</Body>
                        <Body size="sm" className="">Lost</Body>
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
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                  <Tab active={isActive('won')} onClick={() => setActiveTab('won')}>Won</Tab>
                  <Tab active={isActive('lost')} onClick={() => setActiveTab('lost')}>Lost</Tab>
                </TabsList>
              </Tabs>
              <Button variant="outline" onClick={() => setShowAnalysisModal(true)}>View Analysis</Button>
            </Stack>

            <Table variant="dark">
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
                    <TableCell><Body size="sm" className="">{record.client}</Body></TableCell>
                    <TableCell><Body className="font-mono">{formatCurrency(record.value)}</Body></TableCell>
                    <TableCell><Badge variant={record.result === "Won" ? "solid" : "outline"}>{record.result}</Badge></TableCell>
                    <TableCell><Body size="sm" className="">{record.reason}</Body></TableCell>
                    <TableCell><Body size="sm" className="">{record.closeDate}</Body></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>Details</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" onClick={() => router.push("/opportunities")}>Opportunities</Button>
              <Button variant="outline" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        <ModalHeader><H3>Opportunity Details</H3></ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRecord.opportunity}</Body>
              <Badge variant={selectedRecord.result === "Won" ? "solid" : "outline"}>{selectedRecord.result}</Badge>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Client</Body><Body>{selectedRecord.client}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Value</Body><Body className="font-mono">{formatCurrency(selectedRecord.value)}</Body></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Close Date</Body><Body>{selectedRecord.closeDate}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Sales Rep</Body><Body>{selectedRecord.salesRep}</Body></Stack>
              </Grid>
              {selectedRecord.competitor && <Stack gap={1}><Body size="sm" className="">Lost To</Body><Body>{selectedRecord.competitor}</Body></Stack>}
              <Stack gap={1}><Body size="sm" className="">Reason</Body><Body>{selectedRecord.reason}</Body></Stack>
              {selectedRecord.lessons && <Stack gap={1}><Body size="sm" className="">Lessons Learned</Body><Body>{selectedRecord.lessons}</Body></Stack>}
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
              <Body size="sm" className="">Win Factors</Body>
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
              <Body size="sm" className="">Loss Factors</Body>
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
              <Body size="sm" className="">Competitors</Body>
              {["Competitor A", "Competitor B"].map((comp, idx) => (
                <Card key={idx}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>{comp}</Body>
                    <Body size="sm" className="">{lostRecords.filter(r => r.competitor === comp).length} wins against us</Body>
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
    </>
  );
}
