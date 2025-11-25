"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select, Alert,
} from "@ghxstship/ui";

interface ParkingOption {
  id: string;
  name: string;
  type: "Standard" | "Premium" | "VIP" | "Accessible" | "Rideshare";
  price: number;
  distance: string;
  walkTime: string;
  spotsAvailable: number;
  totalSpots: number;
  features: string[];
  address?: string;
}

interface TransportOption {
  id: string;
  name: string;
  type: "Shuttle" | "Public Transit" | "Rideshare Zone" | "Bike Parking";
  description: string;
  schedule?: string;
  price?: number;
  features: string[];
}

const mockParking: ParkingOption[] = [
  { id: "PKG-001", name: "Main Lot A", type: "Standard", price: 25, distance: "0.2 miles", walkTime: "5 min", spotsAvailable: 450, totalSpots: 800, features: ["Paved", "Well-lit", "Security patrol"], address: "123 Main St" },
  { id: "PKG-002", name: "Premium Lot B", type: "Premium", price: 45, distance: "0.1 miles", walkTime: "2 min", spotsAvailable: 85, totalSpots: 200, features: ["Closest to entrance", "Covered", "EV charging"], address: "125 Main St" },
  { id: "PKG-003", name: "VIP Valet", type: "VIP", price: 75, distance: "At venue", walkTime: "0 min", spotsAvailable: 25, totalSpots: 50, features: ["Valet service", "Priority exit", "Complimentary wash"] },
  { id: "PKG-004", name: "Accessible Parking", type: "Accessible", price: 25, distance: "0.05 miles", walkTime: "1 min", spotsAvailable: 30, totalSpots: 40, features: ["ADA compliant", "Level surface", "Close to accessible entrance"] },
  { id: "PKG-005", name: "Rideshare Drop-off", type: "Rideshare", price: 0, distance: "0.1 miles", walkTime: "3 min", spotsAvailable: 999, totalSpots: 999, features: ["Designated zone", "Well-marked", "Safe pickup area"] },
];

const mockTransport: TransportOption[] = [
  { id: "TRN-001", name: "Event Shuttle", type: "Shuttle", description: "Free shuttle from downtown transit hub", schedule: "Every 15 min starting 2 hours before event", price: 0, features: ["Free", "Air conditioned", "Wheelchair accessible"] },
  { id: "TRN-002", name: "Metro Line", type: "Public Transit", description: "Blue Line to Convention Center Station", schedule: "Regular service, extra trains after event", price: 3, features: ["$3 each way", "5 min walk to venue", "Late service available"] },
  { id: "TRN-003", name: "Uber/Lyft Zone", type: "Rideshare Zone", description: "Designated pickup and drop-off area", features: ["North side of venue", "Well-lit", "Security present"] },
  { id: "TRN-004", name: "Bike Valet", type: "Bike Parking", description: "Free secure bike parking", features: ["Free", "Attended", "Helmet storage available"] },
];

export default function ParkingTransportPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState("parking");
  const [selectedParking, setSelectedParking] = useState<ParkingOption | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const availableSpots = mockParking.reduce((sum, p) => sum + (p.type !== "Rideshare" ? p.spotsAvailable : 0), 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VIP": return "bg-purple-100 text-purple-800";
      case "Premium": return "bg-yellow-100 text-yellow-800";
      case "Accessible": return "bg-blue-100 text-blue-800";
      case "Rideshare": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const pct = (available / total) * 100;
    if (pct > 50) return "text-green-600";
    if (pct > 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>PARKING & TRANSPORTATION</H1>
            <Body className="text-gray-600">Find parking and transportation options for your event</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Parking Lots" value={mockParking.filter(p => p.type !== "Rideshare").length} className="border-2 border-black" />
            <StatCard label="Available Spots" value={availableSpots.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Transit Options" value={mockTransport.length} className="border-2 border-black" />
            <StatCard label="Free Shuttle" value="Yes" className="border-2 border-black" />
          </Grid>

          <Alert variant="info">
            Pre-purchase parking to guarantee your spot! Prices increase on event day.
          </Alert>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "parking"} onClick={() => setActiveTab("parking")}>Parking</Tab>
              <Tab active={activeTab === "transport"} onClick={() => setActiveTab("transport")}>Transportation</Tab>
              <Tab active={activeTab === "map"} onClick={() => setActiveTab("map")}>Map</Tab>
            </TabsList>

            <TabPanel active={activeTab === "parking"}>
              <Grid cols={2} gap={4}>
                {mockParking.map((option) => (
                  <Card key={option.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4 bg-black text-white">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-bold">{option.name}</Body>
                          <Label className="text-gray-400">{option.distance} • {option.walkTime} walk</Label>
                        </Stack>
                        <Badge className={getTypeColor(option.type)}>{option.type}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        {option.price > 0 ? (
                          <Label className="font-mono text-2xl">${option.price}</Label>
                        ) : (
                          <Label className="text-green-600 text-xl">Free</Label>
                        )}
                        {option.type !== "Rideshare" && (
                          <Label className={getAvailabilityColor(option.spotsAvailable, option.totalSpots)}>
                            {option.spotsAvailable} spots left
                          </Label>
                        )}
                      </Stack>
                      <Stack gap={2}>
                        {option.features.map((feature, idx) => (
                          <Stack key={idx} direction="horizontal" gap={2}>
                            <Label className="text-green-600">✓</Label>
                            <Label className="text-sm">{feature}</Label>
                          </Stack>
                        ))}
                      </Stack>
                      {option.address && <Label className="text-gray-500 text-sm">{option.address}</Label>}
                      {option.type !== "Rideshare" && option.spotsAvailable > 0 && (
                        <Button variant="solid" onClick={() => { setSelectedParking(option); setShowReserveModal(true); }}>
                          Reserve Parking
                        </Button>
                      )}
                      {option.type === "Rideshare" && (
                        <Button variant="outline">Get Directions</Button>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "transport"}>
              <Stack gap={4}>
                {mockTransport.map((option) => (
                  <Card key={option.id} className="border-2 border-black p-6">
                    <Grid cols={3} gap={6} className="items-start">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Body className="font-bold text-lg">{option.name}</Body>
                          <Badge variant="outline">{option.type}</Badge>
                        </Stack>
                        <Body className="text-gray-600">{option.description}</Body>
                      </Stack>
                      <Stack gap={2}>
                        {option.schedule && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-gray-500">Schedule</Label>
                            <Label>{option.schedule}</Label>
                          </Stack>
                        )}
                        {option.price !== undefined && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-gray-500">Price</Label>
                            <Label className={option.price === 0 ? "text-green-600" : ""}>
                              {option.price === 0 ? "Free" : `$${option.price}`}
                            </Label>
                          </Stack>
                        )}
                      </Stack>
                      <Stack gap={2}>
                        <Label size="xs" className="text-gray-500">Features</Label>
                        {option.features.map((feature, idx) => (
                          <Stack key={idx} direction="horizontal" gap={2}>
                            <Label className="text-green-600">✓</Label>
                            <Label className="text-sm">{feature}</Label>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "map"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <H3>Venue Area Map</H3>
                  <Card className="h-96 bg-gray-100 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-gray-500 text-4xl">🗺️</Label>
                      <Label className="text-gray-500">Interactive map would display here</Label>
                      <Label className="text-gray-400 text-sm">Showing parking lots, transit stops, and venue entrance</Label>
                    </Stack>
                  </Card>
                  <Grid cols={4} gap={2}>
                    <Card className="p-2 bg-blue-100 text-center"><Label className="text-sm">🅿️ Parking</Label></Card>
                    <Card className="p-2 bg-green-100 text-center"><Label className="text-sm">🚌 Shuttle</Label></Card>
                    <Card className="p-2 bg-purple-100 text-center"><Label className="text-sm">🚇 Metro</Label></Card>
                    <Card className="p-2 bg-yellow-100 text-center"><Label className="text-sm">🚗 Rideshare</Label></Card>
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}/accessibility`)}>Accessibility Info</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showReserveModal && !!selectedParking} onClose={() => { setShowReserveModal(false); setSelectedParking(null); }}>
        <ModalHeader><H3>Reserve Parking</H3></ModalHeader>
        <ModalBody>
          {selectedParking && (
            <Stack gap={4}>
              <Card className="p-4 bg-gray-50 border border-gray-200">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{selectedParking.name}</Body>
                    <Badge className={getTypeColor(selectedParking.type)}>{selectedParking.type}</Badge>
                  </Stack>
                  <Label className="font-mono text-2xl">${selectedParking.price}</Label>
                </Stack>
              </Card>
              <Stack gap={2}>
                <Label>Vehicle Information</Label>
                <Grid cols={2} gap={4}>
                  <Input placeholder="License Plate" />
                  <Select>
                    <option value="">Vehicle Type...</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="motorcycle">Motorcycle</option>
                  </Select>
                </Grid>
              </Stack>
              <Stack gap={2}>
                <Label>Contact Email</Label>
                <Input type="email" placeholder="email@example.com" />
              </Stack>
              <Alert variant="info">
                Your parking pass will be emailed to you. Show it on your phone or print it.
              </Alert>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowReserveModal(false); setSelectedParking(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowReserveModal(false); setSelectedParking(null); }}>
            Reserve for ${selectedParking?.price}
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
