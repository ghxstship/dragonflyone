"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface FlaggedTransaction {
  id: string;
  orderId: string;
  eventName: string;
  buyerEmail: string;
  quantity: number;
  flagReason: string;
  riskScore: number;
  status: "Flagged" | "Under Review" | "Cleared" | "Blocked";
  timestamp: string;
}

interface ProtectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
}

const mockFlagged: FlaggedTransaction[] = [
  { id: "FLG-001", orderId: "ORD-5421", eventName: "Summer Fest 2024", buyerEmail: "buyer1@email.com", quantity: 8, flagReason: "High quantity purchase", riskScore: 85, status: "Under Review", timestamp: "2024-11-25 14:30" },
  { id: "FLG-002", orderId: "ORD-5422", eventName: "Summer Fest 2024", buyerEmail: "buyer2@email.com", quantity: 4, flagReason: "Multiple purchases same IP", riskScore: 72, status: "Flagged", timestamp: "2024-11-25 14:35" },
  { id: "FLG-003", orderId: "ORD-5423", eventName: "Fall Concert", buyerEmail: "buyer3@email.com", quantity: 6, flagReason: "Known reseller pattern", riskScore: 92, status: "Blocked", timestamp: "2024-11-25 13:20" },
  { id: "FLG-004", orderId: "ORD-5424", eventName: "Summer Fest 2024", buyerEmail: "buyer4@email.com", quantity: 4, flagReason: "Velocity check failed", riskScore: 65, status: "Cleared", timestamp: "2024-11-25 12:45" },
];

const mockRules: ProtectionRule[] = [
  { id: "RULE-001", name: "Purchase Limit", description: "Maximum tickets per transaction", enabled: true, threshold: 6 },
  { id: "RULE-002", name: "Account Limit", description: "Maximum tickets per account per event", enabled: true, threshold: 8 },
  { id: "RULE-003", name: "IP Velocity", description: "Maximum purchases from same IP in 1 hour", enabled: true, threshold: 3 },
  { id: "RULE-004", name: "Bot Detection", description: "CAPTCHA and behavior analysis", enabled: true },
  { id: "RULE-005", name: "ID Verification", description: "Require ID match at entry", enabled: false },
  { id: "RULE-006", name: "Non-Transferable", description: "Tickets locked to purchaser", enabled: false },
  { id: "RULE-007", name: "Resale Price Cap", description: "Maximum resale price limit", enabled: true, threshold: 120 },
  { id: "RULE-008", name: "Official Resale Only", description: "Block third-party resale platforms", enabled: true },
];

export default function AntiScalpingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flagged");
  const [selectedTransaction, setSelectedTransaction] = useState<FlaggedTransaction | null>(null);

  const blockedCount = mockFlagged.filter(f => f.status === "Blocked").length;
  const underReview = mockFlagged.filter(f => f.status === "Under Review" || f.status === "Flagged").length;
  const enabledRules = mockRules.filter(r => r.enabled).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Cleared": return "text-success-600";
      case "Under Review": case "Flagged": return "text-warning-600";
      case "Blocked": return "text-error-600";
      default: return "text-ink-600";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-error-600";
    if (score >= 60) return "text-warning-600";
    return "text-success-600";
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Admin">
            <FooterLink href="/admin">Dashboard</FooterLink>
            <FooterLink href="/tickets/anti-scalping">Anti-Scalping</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Protection</Kicker>
              <H2 size="lg" className="text-white">Anti-Scalping Protection</H2>
              <Body className="text-on-dark-muted">Protect ticket sales from scalpers and bots</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Blocked Today" value={blockedCount} className="border-2 border-black" />
            <StatCard label="Under Review" value={underReview} className="border-2 border-black" />
            <StatCard label="Active Rules" value={enabledRules} className="border-2 border-black" />
            <StatCard label="Protection Rate" value="94%" trend="up" className="border-2 border-black" />
          </Grid>

          <Alert variant="info">
            Anti-scalping protection is actively monitoring all ticket purchases. Suspicious transactions are automatically flagged for review.
          </Alert>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "flagged"} onClick={() => setActiveTab("flagged")}>Flagged Transactions</Tab>
              <Tab active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>Protection Rules</Tab>
              <Tab active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>Analytics</Tab>
            </TabsList>

            <TabPanel active={activeTab === "flagged"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Order</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFlagged.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell><Label className="font-mono">{txn.orderId}</Label></TableCell>
                      <TableCell><Label>{txn.eventName}</Label></TableCell>
                      <TableCell><Label className="text-ink-500">{txn.buyerEmail}</Label></TableCell>
                      <TableCell><Label className="font-mono">{txn.quantity}</Label></TableCell>
                      <TableCell><Badge variant="outline">{txn.flagReason}</Badge></TableCell>
                      <TableCell><Label className={getRiskColor(txn.riskScore)}>{txn.riskScore}%</Label></TableCell>
                      <TableCell><Label className={getStatusColor(txn.status)}>{txn.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(txn)}>Review</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "rules"}>
              <Stack gap={4}>
                {mockRules.map((rule) => (
                  <Card key={rule.id} className={`border-2 p-4 ${rule.enabled ? "border-black" : "border-ink-200"}`}>
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-bold">{rule.name}</Body>
                        <Label className="text-ink-500">{rule.description}</Label>
                      </Stack>
                      {rule.threshold && (
                        <Stack gap={1}>
                          <Label className="text-ink-500">Threshold</Label>
                          <Label className="font-mono">{rule.threshold}{rule.id === "RULE-007" ? "%" : ""}</Label>
                        </Stack>
                      )}
                      <Badge variant={rule.enabled ? "solid" : "outline"}>
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Stack direction="horizontal" gap={2} className="justify-end">
                        <Button variant="outline" size="sm">Configure</Button>
                        <Button variant={rule.enabled ? "outline" : "solid"} size="sm">
                          {rule.enabled ? "Disable" : "Enable"}
                        </Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "analytics"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Detection Summary (Last 30 Days)</H3>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}><Label className="text-ink-500">Total Flagged</Label><Label className="font-mono text-h5-md">247</Label></Stack>
                      <Stack gap={1}><Label className="text-ink-500">Blocked</Label><Label className="font-mono text-h5-md text-error-600">89</Label></Stack>
                      <Stack gap={1}><Label className="text-ink-500">Cleared</Label><Label className="font-mono text-h5-md text-success-600">142</Label></Stack>
                      <Stack gap={1}><Label className="text-ink-500">Pending</Label><Label className="font-mono text-h5-md text-warning-600">16</Label></Stack>
                    </Grid>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Top Flag Reasons</H3>
                    <Stack gap={3}>
                      {[
                        { reason: "High quantity purchase", count: 89 },
                        { reason: "Multiple purchases same IP", count: 67 },
                        { reason: "Known reseller pattern", count: 45 },
                        { reason: "Bot behavior detected", count: 32 },
                        { reason: "Velocity check failed", count: 14 },
                      ].map((item, idx) => (
                        <Stack key={idx} direction="horizontal" className="justify-between">
                          <Label>{item.reason}</Label>
                          <Label className="font-mono">{item.count}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push("/admin/tickets")}>Ticket Management</Button>
            <Button variant="outlineInk" onClick={() => router.push("/admin")}>Admin Dashboard</Button>
          </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedTransaction} onClose={() => setSelectedTransaction(null)}>
        <ModalHeader><H3>Review Transaction</H3></ModalHeader>
        <ModalBody>
          {selectedTransaction && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Order ID</Label><Label className="font-mono">{selectedTransaction.orderId}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Risk Score</Label><Label className={getRiskColor(selectedTransaction.riskScore)}>{selectedTransaction.riskScore}%</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-500">Event</Label><Label>{selectedTransaction.eventName}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-500">Buyer</Label><Label>{selectedTransaction.buyerEmail}</Label></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Quantity</Label><Label className="font-mono">{selectedTransaction.quantity}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Timestamp</Label><Label>{selectedTransaction.timestamp}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-500">Flag Reason</Label><Badge variant="outline">{selectedTransaction.flagReason}</Badge></Stack>
              <Stack gap={1}><Label className="text-ink-500">Current Status</Label><Label className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
          <Button variant="outline" className="text-success-600">Clear</Button>
          <Button variant="solid" className="bg-error-600">Block</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
