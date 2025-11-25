"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Credit" | "Debit";
  status: "Matched" | "Unmatched" | "Pending" | "Reconciled";
  matchedTo?: string;
  bankAccount: string;
}

interface ReconciliationSummary {
  account: string;
  bankBalance: number;
  bookBalance: number;
  difference: number;
  unmatchedItems: number;
  lastReconciled: string;
}

const mockTransactions: BankTransaction[] = [
  { id: "BNK-001", date: "2024-11-25", description: "Wire Transfer - Client ABC", amount: 45000, type: "Credit", status: "Matched", matchedTo: "INV-2024-089", bankAccount: "Operating" },
  { id: "BNK-002", date: "2024-11-25", description: "ACH Payment - Vendor XYZ", amount: -12500, type: "Debit", status: "Matched", matchedTo: "PO-2024-156", bankAccount: "Operating" },
  { id: "BNK-003", date: "2024-11-24", description: "Check #4521", amount: -3200, type: "Debit", status: "Unmatched", bankAccount: "Operating" },
  { id: "BNK-004", date: "2024-11-24", description: "Deposit", amount: 28750, type: "Credit", status: "Pending", bankAccount: "Operating" },
  { id: "BNK-005", date: "2024-11-23", description: "Wire Transfer - Client DEF", amount: 67500, type: "Credit", status: "Reconciled", matchedTo: "INV-2024-085", bankAccount: "Operating" },
  { id: "BNK-006", date: "2024-11-23", description: "Payroll", amount: -89000, type: "Debit", status: "Reconciled", matchedTo: "PAY-2024-047", bankAccount: "Payroll" },
];

const mockSummaries: ReconciliationSummary[] = [
  { account: "Operating Account", bankBalance: 485250.00, bookBalance: 481850.00, difference: 3400.00, unmatchedItems: 2, lastReconciled: "2024-11-20" },
  { account: "Payroll Account", bankBalance: 125000.00, bookBalance: 125000.00, difference: 0, unmatchedItems: 0, lastReconciled: "2024-11-23" },
  { account: "Reserve Account", bankBalance: 250000.00, bookBalance: 250000.00, difference: 0, unmatchedItems: 0, lastReconciled: "2024-11-15" },
];

export default function BankReconciliationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [accountFilter, setAccountFilter] = useState("All");

  const unmatchedCount = mockTransactions.filter(t => t.status === "Unmatched").length;
  const pendingCount = mockTransactions.filter(t => t.status === "Pending").length;
  const totalDifference = mockSummaries.reduce((sum, s) => sum + Math.abs(s.difference), 0);

  const filteredTransactions = accountFilter === "All" ? mockTransactions : mockTransactions.filter(t => t.bankAccount === accountFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Matched": case "Reconciled": return "text-green-400";
      case "Unmatched": return "text-red-400";
      case "Pending": return "text-yellow-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Bank Reconciliation</H1>
            <Label className="text-ink-400">Automated bank statement matching and reconciliation</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Unmatched" value={unmatchedCount} trend={unmatchedCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Review" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Difference" value={`$${totalDifference.toLocaleString()}`} trend={totalDifference > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Accounts" value={mockSummaries.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {unmatchedCount > 0 && (
            <Alert variant="warning">{unmatchedCount} transaction(s) require manual matching</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Transactions</Tab>
                <Tab active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>Account Summary</Tab>
                <Tab active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>Matching Rules</Tab>
              </TabsList>
            </Tabs>
            <Stack direction="horizontal" gap={4}>
              <Select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                <option value="All">All Accounts</option>
                <option value="Operating">Operating</option>
                <option value="Payroll">Payroll</option>
                <option value="Reserve">Reserve</option>
              </Select>
              <Button variant="outlineWhite">Import Statement</Button>
            </Stack>
          </Stack>

          <TabPanel active={activeTab === "transactions"}>
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Date</TableHead>
                  <TableHead className="text-ink-400">Description</TableHead>
                  <TableHead className="text-ink-400">Account</TableHead>
                  <TableHead className="text-ink-400">Amount</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Matched To</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="border-ink-800">
                    <TableCell><Label className="font-mono text-ink-300">{txn.date}</Label></TableCell>
                    <TableCell><Label className="text-white">{txn.description}</Label></TableCell>
                    <TableCell><Badge variant="outline">{txn.bankAccount}</Badge></TableCell>
                    <TableCell><Label className={`font-mono ${txn.amount > 0 ? "text-green-400" : "text-red-400"}`}>{txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString()}</Label></TableCell>
                    <TableCell><Label className={getStatusColor(txn.status)}>{txn.status}</Label></TableCell>
                    <TableCell><Label className="text-ink-400">{txn.matchedTo || "-"}</Label></TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        {txn.status === "Unmatched" && <Button variant="solid" size="sm">Match</Button>}
                        {txn.status === "Pending" && <Button variant="outline" size="sm">Review</Button>}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(txn)}>Details</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          <TabPanel active={activeTab === "accounts"}>
            <Grid cols={3} gap={4}>
              {mockSummaries.map((summary) => (
                <Card key={summary.account} className={`border-2 p-6 ${summary.difference > 0 ? "border-yellow-800 bg-yellow-900/10" : "border-ink-800 bg-ink-900/50"}`}>
                  <Stack gap={4}>
                    <Body className="font-display text-white">{summary.account}</Body>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Bank Balance</Label>
                        <Label className="font-mono text-white">${summary.bankBalance.toLocaleString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Book Balance</Label>
                        <Label className="font-mono text-white">${summary.bookBalance.toLocaleString()}</Label>
                      </Stack>
                    </Grid>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Difference</Label>
                      <Label className={`font-mono ${summary.difference > 0 ? "text-yellow-400" : "text-green-400"}`}>
                        ${summary.difference.toLocaleString()}
                      </Label>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Label size="xs" className="text-ink-500">Unmatched: {summary.unmatchedItems}</Label>
                      <Label size="xs" className="text-ink-500">Last: {summary.lastReconciled}</Label>
                    </Stack>
                    <Button variant="outline" size="sm">Reconcile</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === "rules"}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={4}>
                <H3>Auto-Matching Rules</H3>
                <Stack gap={3}>
                  {[
                    { name: "Invoice Payments", pattern: "Wire Transfer - Client*", action: "Match to open invoices by amount" },
                    { name: "Vendor Payments", pattern: "ACH Payment - Vendor*", action: "Match to approved POs" },
                    { name: "Payroll", pattern: "Payroll*", action: "Match to payroll batches" },
                  ].map((rule, idx) => (
                    <Card key={idx} className="p-4 border border-ink-700">
                      <Grid cols={3} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Label className="text-white">{rule.name}</Label>
                          <Label size="xs" className="text-ink-500">Pattern: {rule.pattern}</Label>
                        </Stack>
                        <Label className="text-ink-300">{rule.action}</Label>
                        <Stack direction="horizontal" gap={2} className="justify-end">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Badge variant="outline">Active</Badge>
                        </Stack>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
                <Button variant="outline">Add Rule</Button>
              </Stack>
            </Card>
          </TabPanel>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Run Auto-Match</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/finance")}>Back to Finance</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedTransaction} onClose={() => setSelectedTransaction(null)}>
        <ModalHeader><H3>Transaction Details</H3></ModalHeader>
        <ModalBody>
          {selectedTransaction && (
            <Stack gap={4}>
              <Body className="text-white">{selectedTransaction.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Date</Label><Label className="text-white">{selectedTransaction.date}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Account</Label><Label className="text-white">{selectedTransaction.bankAccount}</Label></Stack>
              </Grid>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Amount</Label>
                <Label className={`font-mono text-xl ${selectedTransaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {selectedTransaction.amount > 0 ? "+" : ""}${Math.abs(selectedTransaction.amount).toLocaleString()}
                </Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Label></Stack>
                {selectedTransaction.matchedTo && <Stack gap={1}><Label size="xs" className="text-ink-500">Matched To</Label><Label className="text-white">{selectedTransaction.matchedTo}</Label></Stack>}
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
          {selectedTransaction?.status === "Unmatched" && <Button variant="solid">Find Match</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
