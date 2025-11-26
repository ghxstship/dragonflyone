"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navigation } from "../../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from "@ghxstship/ui";

interface FloorSection {
  id: string;
  name: string;
  type: "GA Standing" | "GA Seated" | "Pit" | "VIP" | "ADA" | "Reserved";
  capacity: number;
  sold: number;
  price: number;
  status: "Available" | "Limited" | "Sold Out" | "Closed";
  color: string;
}

const mockSections: FloorSection[] = [
  { id: "SEC-001", name: "General Admission Floor", type: "GA Standing", capacity: 5000, sold: 3850, price: 75, status: "Available", color: "#3B82F6" },
  { id: "SEC-002", name: "Front Pit", type: "Pit", capacity: 500, sold: 500, price: 150, status: "Sold Out", color: "#EF4444" },
  { id: "SEC-003", name: "VIP Lounge", type: "VIP", capacity: 200, sold: 145, price: 250, status: "Limited", color: "#F59E0B" },
  { id: "SEC-004", name: "ADA Section", type: "ADA", capacity: 50, sold: 12, price: 75, status: "Available", color: "#10B981" },
  { id: "SEC-005", name: "GA Seated", type: "GA Seated", capacity: 1000, sold: 780, price: 85, status: "Available", color: "#8B5CF6" },
];

export default function FloorConfigPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState("layout");
  const [selectedSection, setSelectedSection] = useState<FloorSection | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalCapacity = mockSections.reduce((sum, s) => sum + s.capacity, 0);
  const totalSold = mockSections.reduce((sum, s) => sum + s.sold, 0);
  const totalRevenue = mockSections.reduce((sum, s) => sum + (s.sold * s.price), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "text-success-400";
      case "Limited": return "text-warning-400";
      case "Sold Out": return "text-error-400";
      case "Closed": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Floor Configuration</H1>
            <Body className="text-grey-600">Configure general admission areas and floor sections</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Capacity" value={totalCapacity.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Tickets Sold" value={totalSold.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Occupancy" value={`${((totalSold / totalCapacity) * 100).toFixed(0)}%`} className="border-2 border-black" />
            <StatCard label="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "layout"} onClick={() => setActiveTab("layout")}>Floor Layout</Tab>
              <Tab active={activeTab === "sections"} onClick={() => setActiveTab("sections")}>Sections</Tab>
              <Tab active={activeTab === "capacity"} onClick={() => setActiveTab("capacity")}>Capacity Management</Tab>
            </TabsList>

            <TabPanel active={activeTab === "layout"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <H3>Visual Floor Plan</H3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>Add Section</Button>
                  </Stack>
                  <Card className="h-96 bg-grey-100 border border-grey-200 relative overflow-hidden">
                    <Stack className="absolute inset-0 items-center justify-center">
                      <Label className="text-grey-500">Interactive Floor Plan Editor</Label>
                      <Body className="text-grey-400 text-sm">Drag and drop sections to configure layout</Body>
                    </Stack>
                    <Card className="absolute top-4 left-4 w-32 h-20 bg-info-500/20 border-2 border-info-500 flex items-center justify-center">
                      <Label className="text-info-700 text-xs">STAGE</Label>
                    </Card>
                    <Card className="absolute top-28 left-1/4 w-48 h-32 border-2 flex items-center justify-center" style={{ '--section-bg': `${mockSections[1].color}20`, '--section-border': mockSections[1].color, backgroundColor: 'var(--section-bg)', borderColor: 'var(--section-border)' } as React.CSSProperties}>
                      <Stack gap={1} className="text-center">
                        <Label className="text-xs font-bold">{mockSections[1].name}</Label>
                        <Label className="text-xs">{mockSections[1].capacity} cap</Label>
                      </Stack>
                    </Card>
                    <Card className="absolute top-28 right-4 w-24 h-32 border-2 flex items-center justify-center" style={{ '--section-bg': `${mockSections[2].color}20`, '--section-border': mockSections[2].color, backgroundColor: 'var(--section-bg)', borderColor: 'var(--section-border)' } as React.CSSProperties}>
                      <Stack gap={1} className="text-center">
                        <Label className="text-xs font-bold">VIP</Label>
                        <Label className="text-xs">{mockSections[2].capacity}</Label>
                      </Stack>
                    </Card>
                    <Card className="absolute bottom-4 left-4 right-4 h-32 border-2 flex items-center justify-center" style={{ '--section-bg': `${mockSections[0].color}20`, '--section-border': mockSections[0].color, backgroundColor: 'var(--section-bg)', borderColor: 'var(--section-border)' } as React.CSSProperties}>
                      <Stack gap={1} className="text-center">
                        <Label className="font-bold">{mockSections[0].name}</Label>
                        <Label className="text-sm">{mockSections[0].capacity.toLocaleString()} capacity</Label>
                      </Stack>
                    </Card>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "sections"}>
              <Stack gap={4}>
                {mockSections.map((section) => (
                  <Card key={section.id} className="border-2 border-black p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Card className="w-4 h-4 rounded" style={{ '--section-color': section.color, backgroundColor: 'var(--section-color)' } as React.CSSProperties} />
                        <Body className="font-bold">{section.name}</Body>
                        <Badge variant="outline">{section.type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">Capacity</Label>
                        <Label className="font-mono">{section.capacity.toLocaleString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">Sold</Label>
                        <Label className="font-mono">{section.sold.toLocaleString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">Price</Label>
                        <Label className="font-mono">${section.price}</Label>
                      </Stack>
                      <Label className={getStatusColor(section.status)}>{section.status}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSection(section)}>Edit</Button>
                        <Button variant="ghost" size="sm">Delete</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "capacity"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Capacity Overview</H3>
                    {mockSections.map((section) => (
                      <Stack key={section.id} gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label>{section.name}</Label>
                          <Label className="font-mono">{section.sold}/{section.capacity}</Label>
                        </Stack>
                        <Card className="h-3 bg-grey-200 rounded-full overflow-hidden">
                          <Card className="h-full rounded-full" style={{ '--progress-width': `${(section.sold / section.capacity) * 100}%`, '--section-color': section.color, width: 'var(--progress-width)', backgroundColor: 'var(--section-color)' } as React.CSSProperties} />
                        </Card>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Oversell Protection</H3>
                    <Alert variant="info">Oversell protection is enabled. Sales will automatically stop when capacity is reached.</Alert>
                    <Stack gap={2}>
                      <Label>Buffer Percentage</Label>
                      <Select className="border-grey-300">
                        <option value="0">No buffer (100% capacity)</option>
                        <option value="5">5% buffer (95% sellable)</option>
                        <option value="10">10% buffer (90% sellable)</option>
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Low Inventory Alert</Label>
                      <Input type="number" defaultValue="50" className="border-grey-300" />
                      <Label size="xs" className="text-grey-500">Alert when remaining tickets fall below this number</Label>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outline">Save Configuration</Button>
            <Button variant="solid">Publish Changes</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Floor Section</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Section Name" />
            <Select>
              <option value="">Section Type...</option>
              <option value="GA Standing">GA Standing</option>
              <option value="GA Seated">GA Seated</option>
              <option value="Pit">Pit</option>
              <option value="VIP">VIP</option>
              <option value="ADA">ADA</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="number" placeholder="Capacity" />
              <Input type="number" placeholder="Price ($)" />
            </Grid>
            <Stack gap={2}>
              <Label>Section Color</Label>
              <Input type="color" defaultValue="#3B82F6" className="h-10" />
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Section</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedSection} onClose={() => setSelectedSection(null)}>
        <ModalHeader><H3>Edit Section</H3></ModalHeader>
        <ModalBody>
          {selectedSection && (
            <Stack gap={4}>
              <Input defaultValue={selectedSection.name} />
              <Grid cols={2} gap={4}>
                <Input type="number" defaultValue={selectedSection.capacity} />
                <Input type="number" defaultValue={selectedSection.price} />
              </Grid>
              <Select defaultValue={selectedSection.status}>
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Closed">Closed</option>
              </Select>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSection(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedSection(null)}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
