"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface RateCard {
  id: string;
  vendorName: string;
  vendorId: string;
  category: string;
  effectiveDate: string;
  expirationDate: string;
  status: "Active" | "Expired" | "Pending";
  items: RateItem[];
  notes?: string;
}

interface RateItem {
  id: string;
  description: string;
  unit: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
  minimumCharge?: number;
}

const mockRateCards: RateCard[] = [
  {
    id: "RC-001",
    vendorName: "Pro Audio Solutions",
    vendorId: "VND-001",
    category: "Audio",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "Active",
    items: [
      { id: "RI-001", description: "L-Acoustics K2 Line Array (per box)", unit: "Day", dailyRate: 450, weeklyRate: 1800, monthlyRate: 5400 },
      { id: "RI-002", description: "L-Acoustics SB28 Subwoofer", unit: "Day", dailyRate: 200, weeklyRate: 800, monthlyRate: 2400 },
      { id: "RI-003", description: "DiGiCo SD12 Console", unit: "Day", dailyRate: 800, weeklyRate: 3200, monthlyRate: 9600 },
      { id: "RI-004", description: "Audio Tech (A1)", unit: "Day", dailyRate: 650, weeklyRate: 3250, minimumCharge: 650 },
    ],
    notes: "Volume discounts available for orders over $10,000",
  },
  {
    id: "RC-002",
    vendorName: "Elite Lighting Co",
    vendorId: "VND-002",
    category: "Lighting",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "Active",
    items: [
      { id: "RI-005", description: "Clay Paky Sharpy Plus", unit: "Day", dailyRate: 125, weeklyRate: 500, monthlyRate: 1500 },
      { id: "RI-006", description: "Robe MegaPointe", unit: "Day", dailyRate: 150, weeklyRate: 600, monthlyRate: 1800 },
      { id: "RI-007", description: "GrandMA3 Full Size", unit: "Day", dailyRate: 600, weeklyRate: 2400, monthlyRate: 7200 },
    ],
  },
  {
    id: "RC-003",
    vendorName: "Stage Systems Inc",
    vendorId: "VND-003",
    category: "Staging",
    effectiveDate: "2024-06-01",
    expirationDate: "2025-05-31",
    status: "Active",
    items: [
      { id: "RI-008", description: "40x60 Stage Deck", unit: "Day", dailyRate: 2500, weeklyRate: 10000 },
      { id: "RI-009", description: "Roof System (40x40)", unit: "Day", dailyRate: 3500, weeklyRate: 14000 },
      { id: "RI-010", description: "Stagehand (IATSE)", unit: "Day", dailyRate: 550, weeklyRate: 2750, minimumCharge: 550 },
    ],
  },
];

export default function RateCardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCards = mockRateCards.filter(rc => rc.status === "Active").length;

  const filteredCards = mockRateCards.filter(rc => {
    const matchesCategory = categoryFilter === "All" || rc.category === categoryFilter;
    const matchesSearch = rc.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || rc.status.toLowerCase() === activeTab;
    return matchesCategory && matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Expired": return "text-error-400";
      case "Pending": return "text-warning-400";
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
            <H1>Rate Cards & Pricing</H1>
            <Label className="text-ink-400">Vendor rate cards and pricing information</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Rate Cards" value={mockRateCards.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activeCards} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={3} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Line Items" value={mockRateCards.reduce((sum, rc) => sum + rc.items.length, 0)} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Staging">Staging</option>
              <option value="Video">Video</option>
            </Select>
            <Button variant="outlineWhite">Request New Rate Card</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
              <Tab active={activeTab === "expired"} onClick={() => setActiveTab("expired")}>Expired</Tab>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Stack gap={4}>
                {filteredCards.map((rateCard) => (
                  <Card key={rateCard.id} className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                    <Card className="p-4 bg-ink-800 border-b border-ink-700">
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-lg">{rateCard.vendorName}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline">{rateCard.category}</Badge>
                            <Label className="text-ink-400">Valid: {rateCard.effectiveDate} - {rateCard.expirationDate}</Label>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Label className={getStatusColor(rateCard.status)}>{rateCard.status}</Label>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRateCard(rateCard)}>View Details</Button>
                        </Stack>
                      </Stack>
                    </Card>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-ink-900/50">
                          <TableHead className="text-ink-400">Item</TableHead>
                          <TableHead className="text-ink-400">Unit</TableHead>
                          <TableHead className="text-ink-400 text-right">Daily</TableHead>
                          <TableHead className="text-ink-400 text-right">Weekly</TableHead>
                          <TableHead className="text-ink-400 text-right">Monthly</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rateCard.items.slice(0, 3).map((item) => (
                          <TableRow key={item.id} className="border-ink-800">
                            <TableCell><Label className="text-white">{item.description}</Label></TableCell>
                            <TableCell><Label className="text-ink-400">{item.unit}</Label></TableCell>
                            <TableCell className="text-right"><Label className="font-mono text-white">${item.dailyRate}</Label></TableCell>
                            <TableCell className="text-right"><Label className="font-mono text-white">${item.weeklyRate}</Label></TableCell>
                            <TableCell className="text-right"><Label className="font-mono text-ink-400">{item.monthlyRate ? `$${item.monthlyRate}` : "-"}</Label></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {rateCard.items.length > 3 && (
                      <Card className="p-2 text-center border-t border-ink-800">
                        <Label size="xs" className="text-ink-400">+{rateCard.items.length - 3} more items</Label>
                      </Card>
                    )}
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export All</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/vendors/compare")}>Compare Vendors</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/vendors")}>All Vendors</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRateCard} onClose={() => setSelectedRateCard(null)}>
        <ModalHeader><H3>Rate Card Details</H3></ModalHeader>
        <ModalBody>
          {selectedRateCard && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedRateCard.vendorName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Category</Label><Badge variant="outline">{selectedRateCard.category}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedRateCard.status)}>{selectedRateCard.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Effective</Label><Label className="text-white">{selectedRateCard.effectiveDate}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Expires</Label><Label className="text-white">{selectedRateCard.expirationDate}</Label></Stack>
              </Grid>
              {selectedRateCard.notes && (
                <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedRateCard.notes}</Body></Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">All Items ({selectedRateCard.items.length})</Label>
                {selectedRateCard.items.map((item) => (
                  <Card key={item.id} className="p-3 border border-ink-700">
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-white">{item.description}</Label>
                      <Label className="font-mono text-white">${item.dailyRate}/day</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRateCard(null)}>Close</Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">Create Quote</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
