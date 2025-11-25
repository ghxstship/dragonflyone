"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge,
} from "@ghxstship/ui";

interface Relationship {
  id: string;
  fromContact: { id: string; name: string; company?: string; type: string };
  toContact: { id: string; name: string; company?: string; type: string };
  relationshipType: "Reports To" | "Works With" | "Referred By" | "Partner" | "Vendor" | "Client";
  strength: "Strong" | "Medium" | "Weak";
  notes?: string;
  lastInteraction?: string;
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  company: string;
  influence: "High" | "Medium" | "Low";
  sentiment: "Champion" | "Supporter" | "Neutral" | "Skeptic" | "Blocker";
  decisionMaker: boolean;
}

const mockRelationships: Relationship[] = [
  { id: "REL-001", fromContact: { id: "C-001", name: "John Smith", company: "Acme Corp", type: "Client" }, toContact: { id: "C-002", name: "Sarah Johnson", company: "Acme Corp", type: "Client" }, relationshipType: "Reports To", strength: "Strong", lastInteraction: "2024-11-20" },
  { id: "REL-002", fromContact: { id: "C-003", name: "Mike Chen", company: "TechStart", type: "Partner" }, toContact: { id: "C-001", name: "John Smith", company: "Acme Corp", type: "Client" }, relationshipType: "Referred By", strength: "Medium", notes: "Met at conference" },
  { id: "REL-003", fromContact: { id: "C-004", name: "Lisa Park", company: "EventPro", type: "Vendor" }, toContact: { id: "C-005", name: "David Wilson", type: "Internal" }, relationshipType: "Vendor", strength: "Strong", lastInteraction: "2024-11-22" },
];

const mockStakeholders: Stakeholder[] = [
  { id: "STK-001", name: "Sarah Johnson", role: "VP Marketing", company: "Acme Corp", influence: "High", sentiment: "Champion", decisionMaker: true },
  { id: "STK-002", name: "John Smith", role: "Director Events", company: "Acme Corp", influence: "Medium", sentiment: "Supporter", decisionMaker: false },
  { id: "STK-003", name: "Robert Brown", role: "CFO", company: "Acme Corp", influence: "High", sentiment: "Neutral", decisionMaker: true },
  { id: "STK-004", name: "Emily Davis", role: "Procurement", company: "Acme Corp", influence: "Low", sentiment: "Skeptic", decisionMaker: false },
];

export default function RelationshipsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Champion": return "text-green-400";
      case "Supporter": return "text-blue-400";
      case "Neutral": return "text-ink-400";
      case "Skeptic": return "text-yellow-400";
      case "Blocker": return "text-red-400";
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
            <H1>Relationship Mapping</H1>
            <Label className="text-ink-400">Visualize and manage stakeholder relationships and org charts</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Relationships" value={mockRelationships.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Key Stakeholders" value={mockStakeholders.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Decision Makers" value={mockStakeholders.filter(s => s.decisionMaker).length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Champions" value={mockStakeholders.filter(s => s.sentiment === "Champion").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "map"} onClick={() => setActiveTab("map")}>Relationship Map</Tab>
              <Tab active={activeTab === "stakeholders"} onClick={() => setActiveTab("stakeholders")}>Stakeholder Analysis</Tab>
              <Tab active={activeTab === "list"} onClick={() => setActiveTab("list")}>Relationship List</Tab>
            </TabsList>

            <TabPanel active={activeTab === "map"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Organization Relationship Map</H3>
                  <Card className="h-96 bg-ink-800 border border-ink-700 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-ink-400">Interactive Org Chart</Label>
                      <Body className="text-ink-500">D3.js or similar visualization would render here</Body>
                      <Grid cols={3} gap={4} className="mt-4">
                        {mockStakeholders.slice(0, 3).map((s) => (
                          <Card key={s.id} className="p-3 bg-ink-900 border border-ink-700">
                            <Stack gap={1}>
                              <Label className="text-white">{s.name}</Label>
                              <Label size="xs" className="text-ink-400">{s.role}</Label>
                              <Label size="xs" className={getSentimentColor(s.sentiment)}>{s.sentiment}</Label>
                            </Stack>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "stakeholders"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Stakeholder</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Influence</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Decision Maker</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStakeholders.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{s.name}</Body>
                          <Label size="xs" className="text-ink-500">{s.company}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="text-ink-300">{s.role}</TableCell>
                      <TableCell><Badge variant="outline">{s.influence}</Badge></TableCell>
                      <TableCell><Label className={getSentimentColor(s.sentiment)}>{s.sentiment}</Label></TableCell>
                      <TableCell><Label className={s.decisionMaker ? "text-green-400" : "text-ink-500"}>{s.decisionMaker ? "Yes" : "No"}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "list"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>From</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Last Interaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRelationships.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{r.fromContact.name}</Label>
                          <Label size="xs" className="text-ink-500">{r.fromContact.company}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{r.relationshipType}</Badge></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{r.toContact.name}</Label>
                          <Label size="xs" className="text-ink-500">{r.toContact.company}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Label className={r.strength === "Strong" ? "text-green-400" : r.strength === "Medium" ? "text-yellow-400" : "text-ink-400"}>{r.strength}</Label></TableCell>
                      <TableCell className="font-mono text-ink-400">{r.lastInteraction || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Relationship</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Map</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crm")}>Back to CRM</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Relationship</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white"><option>Select contact...</option></Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Relationship type...</option>
              <option value="Reports To">Reports To</option>
              <option value="Works With">Works With</option>
              <option value="Referred By">Referred By</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white"><option>Select related contact...</option></Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
