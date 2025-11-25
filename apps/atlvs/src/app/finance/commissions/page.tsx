"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from "@ghxstship/ui";

interface CommissionRule {
  id: string;
  name: string;
  type: "Percentage" | "Flat" | "Tiered";
  baseRate: number;
  tiers?: { min: number; max: number; rate: number }[];
  appliesTo: "All Sales" | "New Business" | "Renewals" | "Upsells";
  active: boolean;
}

interface CommissionRecord {
  id: string;
  salesRep: string;
  dealId: string;
  dealName: string;
  client: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: "Pending" | "Approved" | "Paid" | "Disputed";
  closeDate: string;
  paymentDate?: string;
}

const mockRules: CommissionRule[] = [
  { id: "CR-001", name: "Standard Sales Commission", type: "Percentage", baseRate: 10, appliesTo: "All Sales", active: true },
  { id: "CR-002", name: "New Business Bonus", type: "Percentage", baseRate: 15, appliesTo: "New Business", active: true },
  { id: "CR-003", name: "Tiered Performance", type: "Tiered", baseRate: 8, tiers: [{ min: 0, max: 50000, rate: 8 }, { min: 50001, max: 100000, rate: 10 }, { min: 100001, max: 999999999, rate: 12 }], appliesTo: "All Sales", active: true },
  { id: "CR-004", name: "Renewal Commission", type: "Percentage", baseRate: 5, appliesTo: "Renewals", active: true },
];

const mockRecords: CommissionRecord[] = [
  { id: "COM-001", salesRep: "John Smith", dealId: "DEAL-156", dealName: "TechCorp Annual Conference", client: "TechCorp Events", dealValue: 125000, commissionRate: 12, commissionAmount: 15000, status: "Approved", closeDate: "2024-11-15" },
  { id: "COM-002", salesRep: "Jane Doe", dealId: "DEAL-157", dealName: "Festival Productions Partnership", client: "Festival Productions", dealValue: 85000, commissionRate: 15, commissionAmount: 12750, status: "Pending", closeDate: "2024-11-20" },
  { id: "COM-003", salesRep: "John Smith", dealId: "DEAL-158", dealName: "Corporate Events Renewal", client: "Corporate Events Inc", dealValue: 45000, commissionRate: 5, commissionAmount: 2250, status: "Paid", closeDate: "2024-11-01", paymentDate: "2024-11-15" },
  { id: "COM-004", salesRep: "Mike Johnson", dealId: "DEAL-159", dealName: "StartUp Launch Event", client: "StartUp Ventures", dealValue: 28000, commissionRate: 10, commissionAmount: 2800, status: "Disputed", closeDate: "2024-11-18" },
  { id: "COM-005", salesRep: "Jane Doe", dealId: "DEAL-160", dealName: "Media Group Awards Show", client: "Media Group LLC", dealValue: 95000, commissionRate: 10, commissionAmount: 9500, status: "Approved", closeDate: "2024-11-22" },
];

export default function CommissionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("records");
  const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("november");

  const totalCommissions = mockRecords.reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingCommissions = mockRecords.filter(r => r.status === "Pending" || r.status === "Approved").reduce((sum, r) => sum + r.commissionAmount, 0);
  const paidCommissions = mockRecords.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.commissionAmount, 0);
  const disputedCount = mockRecords.filter(r => r.status === "Disputed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "text-green-400";
      case "Approved": return "text-blue-400";
      case "Pending": return "text-yellow-400";
      case "Disputed": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const repSummary = mockRecords.reduce((acc, r) => {
    if (!acc[r.salesRep]) acc[r.salesRep] = { deals: 0, revenue: 0, commission: 0 };
    acc[r.salesRep].deals++;
    acc[r.salesRep].revenue += r.dealValue;
    acc[r.salesRep].commission += r.commissionAmount;
    return acc;
  }, {} as Record<string, { deals: number; revenue: number; commission: number }>);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Commission Management</H1>
            <Label className="text-ink-400">Calculate, track, and manage sales commissions</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Commissions" value={`$${(totalCommissions / 1000).toFixed(1)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Payout" value={`$${(pendingCommissions / 1000).toFixed(1)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Paid This Month" value={`$${(paidCommissions / 1000).toFixed(1)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Disputed" value={disputedCount} trend={disputedCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {disputedCount > 0 && (
            <Alert variant="warning">{disputedCount} commission record(s) are disputed and require review</Alert>
          )}

          <Grid cols={2} gap={4}>
            <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="november">November 2024</option>
              <option value="october">October 2024</option>
              <option value="q4">Q4 2024</option>
              <option value="ytd">Year to Date</option>
            </Select>
            <Button variant="outline" className="border-ink-700 text-ink-400">Run Commission Calculation</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "records"} onClick={() => setActiveTab("records")}>Commission Records</Tab>
              <Tab active={activeTab === "by-rep"} onClick={() => setActiveTab("by-rep")}>By Sales Rep</Tab>
              <Tab active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>Commission Rules</Tab>
            </TabsList>

            <TabPanel active={activeTab === "records"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecords.map((record) => (
                    <TableRow key={record.id} className={record.status === "Disputed" ? "bg-red-900/10" : ""}>
                      <TableCell><Label className="text-white">{record.salesRep}</Label></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="text-white">{record.dealName}</Body>
                          <Label size="xs" className="text-ink-500">{record.client}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="font-mono text-white">${record.dealValue.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-ink-300">{record.commissionRate}%</TableCell>
                      <TableCell className="font-mono text-green-400">${record.commissionAmount.toLocaleString()}</TableCell>
                      <TableCell><Label className={getStatusColor(record.status)}>{record.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>View</Button>
                          {record.status === "Pending" && <Button variant="outline" size="sm">Approve</Button>}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "by-rep"}>
              <Grid cols={3} gap={6}>
                {Object.entries(repSummary).map(([rep, data]) => (
                  <Card key={rep} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Body className="font-display text-white text-lg">{rep}</Body>
                      <Grid cols={3} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Deals</Label>
                          <Label className="font-mono text-white text-xl">{data.deals}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Revenue</Label>
                          <Label className="font-mono text-white text-xl">${(data.revenue / 1000).toFixed(0)}K</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Commission</Label>
                          <Label className="font-mono text-green-400 text-xl">${(data.commission / 1000).toFixed(1)}K</Label>
                        </Stack>
                      </Grid>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Effective Rate</Label>
                        <Label className="font-mono text-white">{((data.commission / data.revenue) * 100).toFixed(1)}%</Label>
                      </Stack>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "rules"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <H3>Commission Rules</H3>
                  <Button variant="outline" size="sm" onClick={() => setShowRuleModal(true)}>Add Rule</Button>
                </Stack>
                {mockRules.map((rule) => (
                  <Card key={rule.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="text-white">{rule.name}</Body>
                        <Badge variant="outline">{rule.type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Base Rate</Label>
                        <Label className="font-mono text-white">{rule.baseRate}%</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Applies To</Label>
                        <Label className="text-ink-300">{rule.appliesTo}</Label>
                      </Stack>
                      {rule.tiers && (
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Tiers</Label>
                          <Label className="text-ink-300">{rule.tiers.length} levels</Label>
                        </Stack>
                      )}
                      <Label className={rule.active ? "text-green-400" : "text-ink-500"}>{rule.active ? "Active" : "Inactive"}</Label>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite">Process Payouts</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Commission Statements</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/finance")}>Back to Finance</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        <ModalHeader><H3>Commission Details</H3></ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Sales Rep</Label><Label className="text-white">{selectedRecord.salesRep}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Deal</Label><Body className="text-white">{selectedRecord.dealName}</Body></Stack>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Client</Label><Label className="text-white">{selectedRecord.client}</Label></Stack>
              <Card className="p-4 bg-ink-800 border border-ink-700">
                <Grid cols={3} gap={4}>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Deal Value</Label><Label className="font-mono text-white">${selectedRecord.dealValue.toLocaleString()}</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Rate</Label><Label className="font-mono text-white">{selectedRecord.commissionRate}%</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Commission</Label><Label className="font-mono text-green-400">${selectedRecord.commissionAmount.toLocaleString()}</Label></Stack>
                </Grid>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Close Date</Label><Label className="font-mono text-white">{selectedRecord.closeDate}</Label></Stack>
                {selectedRecord.paymentDate && <Stack gap={1}><Label size="xs" className="text-ink-500">Payment Date</Label><Label className="font-mono text-white">{selectedRecord.paymentDate}</Label></Stack>}
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
          {selectedRecord?.status === "Pending" && <Button variant="solid">Approve</Button>}
          {selectedRecord?.status === "Approved" && <Button variant="solid">Mark Paid</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showRuleModal} onClose={() => setShowRuleModal(false)}>
        <ModalHeader><H3>Add Commission Rule</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Rule Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Type...</option>
                <option value="Percentage">Percentage</option>
                <option value="Flat">Flat Amount</option>
                <option value="Tiered">Tiered</option>
              </Select>
              <Input type="number" placeholder="Base Rate (%)" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Applies To...</option>
              <option value="All Sales">All Sales</option>
              <option value="New Business">New Business</option>
              <option value="Renewals">Renewals</option>
              <option value="Upsells">Upsells</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRuleModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowRuleModal(false)}>Add Rule</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
