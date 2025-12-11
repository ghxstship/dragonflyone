"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select, Textarea, Alert, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_EVENT_ACCESSIBILITY_SERVICES,
  DEMO_AGE_RESTRICTION,
  DEMO_EVENT_ACCESSIBILITY_REQUESTS,
  type DemoEventAccessibilityService as AccessibilityService,
  type DemoAgeRestriction as AgeRestriction,
  type DemoEventAccessibilityRequest as AccessibilityRequest,
} from "@/lib/demo-data";

const mockServices = DEMO_EVENT_ACCESSIBILITY_SERVICES;
const mockAgeRestriction = DEMO_AGE_RESTRICTION;
const mockRequests = DEMO_EVENT_ACCESSIBILITY_REQUESTS;

function AccessibilityPageContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'services',
    validTabs: ['services', 'requests', 'venue'],
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AccessibilityService | null>(null);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Accessibility & Age Policy</H2>
              <Body className="text-on-dark-muted">Event accessibility services and age restrictions</Body>
            </Stack>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={2}>
                  <H3>AGE RESTRICTION</H3>
                  <Badge variant="solid" className="text-body-md px-4 py-2">{mockAgeRestriction.type}</Badge>
                </Stack>
                {mockAgeRestriction.idRequired && (
                  <Alert variant="warning" className="w-auto">ID Required</Alert>
                )}
              </Stack>
              <Body className="text-ink-600">{mockAgeRestriction.description}</Body>
              <Grid cols={2} gap={4}>
                <Card className="p-3 bg-ink-50 border-2 border-ink-200">
                  <Stack direction="horizontal" gap={2}>
                    <Label className={mockAgeRestriction.idRequired ? "text-success-600" : "text-ink-600"}>
                      {mockAgeRestriction.idRequired ? "✓" : "○"}
                    </Label>
                    <Label>Photo ID Required</Label>
                  </Stack>
                </Card>
                <Card className="p-3 bg-ink-50 border-2 border-ink-200">
                  <Stack direction="horizontal" gap={2}>
                    <Label className={mockAgeRestriction.guardianRequired ? "text-success-600" : "text-ink-600"}>
                      {mockAgeRestriction.guardianRequired ? "✓" : "○"}
                    </Label>
                    <Label>Guardian Required for Minors</Label>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Tabs>
            <TabsList>
              <Tab active={isActive('services')} onClick={() => setActiveTab('services')}>Accessibility Services</Tab>
              <Tab active={isActive('requests')} onClick={() => setActiveTab('requests')}>My Requests</Tab>
              <Tab active={isActive('venue')} onClick={() => setActiveTab('venue')}>Venue Info</Tab>
            </TabsList>

            <TabPanel active={isActive('services')}>
              <Grid cols={2} gap={4}>
                {mockServices.map((service) => (
                  <Card key={service.id} className={`border-2 p-4 ${service.available ? "border-black" : "border-ink-300 opacity-60"}`}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Body className="font-weight-bold">{service.name}</Body>
                        <Badge variant={service.available ? "solid" : "outline"}>
                          {service.available ? "Available" : "Not Available"}
                        </Badge>
                      </Stack>
                      <Body className="text-ink-600 text-body-sm">{service.description}</Body>
                      {service.requiresRequest && service.leadTime && (
                        <Label size="xs" className="text-ink-500">Requires {service.leadTime} advance notice</Label>
                      )}
                      {service.available && (
                        <Button 
                          variant={service.requiresRequest ? "solid" : "outline"} 
                          size="sm"
                          onClick={() => { setSelectedService(service); setShowRequestModal(true); }}
                        >
                          {service.requiresRequest ? "Request Service" : "Learn More"}
                        </Button>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('requests')}>
              {mockRequests.length > 0 ? (
                <Stack gap={4}>
                  {mockRequests.map((request) => (
                    <Card key={request.id} className="border-2 border-black p-4">
                      <Grid cols={4} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{request.type}</Body>
                          <Label size="xs" className="text-ink-500">Requested {request.requestDate}</Label>
                        </Stack>
                        <Badge variant={request.status === "Approved" ? "solid" : "outline"}>
                          {request.status}
                        </Badge>
                        <Label className="text-ink-600">{request.notes || "-"}</Label>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card className="border-2 border-black p-8 text-center">
                  <Stack gap={4}>
                    <Label className="text-ink-500">No accessibility requests submitted</Label>
                    <Button variant="solid" onClick={() => setActiveTab("services")}>Browse Services</Button>
                  </Stack>
                </Card>
              )}
            </TabPanel>

            <TabPanel active={isActive('venue')}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>VENUE ACCESSIBILITY</H3>
                    <Stack gap={2}>
                      {[
                        { feature: "Wheelchair Accessible Entrance", available: true },
                        { feature: "Elevator Access", available: true },
                        { feature: "Accessible Restrooms", available: true },
                        { feature: "Accessible Concessions", available: true },
                        { feature: "Braille Signage", available: false },
                        { feature: "Tactile Flooring", available: false },
                      ].map((item) => (
                        <Stack key={item.feature} direction="horizontal" gap={2}>
                          <Label className={item.available ? "text-success-600" : "text-ink-600"}>
                            {item.available ? "✓" : "○"}
                          </Label>
                          <Label className={item.available ? "" : "text-ink-600"}>{item.feature}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>CONTACT INFORMATION</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Accessibility Coordinator</Label>
                        <Body>accessibility@venue.com</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Phone (TTY Available)</Label>
                        <Body>+1 (555) 123-4567</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Hours</Label>
                        <Body>Mon-Fri, 9am-5pm</Body>
                      </Stack>
                    </Stack>
                    <Alert variant="info">
                      For day-of-event assistance, visit the Guest Services booth near the main entrance
                    </Alert>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="solid" inverted onClick={() => setShowRequestModal(true)}>Request Accommodation</Button>
          </Grid>
          </Stack>

      <Modal open={showRequestModal} onClose={() => { setShowRequestModal(false); setSelectedService(null); }}>
        <ModalHeader><H3>Request Accessibility Service</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            {selectedService ? (
              <Card className="p-3 bg-ink-50 border-2 border-ink-200">
                <Body className="font-weight-bold">{selectedService.name}</Body>
                <Label className="text-ink-600 text-body-sm">{selectedService.description}</Label>
              </Card>
            ) : (
              <Select>
                <option value="">Select a service...</option>
                {mockServices.filter(s => s.available && s.requiresRequest).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            )}
            <Stack gap={2}>
              <Label>Your Name</Label>
              <Input placeholder="Full name" />
            </Stack>
            <Stack gap={2}>
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" />
            </Stack>
            <Stack gap={2}>
              <Label>Phone</Label>
              <Input type="tel" placeholder="+1 (555) 000-0000" />
            </Stack>
            <Stack gap={2}>
              <Label>Additional Details</Label>
              <Textarea placeholder="Please provide any additional information about your needs..." rows={3} />
            </Stack>
            {selectedService?.leadTime && (
              <Alert variant="info">
                This service requires {selectedService.leadTime} advance notice
              </Alert>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowRequestModal(false); setSelectedService(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowRequestModal(false); setSelectedService(null); }}>Submit Request</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function AccessibilityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <AccessibilityPageContent />
    </Suspense>
  );
}
