"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface CreditCard {
  id: string;
  lastFour: string;
  cardHolder: string;
  type: "Visa" | "Mastercard" | "Amex";
  limit: number;
  balance: number;
  available: number;
  status: "Active" | "Frozen" | "Closed";
  department: string;
}

interface Transaction {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  status: "Pending" | "Posted" | "Disputed";
  receipt?: boolean;
}

const mockCards: CreditCard[] = [
  { id: "CC-001", lastFour: "4521", cardHolder: "John Smith", type: "Visa", limit: 25000, balance: 8450, available: 16550, status: "Active", department: "Production" },
  { id: "CC-002", lastFour: "7832", cardHolder: "Sarah Johnson", type: "Amex", limit: 50000, balance: 12300, available: 37700, status: "Active", department: "Executive" },
  { id: "CC-003", lastFour: "9156", cardHolder: "Mike Davis", type: "Mastercard", limit: 15000, balance: 3200, available: 11800, status: "Active", department: "Operations" },
  { id: "CC-004", lastFour: "2847", cardHolder: "Emily Chen", type: "Visa", limit: 10000, balance: 0, available: 10000, status: "Frozen", department: "Marketing" },
];

const mockTransactions: Transaction[] = [
  { id: "TXN-001", cardId: "CC-001", merchant: "Audio Equipment Co", amount: 2450, date: "2024-11-24", category: "Equipment", status: "Posted", receipt: true },
  { id: "TXN-002", cardId: "CC-002", merchant: "Delta Airlines", amount: 1890, date: "2024-11-23", category: "Travel", status: "Posted", receipt: true },
  { id: "TXN-003", cardId: "CC-001", merchant: "Staples", amount: 156, date: "2024-11-23", category: "Office Supplies", status: "Pending" },
  { id: "TXN-004", cardId: "CC-003", merchant: "Hilton Hotels", amount: 890, date: "2024-11-22", category: "Travel", status: "Posted", receipt: false },
  { id: "TXN-005", cardId: "CC-002", merchant: "Amazon Business", amount: 567, date: "2024-11-22", category: "Supplies", status: "Disputed" },
];

export default function CreditCardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("cards");
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const totalLimit = mockCards.reduce((s, c) => s + c.limit, 0);
  const totalBalance = mockCards.reduce((s, c) => s + c.balance, 0);
  const pendingCount = mockTransactions.filter(t => t.status === "Pending").length;
  const missingReceipts = mockTransactions.filter(t => t.status === "Posted" && !t.receipt).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": case "Posted": return "text-green-400";
      case "Pending": return "text-yellow-400";
      case "Frozen": case "Disputed": return "text-red-400";
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
            <H1>Credit Card Management</H1>
            <Label className="text-ink-400">Corporate credit card integration and reconciliation</Label>
          </Stack>

          {missingReceipts > 0 && (
            <Alert variant="warning">
              ⚠️ {missingReceipts} transaction(s) missing receipts - please upload documentation
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Total Credit Limit" value={formatCurrency(totalLimit)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Balance" value={formatCurrency(totalBalance)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Transactions" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Missing Receipts" value={missingReceipts} trend={missingReceipts > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "cards"} onClick={() => setActiveTab("cards")}>Cards</Tab>
              <Tab active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Transactions</Tab>
              <Tab active={activeTab === "reconciliation"} onClick={() => setActiveTab("reconciliation")}>Reconciliation</Tab>
            </TabsList>

            <TabPanel active={activeTab === "cards"}>
              <Grid cols={2} gap={4}>
                {mockCards.map((card) => (
                  <Card key={card.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{card.cardHolder}</Body>
                          <Label className="text-ink-400">{card.department}</Label>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Badge variant="outline">{card.type}</Badge>
                          <Label className={getStatusColor(card.status)}>{card.status}</Label>
                        </Stack>
                      </Stack>
                      <Label className="font-mono text-white text-xl">•••• •••• •••• {card.lastFour}</Label>
                      <Grid cols={3} gap={4}>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Limit</Label><Label className="font-mono text-white">{formatCurrency(card.limit)}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Balance</Label><Label className="font-mono text-white">{formatCurrency(card.balance)}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Available</Label><Label className="font-mono text-green-400">{formatCurrency(card.available)}</Label></Stack>
                      </Grid>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCard(card)}>Manage</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "transactions"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Date</TableHead>
                    <TableHead className="text-ink-400">Merchant</TableHead>
                    <TableHead className="text-ink-400">Card</TableHead>
                    <TableHead className="text-ink-400">Category</TableHead>
                    <TableHead className="text-ink-400">Amount</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Receipt</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((txn) => (
                    <TableRow key={txn.id} className="border-ink-800">
                      <TableCell><Label className="text-ink-300">{txn.date}</Label></TableCell>
                      <TableCell><Label className="text-white">{txn.merchant}</Label></TableCell>
                      <TableCell><Label className="font-mono text-ink-400">•••{mockCards.find(c => c.id === txn.cardId)?.lastFour}</Label></TableCell>
                      <TableCell><Badge variant="outline">{txn.category}</Badge></TableCell>
                      <TableCell><Label className="font-mono text-white">{formatCurrency(txn.amount)}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(txn.status)}>{txn.status}</Label></TableCell>
                      <TableCell>{txn.receipt ? <Label className="text-green-400">✓</Label> : <Label className="text-red-400">✗</Label>}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(txn)}>Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "reconciliation"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Monthly Reconciliation</H3>
                  <Grid cols={2} gap={4}>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="">Select Card...</option>
                      {mockCards.map(c => <option key={c.id} value={c.id}>•••{c.lastFour} - {c.cardHolder}</option>)}
                    </Select>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="">Select Period...</option>
                      <option value="2024-11">November 2024</option>
                      <option value="2024-10">October 2024</option>
                    </Select>
                  </Grid>
                  <Grid cols={3} gap={4}>
                    <Card className="p-4 border border-ink-700 text-center">
                      <Label className="font-mono text-white text-xl">$24,053</Label>
                      <Label size="xs" className="text-ink-500">Statement Balance</Label>
                    </Card>
                    <Card className="p-4 border border-ink-700 text-center">
                      <Label className="font-mono text-white text-xl">$23,897</Label>
                      <Label size="xs" className="text-ink-500">Recorded Transactions</Label>
                    </Card>
                    <Card className="p-4 border border-ink-700 text-center">
                      <Label className="font-mono text-yellow-400 text-xl">$156</Label>
                      <Label size="xs" className="text-ink-500">Variance</Label>
                    </Card>
                  </Grid>
                  <Button variant="solid">Start Reconciliation</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/finance")}>Finance</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/finance/expenses")}>Expenses</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCard} onClose={() => setSelectedCard(null)}>
        <ModalHeader><H3>Card Details</H3></ModalHeader>
        <ModalBody>
          {selectedCard && (
            <Stack gap={4}>
              <Label className="font-mono text-white text-2xl">•••• •••• •••• {selectedCard.lastFour}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Cardholder</Label><Label className="text-white">{selectedCard.cardHolder}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Department</Label><Label className="text-white">{selectedCard.department}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Limit</Label><Label className="font-mono text-white">{formatCurrency(selectedCard.limit)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Balance</Label><Label className="font-mono text-white">{formatCurrency(selectedCard.balance)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Available</Label><Label className="font-mono text-green-400">{formatCurrency(selectedCard.available)}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Status</Label><Label className={getStatusColor(selectedCard.status)}>{selectedCard.status}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCard(null)}>Close</Button>
          {selectedCard?.status === "Active" && <Button variant="outline" className="text-red-400">Freeze Card</Button>}
          <Button variant="solid">View Transactions</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedTransaction} onClose={() => setSelectedTransaction(null)}>
        <ModalHeader><H3>Transaction Details</H3></ModalHeader>
        <ModalBody>
          {selectedTransaction && (
            <Stack gap={4}>
              <Body className="text-white">{selectedTransaction.merchant}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Amount</Label><Label className="font-mono text-white text-xl">{formatCurrency(selectedTransaction.amount)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Date</Label><Label className="text-white">{selectedTransaction.date}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Category</Label><Badge variant="outline">{selectedTransaction.category}</Badge></Stack>
                <Stack gap={1}><Label className="text-ink-400">Status</Label><Label className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Receipt</Label><Label className={selectedTransaction.receipt ? "text-green-400" : "text-red-400"}>{selectedTransaction.receipt ? "Uploaded" : "Missing"}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
          {!selectedTransaction?.receipt && <Button variant="solid">Upload Receipt</Button>}
          {selectedTransaction?.status !== "Disputed" && <Button variant="outline" className="text-red-400">Dispute</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
