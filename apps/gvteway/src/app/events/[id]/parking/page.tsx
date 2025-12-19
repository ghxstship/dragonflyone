"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select, Alert, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_PARKING_OPTIONS,
  DEMO_TRANSPORT_OPTIONS,
  type DemoParkingOption as ParkingOption,
} from "@/lib/demo-data";

const mockParking = DEMO_PARKING_OPTIONS;
const mockTransport = DEMO_TRANSPORT_OPTIONS;

function ParkingTransportPageContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'parking',
    validTabs: ['parking', 'transport', 'map'],
  });
  const [selectedParking, setSelectedParking] = useState<ParkingOption | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const availableSpots = mockParking.reduce((sum, p) => sum + (p.type !== "Rideshare" ? p.spotsAvailable : 0), 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VIP": return "bg-success-100 text-success-800";
      case "Premium": return "bg-warning-100 text-warning-800";
      case "Accessible": return "bg-warning-100 text-warning-800";
      case "Rideshare": return "bg-success-100 text-success-800";
      default: return "bg-error-100 text-error-800";
    }
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const pct = (available / total) * 100;
    if (pct > 50) return "text-success-600";
    if (pct > 20) return "text-warning-600";
    return "text-error-600";
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Parking & Transportation</H2>
              <Body className="text-on-dark-muted">Find parking and transportation options for your event</Body>
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
              <Tab active={isActive('parking')} onClick={() => setActiveTab('parking')}>Parking</Tab>
              <Tab active={isActive('transport')} onClick={() => setActiveTab('transport')}>Transportation</Tab>
              <Tab active={isActive('map')} onClick={() => setActiveTab('map')}>Map</Tab>
            </TabsList>

            <TabPanel active={isActive('parking')}>
              <Grid cols={2} gap={4}>
                {mockParking.map((option) => (
                  <Card key={option.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4 bg-black text-white">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{option.name}</Body>
                          <Label className="text-ink-600">{option.distance} • {option.walkTime} walk</Label>
                        </Stack>
                        <Badge className={getTypeColor(option.type)}>{option.type}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        {option.price > 0 ? (
                          <Label className="font-mono text-h5-md">${option.price}</Label>
                        ) : (
                          <Label className="text-success-600 text-h6-md">Free</Label>
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
                            <Label className="text-success-600">✓</Label>
                            <Label size="sm" className="">{feature}</Label>
                          </Stack>
                        ))}
                      </Stack>
                      {option.address && <Label className="text-ink-500">{option.address}</Label>}
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

            <TabPanel active={isActive('transport')}>
              <Stack gap={4}>
                {mockTransport.map((option) => (
                  <Card key={option.id} className="border-2 border-black p-6">
                    <Grid cols={3} gap={6} className="items-start">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Body className="font-weight-bold text-body-md">{option.name}</Body>
                          <Badge variant="outline">{option.type}</Badge>
                        </Stack>
                        <Body className="text-ink-600">{option.description}</Body>
                      </Stack>
                      <Stack gap={2}>
                        {option.schedule && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Schedule</Label>
                            <Label>{option.schedule}</Label>
                          </Stack>
                        )}
                        {option.price !== undefined && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Price</Label>
                            <Label className={option.price === 0 ? "text-success-600" : ""}>
                              {option.price === 0 ? "Free" : `$${option.price}`}
                            </Label>
                          </Stack>
                        )}
                      </Stack>
                      <Stack gap={2}>
                        <Label size="xs" className="text-ink-500">Features</Label>
                        {option.features.map((feature, idx) => (
                          <Stack key={idx} direction="horizontal" gap={2}>
                            <Label className="text-success-600">✓</Label>
                            <Label size="sm" className="">{feature}</Label>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('map')}>
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <H3>Venue Area Map</H3>
                  <Card className="h-96 bg-ink-100 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-ink-500 text-h3-md">🗺️</Label>
                      <Label className="text-ink-500">Interactive map would display here</Label>
                      <Label className="text-ink-600">Showing parking lots, transit stops, and venue entrance</Label>
                    </Stack>
                  </Card>
                  <Grid cols={4} gap={2}>
                    <Card className="p-2 bg-info-100 text-center"><Label size="sm" className="">🅿️ Parking</Label></Card>
                    <Card className="p-2 bg-success-100 text-center"><Label size="sm" className="">🚌 Shuttle</Label></Card>
                    <Card className="p-2 bg-violet-100 text-center"><Label size="sm" className="">🚇 Metro</Label></Card>
                    <Card className="p-2 bg-warning-100 text-center"><Label size="sm" className="">🚗 Rideshare</Label></Card>
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}/accessibility`)}>Accessibility Info</Button>
          </Grid>
          </Stack>

      <Modal open={showReserveModal && !!selectedParking} onClose={() => { setShowReserveModal(false); setSelectedParking(null); }}>
        <ModalHeader><H3>Reserve Parking</H3></ModalHeader>
        <ModalBody>
          {selectedParking && (
            <Stack gap={4}>
              <Card className="p-4 bg-ink-50 border-2 border-ink-200">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Body className="font-weight-bold">{selectedParking.name}</Body>
                    <Badge className={getTypeColor(selectedParking.type)}>{selectedParking.type}</Badge>
                  </Stack>
                  <Label className="font-mono text-h5-md">${selectedParking.price}</Label>
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
    </GvtewayAppLayout>
  );
}

export default function ParkingTransportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ParkingTransportPageContent />
    </Suspense>
  );
}
