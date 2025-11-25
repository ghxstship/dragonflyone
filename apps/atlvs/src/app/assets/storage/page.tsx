"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface StorageLocation {
  id: string;
  name: string;
  type: "Warehouse" | "Bay" | "Rack" | "Shelf" | "Container";
  capacity: number;
  used: number;
  category: string;
  address?: string;
  climate: "Standard" | "Climate Controlled" | "Outdoor";
  status: "Active" | "Full" | "Maintenance";
}

interface OptimizationSuggestion {
  id: string;
  type: "Consolidate" | "Relocate" | "Reorganize";
  description: string;
  savings: string;
  priority: "High" | "Medium" | "Low";
}

const mockLocations: StorageLocation[] = [
  { id: "LOC-001", name: "Main Warehouse", type: "Warehouse", capacity: 50000, used: 38500, category: "All", address: "123 Industrial Blvd", climate: "Climate Controlled", status: "Active" },
  { id: "LOC-002", name: "Audio Bay A", type: "Bay", capacity: 5000, used: 4200, category: "Audio", climate: "Climate Controlled", status: "Active" },
  { id: "LOC-003", name: "Lighting Bay B", type: "Bay", capacity: 5000, used: 4800, category: "Lighting", climate: "Standard", status: "Active" },
  { id: "LOC-004", name: "Video Storage", type: "Bay", capacity: 3000, used: 3000, category: "Video", climate: "Climate Controlled", status: "Full" },
  { id: "LOC-005", name: "Rigging Container", type: "Container", capacity: 2000, used: 1500, category: "Rigging", climate: "Outdoor", status: "Active" },
  { id: "LOC-006", name: "Staging Yard", type: "Warehouse", capacity: 20000, used: 12000, category: "Staging", address: "456 Staging Way", climate: "Outdoor", status: "Active" },
];

const mockSuggestions: OptimizationSuggestion[] = [
  { id: "OPT-001", type: "Consolidate", description: "Combine Audio Bay A overflow with Main Warehouse empty racks", savings: "15% space recovery", priority: "High" },
  { id: "OPT-002", type: "Relocate", description: "Move rarely used video equipment to off-site storage", savings: "$2,400/month", priority: "Medium" },
  { id: "OPT-003", type: "Reorganize", description: "Implement vertical storage for lighting fixtures", savings: "20% floor space", priority: "High" },
];

export default function StorageOptimizationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("locations");
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

  const totalCapacity = mockLocations.reduce((s, l) => s + l.capacity, 0);
  const totalUsed = mockLocations.reduce((s, l) => s + l.used, 0);
  const utilizationRate = Math.round((totalUsed / totalCapacity) * 100);
  const fullLocations = mockLocations.filter(l => l.status === "Full").length;

  const getUtilizationColor = (used: number, capacity: number) => {
    const rate = (used / capacity) * 100;
    if (rate >= 95) return "text-red-400";
    if (rate >= 80) return "text-yellow-400";
    return "text-green-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
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
            <H1>Storage Optimization</H1>
            <Label className="text-ink-400">Storage location management and optimization recommendations</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Capacity" value={`${(totalCapacity / 1000).toFixed(0)}K sq ft`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Utilization" value={`${utilizationRate}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Locations" value={mockLocations.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Full Locations" value={fullLocations} trend={fullLocations > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "locations"} onClick={() => setActiveTab("locations")}>Locations</Tab>
              <Tab active={activeTab === "optimization"} onClick={() => setActiveTab("optimization")}>Optimization</Tab>
              <Tab active={activeTab === "map"} onClick={() => setActiveTab("map")}>Warehouse Map</Tab>
            </TabsList>

            <TabPanel active={activeTab === "locations"}>
              <Grid cols={3} gap={4}>
                {mockLocations.map((location) => (
                  <Card key={location.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{location.name}</Body>
                          <Label className="text-ink-400">{location.type}</Label>
                        </Stack>
                        <Badge variant={location.status === "Full" ? "solid" : "outline"}>{location.status}</Badge>
                      </Stack>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-ink-400">Utilization</Label>
                          <Label className={getUtilizationColor(location.used, location.capacity)}>
                            {Math.round((location.used / location.capacity) * 100)}%
                          </Label>
                        </Stack>
                        <ProgressBar value={(location.used / location.capacity) * 100} className="h-2" />
                      </Stack>
                      <Grid cols={2} gap={2}>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Capacity</Label><Label className="font-mono text-white">{location.capacity.toLocaleString()}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Used</Label><Label className="font-mono text-white">{location.used.toLocaleString()}</Label></Stack>
                      </Grid>
                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline">{location.category}</Badge>
                        <Badge variant="outline">{location.climate}</Badge>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLocation(location)}>Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "optimization"}>
              <Stack gap={4}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>AI Optimization Suggestions</H3>
                    <Label className="text-ink-400">Based on current utilization patterns and asset movement data</Label>
                  </Stack>
                </Card>
                {mockSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <Label className={getPriorityColor(suggestion.priority)}>{suggestion.priority} Priority</Label>
                      </Stack>
                      <Body className="text-ink-300 col-span-2">{suggestion.description}</Body>
                      <Stack gap={2} className="text-right">
                        <Label className="font-mono text-green-400">{suggestion.savings}</Label>
                        <Button variant="solid" size="sm">Implement</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "map"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Warehouse Layout</H3>
                  <Grid cols={4} gap={2}>
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <Card key={idx} className={`h-24 flex items-center justify-center ${idx % 3 === 0 ? "bg-green-900/30 border-green-800" : idx % 5 === 0 ? "bg-red-900/30 border-red-800" : "bg-ink-800 border-ink-700"} border`}>
                        <Stack className="text-center" gap={1}>
                          <Label size="xs">Bay {String.fromCharCode(65 + Math.floor(idx / 4))}{(idx % 4) + 1}</Label>
                          <Label size="xs" className="text-ink-500">{idx % 3 === 0 ? "Available" : idx % 5 === 0 ? "Full" : "In Use"}</Label>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                  <Stack direction="horizontal" gap={4}>
                    <Stack direction="horizontal" gap={2}><Card className="w-4 h-4 bg-green-900/30 border border-green-800" /><Label size="xs">Available</Label></Stack>
                    <Stack direction="horizontal" gap={2}><Card className="w-4 h-4 bg-ink-800 border border-ink-700" /><Label size="xs">In Use</Label></Stack>
                    <Stack direction="horizontal" gap={2}><Card className="w-4 h-4 bg-red-900/30 border border-red-800" /><Label size="xs">Full</Label></Stack>
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Asset Registry</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets/performance")}>Performance</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedLocation} onClose={() => setSelectedLocation(null)}>
        <ModalHeader><H3>{selectedLocation?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedLocation && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedLocation.type}</Badge>
                <Badge variant="outline">{selectedLocation.category}</Badge>
                <Badge variant={selectedLocation.status === "Full" ? "solid" : "outline"}>{selectedLocation.status}</Badge>
              </Stack>
              {selectedLocation.address && (
                <Stack gap={1}><Label className="text-ink-400">Address</Label><Label className="text-white">{selectedLocation.address}</Label></Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">Utilization</Label>
                <ProgressBar value={(selectedLocation.used / selectedLocation.capacity) * 100} className="h-3" />
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-ink-500">{selectedLocation.used.toLocaleString()} used</Label>
                  <Label className="text-ink-500">{selectedLocation.capacity.toLocaleString()} capacity</Label>
                </Stack>
              </Stack>
              <Stack gap={1}><Label className="text-ink-400">Climate</Label><Label className="text-white">{selectedLocation.climate}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedLocation(null)}>Close</Button>
          <Button variant="solid">View Assets</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
