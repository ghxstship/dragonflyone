"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface VendorContract {
  id: string;
  vendorName: string;
  contractType: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: "Active" | "Expiring" | "Expired" | "Pending Renewal";
  daysUntilExpiry: number;
  autoRenew: boolean;
  category: string;
}

const mockContracts: VendorContract[] = [
  { id: "VC-001", vendorName: "Audio House Inc", contractType: "Master Services", startDate: "2023-01-01", expiryDate: "2025-01-01", value: 250000, status: "Expiring", daysUntilExpiry: 37, autoRenew: false, category: "Audio" },
  { id: "VC-002", vendorName: "Lighting Solutions", contractType: "Equipment Rental", startDate: "2024-03-01", expiryDate: "2025-03-01", value: 180000, status: "Active", daysUntilExpiry: 96, autoRenew: true, category: "Lighting" },
  { id: "VC-003", vendorName: "Stage Builders Co", contractType: "Preferred Vendor", startDate: "2023-06-01", expiryDate: "2024-11-30", value: 320000, status: "Expired", daysUntilExpiry: -5, autoRenew: false, category: "Staging" },
  { id: "VC-004", vendorName: "Video Tech Pro", contractType: "Master Services", startDate: "2024-01-01", expiryDate: "2025-12-31", value: 150000, status: "Active", daysUntilExpiry: 402, autoRenew: true, category: "Video" },
  { id: "VC-005", vendorName: "Rigging Experts", contractType: "Equipment Rental", startDate: "2024-06-01", expiryDate: "2024-12-15", value: 95000, status: "Expiring", daysUntilExpiry: 20, autoRenew: false, category: "Rigging" },
];

export default function VendorContractsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);

  const expiringCount = mockContracts.filter(c => c.status === "Expiring").length;
  const expiredCount = mockContracts.filter(c => c.status === "Expired").length;
  const totalValue = mockContracts.reduce((s, c) => s + c.value, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Expiring": return "text-warning-400";
      case "Expired": return "text-error-400";
      case "Pending Renewal": return "text-info-400";
      default: return "text-ink-400";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredContracts = activeTab === "all" ? mockContracts :
    activeTab === "expiring" ? mockContracts.filter(c => c.status === "Expiring") :
    activeTab === "expired" ? mockContracts.filter(c => c.status === "Expired") :
    mockContracts.filter(c => c.status === "Active");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Vendor Contracts</H1>
            <Label className="text-ink-400">Contract expiration alerts and renewal workflows</Label>
          </Stack>

          {(expiringCount > 0 || expiredCount > 0) && (
            <Alert variant="warning">
              ⚠️ {expiringCount} contract(s) expiring within 90 days, {expiredCount} expired contract(s) require attention
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Total Contracts" value={mockContracts.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Value" value={formatCurrency(totalValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expiring Soon" value={expiringCount} trend={expiringCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expired" value={expiredCount} trend={expiredCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
              <Tab active={activeTab === "expiring"} onClick={() => setActiveTab("expiring")}>Expiring</Tab>
              <Tab active={activeTab === "expired"} onClick={() => setActiveTab("expired")}>Expired</Tab>
            </TabsList>
          </Tabs>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Vendor</TableHead>
                <TableHead className="text-ink-400">Type</TableHead>
                <TableHead className="text-ink-400">Category</TableHead>
                <TableHead className="text-ink-400">Value</TableHead>
                <TableHead className="text-ink-400">Expiry</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{contract.vendorName}</Label>
                      <Label size="xs" className="text-ink-500">{contract.id}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="text-ink-300">{contract.contractType}</Label></TableCell>
                  <TableCell><Badge variant="outline">{contract.category}</Badge></TableCell>
                  <TableCell><Label className="font-mono text-white">{formatCurrency(contract.value)}</Label></TableCell>
                  <TableCell>
                    <Stack gap={1}>
                      <Label className={getStatusColor(contract.status)}>{contract.expiryDate}</Label>
                      <Label size="xs" className={contract.daysUntilExpiry < 0 ? "text-error-400" : contract.daysUntilExpiry < 30 ? "text-warning-400" : "text-ink-500"}>
                        {contract.daysUntilExpiry < 0 ? `${Math.abs(contract.daysUntilExpiry)} days ago` : `${contract.daysUntilExpiry} days`}
                      </Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Label className={getStatusColor(contract.status)}>{contract.status}</Label>
                      {contract.autoRenew && <Badge variant="outline">Auto</Badge>}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedContract(contract)}>View</Button>
                      {(contract.status === "Expiring" || contract.status === "Expired") && (
                        <Button variant="solid" size="sm">Renew</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/vendors")}>Vendors</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/procurement")}>Procurement</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedContract} onClose={() => setSelectedContract(null)}>
        <ModalHeader><H3>Contract Details</H3></ModalHeader>
        <ModalBody>
          {selectedContract && (
            <Stack gap={4}>
              <Body className="text-white">{selectedContract.vendorName}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedContract.contractType}</Badge>
                <Badge variant="outline">{selectedContract.category}</Badge>
                <Label className={getStatusColor(selectedContract.status)}>{selectedContract.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Start Date</Label><Label className="text-white">{selectedContract.startDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Expiry Date</Label><Label className={getStatusColor(selectedContract.status)}>{selectedContract.expiryDate}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Contract Value</Label><Label className="font-mono text-white text-xl">{formatCurrency(selectedContract.value)}</Label></Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Auto-Renewal</Label>
                <Label className={selectedContract.autoRenew ? "text-success-400" : "text-ink-400"}>{selectedContract.autoRenew ? "Enabled" : "Disabled"}</Label>
              </Stack>
              {selectedContract.daysUntilExpiry <= 30 && selectedContract.daysUntilExpiry > 0 && (
                <Card className="p-4 border border-warning-800 bg-warning-900/20">
                  <Stack gap={2}>
                    <Label className="text-warning-400">⚠️ Contract Expiring Soon</Label>
                    <Label className="text-ink-300">This contract expires in {selectedContract.daysUntilExpiry} days. Initiate renewal process.</Label>
                  </Stack>
                </Card>
              )}
              {selectedContract.daysUntilExpiry < 0 && (
                <Card className="p-4 border border-error-800 bg-error-900/20">
                  <Stack gap={2}>
                    <Label className="text-error-400">⚠️ Contract Expired</Label>
                    <Label className="text-ink-300">This contract expired {Math.abs(selectedContract.daysUntilExpiry)} days ago. Immediate action required.</Label>
                  </Stack>
                </Card>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContract(null)}>Close</Button>
          <Button variant="outline">View Document</Button>
          {(selectedContract?.status === "Expiring" || selectedContract?.status === "Expired") && (
            <Button variant="solid">Initiate Renewal</Button>
          )}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
