"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import { Badge, Section, SectionHeader } from "../../../components/section";
import {
  Container,
  H1,
  H2,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  EmptyState,
  Section as UISection,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@ghxstship/ui";

interface AssetLocation {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  trackingType: "GPS" | "RFID" | "Manual";
  currentLocation: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    zone?: string;
  };
  lastSeen: string;
  status: "Active" | "In Transit" | "Stationary" | "Offline";
  batteryLevel?: number;
  assignedProject?: string;
  movementHistory: {
    timestamp: string;
    location: string;
    action: string;
  }[];
}

const mockAssetLocations: AssetLocation[] = [
  {
    id: "LOC-001",
    assetId: "AST-001",
    assetName: "Meyer Sound LEO Family Line Array",
    category: "Audio",
    trackingType: "GPS",
    currentLocation: {
      name: "Tampa Convention Center",
      address: "333 S Franklin St, Tampa, FL 33602",
      coordinates: { lat: 27.9422, lng: -82.4587 },
      zone: "Loading Dock A",
    },
    lastSeen: "2024-11-24T14:32:00Z",
    status: "Active",
    batteryLevel: 87,
    assignedProject: "PROJ-2024-089",
    movementHistory: [
      { timestamp: "2024-11-24T14:32:00Z", location: "Tampa Convention Center - Loading Dock A", action: "Arrived" },
      { timestamp: "2024-11-24T08:15:00Z", location: "I-275 North", action: "In Transit" },
      { timestamp: "2024-11-24T07:00:00Z", location: "Warehouse A - Bay 3", action: "Departed" },
    ],
  },
  {
    id: "LOC-002",
    assetId: "AST-002",
    assetName: "Robe MegaPointe Lighting Fixtures (24x)",
    category: "Lighting",
    trackingType: "RFID",
    currentLocation: {
      name: "Warehouse A",
      address: "1234 Industrial Blvd, Tampa, FL 33619",
      zone: "Bay 1 - Rack C",
    },
    lastSeen: "2024-11-24T15:00:00Z",
    status: "Stationary",
    assignedProject: undefined,
    movementHistory: [
      { timestamp: "2024-11-24T15:00:00Z", location: "Warehouse A - Bay 1 - Rack C", action: "Scanned" },
      { timestamp: "2024-11-20T09:30:00Z", location: "Warehouse A - Receiving", action: "Returned" },
    ],
  },
  {
    id: "LOC-003",
    assetId: "AST-003",
    assetName: "disguise gx 2c Media Server",
    category: "Video",
    trackingType: "GPS",
    currentLocation: {
      name: "In Transit",
      address: "I-4 East, Orlando, FL",
      coordinates: { lat: 28.4158, lng: -81.2989 },
    },
    lastSeen: "2024-11-24T14:45:00Z",
    status: "In Transit",
    batteryLevel: 92,
    assignedProject: "PROJ-2024-091",
    movementHistory: [
      { timestamp: "2024-11-24T14:45:00Z", location: "I-4 East, Orlando", action: "In Transit" },
      { timestamp: "2024-11-24T12:00:00Z", location: "Tech Room 2", action: "Departed" },
    ],
  },
  {
    id: "LOC-004",
    assetId: "AST-004",
    assetName: "Staging Deck System (60x8 modules)",
    category: "Staging",
    trackingType: "Manual",
    currentLocation: {
      name: "Warehouse B",
      address: "5678 Storage Way, Tampa, FL 33619",
      zone: "Ground Level - Section D",
    },
    lastSeen: "2024-11-23T16:00:00Z",
    status: "Stationary",
    assignedProject: undefined,
    movementHistory: [
      { timestamp: "2024-11-23T16:00:00Z", location: "Warehouse B - Ground Level", action: "Manual Check-in" },
    ],
  },
  {
    id: "LOC-005",
    assetId: "AST-005",
    assetName: "Chain Motor Hoists (20x 2-ton)",
    category: "Rigging",
    trackingType: "RFID",
    currentLocation: {
      name: "Amalie Arena",
      address: "401 Channelside Dr, Tampa, FL 33602",
      zone: "Rigging Grid - Section 4",
    },
    lastSeen: "2024-11-24T10:00:00Z",
    status: "Active",
    assignedProject: "PROJ-2024-088",
    movementHistory: [
      { timestamp: "2024-11-24T10:00:00Z", location: "Amalie Arena - Rigging Grid", action: "Installed" },
      { timestamp: "2024-11-23T14:00:00Z", location: "Amalie Arena - Loading Dock", action: "Arrived" },
    ],
  },
];

const warehouseZones = [
  { id: "WH-A", name: "Warehouse A", capacity: 500, occupied: 342, zones: ["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Tech Room 1", "Tech Room 2"] },
  { id: "WH-B", name: "Warehouse B", capacity: 300, occupied: 187, zones: ["Ground Level", "Mezzanine", "Cold Storage"] },
  { id: "WH-C", name: "Warehouse C", capacity: 200, occupied: 156, zones: ["Vehicle Bay", "Equipment Storage", "Staging Area"] },
];

export default function AssetTrackingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTrackingType, setSelectedTrackingType] = useState("All");
  const [activeTab, setActiveTab] = useState("map");
  const [selectedAsset, setSelectedAsset] = useState<AssetLocation | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const filteredAssets = mockAssetLocations.filter((asset) => {
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.currentLocation.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || asset.status === selectedStatus;
    const matchesType = selectedTrackingType === "All" || asset.trackingType === selectedTrackingType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeAssets = mockAssetLocations.filter((a) => a.status === "Active").length;
  const inTransitAssets = mockAssetLocations.filter((a) => a.status === "In Transit").length;
  const offlineAssets = mockAssetLocations.filter((a) => a.status === "Offline").length;
  const gpsTracked = mockAssetLocations.filter((a) => a.trackingType === "GPS").length;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-400";
      case "In Transit":
        return "text-blue-400";
      case "Stationary":
        return "text-ink-400";
      case "Offline":
        return "text-red-400";
      default:
        return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />

      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Asset Location Tracking</H1>
            <Label className="text-ink-400">
              Real-time GPS and RFID tracking for production equipment and inventory
            </Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              label="Active Trackers"
              value={activeAssets}
              trend="up"
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="In Transit"
              value={inTransitAssets}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="GPS Tracked"
              value={gpsTracked}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="Offline Devices"
              value={offlineAssets}
              trend={offlineAssets > 0 ? "down" : "neutral"}
              className="bg-transparent border-2 border-ink-800"
            />
          </Grid>

          <Section border>
            <Grid cols={4} gap={4}>
              <Input
                type="search"
                placeholder="Search assets, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-ink-700 bg-black text-white col-span-2"
              />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border-ink-700 bg-black text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="In Transit">In Transit</option>
                <option value="Stationary">Stationary</option>
                <option value="Offline">Offline</option>
              </Select>
              <Select
                value={selectedTrackingType}
                onChange={(e) => setSelectedTrackingType(e.target.value)}
                className="border-ink-700 bg-black text-white"
              >
                <option value="All">All Tracking Types</option>
                <option value="GPS">GPS</option>
                <option value="RFID">RFID</option>
                <option value="Manual">Manual</option>
              </Select>
            </Grid>
          </Section>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "map"} onClick={() => setActiveTab("map")}>Map View</Tab>
              <Tab active={activeTab === "list"} onClick={() => setActiveTab("list")}>List View</Tab>
              <Tab active={activeTab === "warehouse"} onClick={() => setActiveTab("warehouse")}>Warehouse Management</Tab>
            </TabsList>

            <TabPanel active={activeTab === "map"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <Stack gap={2}>
                    <H3>Live Asset Map</H3>
                    <Body className="text-ink-400">
                      Interactive map showing real-time asset locations
                    </Body>
                  </Stack>
                  
                  <Card className="h-96 bg-ink-800 border border-ink-700 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-ink-400">Map Integration</Label>
                      <Body className="text-ink-500">
                        Google Maps / Mapbox integration would render here
                      </Body>
                      <Grid cols={2} gap={4} className="mt-4">
                        {filteredAssets.filter(a => a.currentLocation.coordinates).map((asset) => (
                          <Card key={asset.id} className="p-3 bg-ink-900 border border-ink-700">
                            <Stack gap={1}>
                              <Label className="text-white">{asset.assetName}</Label>
                              <Label size="xs" className={getStatusColor(asset.status)}>
                                {asset.status} • {asset.currentLocation.name}
                              </Label>
                              {asset.currentLocation.coordinates && (
                                <Label size="xs" className="text-ink-500 font-mono">
                                  {asset.currentLocation.coordinates.lat.toFixed(4)}, {asset.currentLocation.coordinates.lng.toFixed(4)}
                                </Label>
                              )}
                            </Stack>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "list"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Asset</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{asset.assetName}</Body>
                          <Label size="xs" className="text-ink-500">{asset.assetId} • {asset.category}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant={asset.trackingType === "GPS" ? "solid" : "outline"}>
                          {asset.trackingType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{asset.currentLocation.name}</Label>
                          {asset.currentLocation.zone && (
                            <Label size="xs" className="text-ink-500">{asset.currentLocation.zone}</Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell className="font-mono text-ink-300">
                        {formatTimestamp(asset.lastSeen)}
                      </TableCell>
                      <TableCell>
                        <Label className={getStatusColor(asset.status)}>{asset.status}</Label>
                      </TableCell>
                      <TableCell>
                        {asset.batteryLevel !== undefined ? (
                          <Stack gap={1}>
                            <Label className={asset.batteryLevel > 20 ? "text-green-400" : "text-red-400"}>
                              {asset.batteryLevel}%
                            </Label>
                          </Stack>
                        ) : (
                          <Label className="text-ink-500">N/A</Label>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowHistoryModal(true);
                          }}
                        >
                          History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "warehouse"}>
              <Grid cols={3} gap={6}>
                {warehouseZones.map((warehouse) => (
                  <Card key={warehouse.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack gap={1}>
                        <H3>{warehouse.name}</H3>
                        <Label className="text-ink-400">
                          {warehouse.occupied} / {warehouse.capacity} slots occupied
                        </Label>
                      </Stack>
                      
                      <Card className="h-4 bg-ink-800 rounded-full overflow-hidden">
                        <Card
                          className="h-full bg-white transition-all"
                          style={{ width: `${(warehouse.occupied / warehouse.capacity) * 100}%` }}
                        />
                      </Card>

                      <Stack gap={2}>
                        <Label className="text-ink-400">Zones:</Label>
                        <Grid cols={2} gap={2}>
                          {warehouse.zones.map((zone) => (
                            <Badge key={zone} variant="outline">
                              {zone}
                            </Badge>
                          ))}
                        </Grid>
                      </Stack>

                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push("/assets/tracking/scan")}>
              Scan RFID Tag
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Register New Tracker
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Export Location Data
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white" onClick={() => router.push("/assets")}>
              Back to Assets
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)}>
        <ModalHeader>
          <H3>Movement History</H3>
        </ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Asset</Label>
                <Body className="text-white">{selectedAsset.assetName}</Body>
              </Stack>
              
              <Stack gap={2}>
                <Label className="text-ink-400">Recent Activity</Label>
                {selectedAsset.movementHistory.map((entry, index) => (
                  <Card key={index} className="p-3 bg-ink-800 border border-ink-700">
                    <Grid cols={3} gap={2}>
                      <Label size="xs" className="font-mono text-ink-400">
                        {formatTimestamp(entry.timestamp)}
                      </Label>
                      <Label size="xs" className="text-white">{entry.location}</Label>
                      <Badge variant="outline">
                        {entry.action}
                      </Badge>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
          <Button variant="solid">
            Export History
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
