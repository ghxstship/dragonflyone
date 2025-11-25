"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface AssetKit {
  id: string;
  name: string;
  category: string;
  itemCount: number;
  totalValue: number;
  status: "Available" | "Deployed" | "Partial";
  lastUsed?: string;
  description: string;
  items: { name: string; quantity: number; category: string }[];
}

const mockKits: AssetKit[] = [
  { id: "KIT-001", name: "Festival Main Stage Audio", category: "Audio", itemCount: 48, totalValue: 425000, status: "Available", lastUsed: "2024-11-15", description: "Complete L-Acoustics K2 system with subs and processing", items: [{ name: "L-Acoustics K2", quantity: 24, category: "Speakers" }, { name: "KS28 Subs", quantity: 16, category: "Speakers" }, { name: "LA12X Amps", quantity: 8, category: "Amplifiers" }] },
  { id: "KIT-002", name: "Corporate Event Lighting", category: "Lighting", itemCount: 32, totalValue: 85000, status: "Deployed", lastUsed: "2024-11-20", description: "Versatile lighting package for corporate events", items: [{ name: "Clay Paky Sharpy", quantity: 12, category: "Moving Lights" }, { name: "ETC Source Four", quantity: 16, category: "Conventionals" }, { name: "grandMA3", quantity: 1, category: "Consoles" }] },
  { id: "KIT-003", name: "Video Wall 20x10", category: "Video", itemCount: 200, totalValue: 320000, status: "Available", description: "ROE CB5 LED wall configuration", items: [{ name: "ROE CB5 Panels", quantity: 200, category: "LED" }, { name: "Brompton Processors", quantity: 4, category: "Processing" }] },
  { id: "KIT-004", name: "Outdoor Stage Package", category: "Staging", itemCount: 156, totalValue: 175000, status: "Partial", description: "40x32 outdoor stage with roof system", items: [{ name: "Stage Decks", quantity: 80, category: "Decking" }, { name: "Roof Sections", quantity: 24, category: "Roof" }, { name: "Legs 4ft", quantity: 52, category: "Support" }] },
];

const categories = ["All", "Audio", "Lighting", "Video", "Staging", "Rigging"];

export default function AssetKitsPage() {
  const router = useRouter();
  const [selectedKit, setSelectedKit] = useState<AssetKit | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredKits = categoryFilter === "All" ? mockKits : mockKits.filter(k => k.category === categoryFilter);
  const totalValue = mockKits.reduce((s, k) => s + k.totalValue, 0);
  const availableKits = mockKits.filter(k => k.status === "Available").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "text-green-400";
      case "Deployed": return "text-blue-400";
      case "Partial": return "text-yellow-400";
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
            <H1>Asset Kits</H1>
            <Label className="text-ink-400">Pre-configured equipment bundles and packages</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Kits" value={mockKits.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Available" value={availableKits} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Value" value={formatCurrency(totalValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Kit</Button>
          </Stack>

          <Grid cols={2} gap={4}>
            {filteredKits.map((kit) => (
              <Card key={kit.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{kit.name}</Body>
                      <Label className="text-ink-400">{kit.id}</Label>
                    </Stack>
                    <Stack gap={1} className="text-right">
                      <Badge variant="outline">{kit.category}</Badge>
                      <Label className={getStatusColor(kit.status)}>{kit.status}</Label>
                    </Stack>
                  </Stack>
                  <Label className="text-ink-300">{kit.description}</Label>
                  <Grid cols={3} gap={4}>
                    <Stack gap={1}><Label size="xs" className="text-ink-500">Items</Label><Label className="font-mono text-white">{kit.itemCount}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-500">Value</Label><Label className="font-mono text-white">{formatCurrency(kit.totalValue)}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-500">Last Used</Label><Label className="text-ink-300">{kit.lastUsed || "Never"}</Label></Stack>
                  </Grid>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedKit(kit)}>View Contents</Button>
                    {kit.status === "Available" && <Button variant="solid" size="sm">Deploy</Button>}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Asset Registry</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets/storage")}>Storage</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedKit} onClose={() => setSelectedKit(null)}>
        <ModalHeader><H3>{selectedKit?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedKit && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedKit.category}</Badge>
                <Label className={getStatusColor(selectedKit.status)}>{selectedKit.status}</Label>
              </Stack>
              <Label className="text-ink-300">{selectedKit.description}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Total Items</Label><Label className="font-mono text-white text-xl">{selectedKit.itemCount}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Total Value</Label><Label className="font-mono text-white text-xl">{formatCurrency(selectedKit.totalValue)}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Kit Contents</Label>
                <Table className="border border-ink-700">
                  <TableHeader>
                    <TableRow className="bg-ink-800">
                      <TableHead className="text-ink-400">Item</TableHead>
                      <TableHead className="text-ink-400">Category</TableHead>
                      <TableHead className="text-ink-400">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedKit.items.map((item, idx) => (
                      <TableRow key={idx} className="border-ink-700">
                        <TableCell><Label className="text-white">{item.name}</Label></TableCell>
                        <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                        <TableCell><Label className="font-mono text-white">{item.quantity}</Label></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedKit(null)}>Close</Button>
          <Button variant="outline">Edit Kit</Button>
          {selectedKit?.status === "Available" && <Button variant="solid">Deploy Kit</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Kit</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Kit Name" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Category...</option>
              {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input placeholder="Description" className="border-ink-700 bg-black text-white" />
            <Label className="text-ink-400">Add items from asset registry to build your kit</Label>
            <Button variant="outline">+ Add Assets</Button>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Kit</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
