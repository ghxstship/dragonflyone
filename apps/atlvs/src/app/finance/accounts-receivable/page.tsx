"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: "Draft" | "Sent" | "Viewed" | "Paid" | "Overdue" | "Partial";
  paidAmount: number;
  project?: string;
  daysPastDue?: number;
  lastReminder?: string;
}

interface CollectionAction {
  id: string;
  invoiceId: string;
  type: "Reminder" | "Phone Call" | "Final Notice" | "Collections";
  date: string;
  notes?: string;
  result?: string;
}

const mockInvoices: Invoice[] = [
  { id: "INV-001", invoiceNumber: "INV-2024-0156", client: "TechCorp Events", clientEmail: "ap@techcorp.com", amount: 45000, dueDate: "2024-11-15", issueDate: "2024-10-15", status: "Overdue", paidAmount: 0, project: "Annual Conference", daysPastDue: 9, lastReminder: "2024-11-20" },
  { id: "INV-002", invoiceNumber: "INV-2024-0157", client: "Festival Productions", clientEmail: "billing@festprod.com", amount: 125000, dueDate: "2024-11-30", issueDate: "2024-11-01", status: "Partial", paidAmount: 62500, project: "Summer Fest 2024" },
  { id: "INV-003", invoiceNumber: "INV-2024-0158", client: "Corporate Events Inc", clientEmail: "accounts@corpevents.com", amount: 28500, dueDate: "2024-12-01", issueDate: "2024-11-01", status: "Sent", paidAmount: 0, project: "Holiday Gala" },
  { id: "INV-004", invoiceNumber: "INV-2024-0159", client: "StartUp Ventures", clientEmail: "finance@startup.io", amount: 15000, dueDate: "2024-10-30", issueDate: "2024-10-01", status: "Overdue", paidAmount: 0, project: "Product Launch", daysPastDue: 25 },
  { id: "INV-005", invoiceNumber: "INV-2024-0160", client: "Media Group LLC", clientEmail: "ap@mediagroup.com", amount: 67500, dueDate: "2024-11-20", issueDate: "2024-10-20", status: "Paid", paidAmount: 67500, project: "Awards Show" },
];

const agingBuckets = [
  { label: "Current", range: "0-30 days", amount: 153500, count: 3 },
  { label: "31-60 Days", range: "31-60 days", amount: 45000, count: 1 },
  { label: "61-90 Days", range: "61-90 days", amount: 15000, count: 1 },
  { label: "90+ Days", range: "90+ days", amount: 0, count: 0 },
];

export default function AccountsReceivablePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("outstanding");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const totalOutstanding = mockInvoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const overdueAmount = mockInvoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const overdueCount = mockInvoices.filter(i => i.status === "Overdue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "text-green-400";
      case "Sent": case "Viewed": return "text-blue-400";
      case "Partial": return "text-yellow-400";
      case "Overdue": return "text-red-400";
      case "Draft": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  const filteredInvoices = activeTab === "all" ? mockInvoices : 
    activeTab === "outstanding" ? mockInvoices.filter(i => i.status !== "Paid") :
    activeTab === "overdue" ? mockInvoices.filter(i => i.status === "Overdue") :
    mockInvoices.filter(i => i.status === "Paid");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Accounts Receivable</H1>
            <Label className="text-ink-400">Invoice tracking, collections, and payment management</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Outstanding" value={`$${(totalOutstanding / 1000).toFixed(0)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue Amount" value={`$${(overdueAmount / 1000).toFixed(0)}K`} trend={overdueAmount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue Invoices" value={overdueCount} trend={overdueCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Days to Pay" value="28" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {overdueCount > 0 && (
            <Alert variant="warning">{overdueCount} invoice(s) are overdue totaling ${overdueAmount.toLocaleString()}</Alert>
          )}

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
            <Stack gap={3}>
              <H3>Aging Summary</H3>
              <Grid cols={4} gap={4}>
                {agingBuckets.map((bucket) => (
                  <Card key={bucket.label} className={`p-4 border ${bucket.amount > 0 && bucket.label !== "Current" ? "border-yellow-800 bg-yellow-900/10" : "border-ink-700 bg-ink-800"}`}>
                    <Stack gap={2}>
                      <Label className="text-ink-400">{bucket.label}</Label>
                      <Label className="font-mono text-white text-xl">${(bucket.amount / 1000).toFixed(0)}K</Label>
                      <Label size="xs" className="text-ink-500">{bucket.count} invoice(s)</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "outstanding"} onClick={() => setActiveTab("outstanding")}>Outstanding</Tab>
              <Tab active={activeTab === "overdue"} onClick={() => setActiveTab("overdue")}>Overdue</Tab>
              <Tab active={activeTab === "paid"} onClick={() => setActiveTab("paid")}>Paid</Tab>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className={invoice.status === "Overdue" ? "bg-red-900/10" : ""}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="font-mono text-white">{invoice.invoiceNumber}</Label>
                          {invoice.project && <Label size="xs" className="text-ink-500">{invoice.project}</Label>}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="text-white">{invoice.client}</Body>
                          <Label size="xs" className="text-ink-500">{invoice.clientEmail}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="font-mono text-white">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="font-mono text-ink-300">{invoice.dueDate}</Label>
                          {invoice.daysPastDue && <Label size="xs" className="text-red-400">{invoice.daysPastDue} days overdue</Label>}
                        </Stack>
                      </TableCell>
                      <TableCell><Label className={getStatusColor(invoice.status)}>{invoice.status}</Label></TableCell>
                      <TableCell className="font-mono text-white">${(invoice.amount - invoice.paidAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>View</Button>
                          {invoice.status !== "Paid" && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}>Record Payment</Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite">Create Invoice</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => setShowReminderModal(true)}>Send Reminders</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/finance")}>Back to Finance</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedInvoice && !showPaymentModal} onClose={() => setSelectedInvoice(null)}>
        <ModalHeader><H3>Invoice Details</H3></ModalHeader>
        <ModalBody>
          {selectedInvoice && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={1}>
                  <Label className="font-mono text-white text-xl">{selectedInvoice.invoiceNumber}</Label>
                  <Label className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Label>
                </Stack>
                <Label className="font-mono text-white text-2xl">${selectedInvoice.amount.toLocaleString()}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Client</Label><Label className="text-white">{selectedInvoice.client}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Email</Label><Label className="text-white">{selectedInvoice.clientEmail}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Issue Date</Label><Label className="font-mono text-white">{selectedInvoice.issueDate}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Due Date</Label><Label className="font-mono text-white">{selectedInvoice.dueDate}</Label></Stack>
              </Grid>
              {selectedInvoice.project && <Stack gap={1}><Label size="xs" className="text-ink-500">Project</Label><Label className="text-white">{selectedInvoice.project}</Label></Stack>}
              <Card className="p-4 bg-ink-800 border border-ink-700">
                <Grid cols={3} gap={4}>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Total</Label><Label className="font-mono text-white">${selectedInvoice.amount.toLocaleString()}</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Paid</Label><Label className="font-mono text-green-400">${selectedInvoice.paidAmount.toLocaleString()}</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Balance</Label><Label className="font-mono text-white">${(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString()}</Label></Stack>
                </Grid>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
          <Button variant="outline">Send Reminder</Button>
          <Button variant="solid" onClick={() => setShowPaymentModal(true)}>Record Payment</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showPaymentModal} onClose={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}>
        <ModalHeader><H3>Record Payment</H3></ModalHeader>
        <ModalBody>
          {selectedInvoice && (
            <Stack gap={4}>
              <Label className="text-white">{selectedInvoice.invoiceNumber} - {selectedInvoice.client}</Label>
              <Card className="p-3 bg-ink-800 border border-ink-700">
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-ink-400">Balance Due</Label>
                  <Label className="font-mono text-white">${(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString()}</Label>
                </Stack>
              </Card>
              <Stack gap={2}>
                <Label>Payment Amount</Label>
                <Input type="number" placeholder="0.00" defaultValue={selectedInvoice.amount - selectedInvoice.paidAmount} className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Payment Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Payment Method</Label>
                <Select className="border-ink-700 bg-black text-white">
                  <option value="check">Check</option>
                  <option value="ach">ACH Transfer</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="card">Credit Card</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label>Reference Number</Label>
                <Input placeholder="Check # or transaction ID" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}>Record Payment</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showReminderModal} onClose={() => setShowReminderModal(false)}>
        <ModalHeader><H3>Send Payment Reminders</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Alert variant="info">This will send reminder emails to all clients with outstanding invoices</Alert>
            <Stack gap={2}>
              <Label>Select Invoices</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="overdue">Overdue Only ({overdueCount})</option>
                <option value="all">All Outstanding ({mockInvoices.filter(i => i.status !== "Paid").length})</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Reminder Type</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="friendly">Friendly Reminder</option>
                <option value="urgent">Urgent Notice</option>
                <option value="final">Final Notice</option>
              </Select>
            </Stack>
            <Textarea placeholder="Additional message (optional)..." className="border-ink-700 bg-black text-white" rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowReminderModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowReminderModal(false)}>Send Reminders</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
