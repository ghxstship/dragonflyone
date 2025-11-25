"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select, Textarea, Alert,
} from "@ghxstship/ui";

interface AccessibilityService {
  id: string;
  name: string;
  description: string;
  available: boolean;
  requiresRequest: boolean;
  leadTime?: string;
}

interface AgeRestriction {
  type: "All Ages" | "18+" | "21+" | "Under 18 with Guardian";
  description: string;
  idRequired: boolean;
  guardianRequired: boolean;
}

interface AccessibilityRequest {
  id: string;
  type: string;
  status: "Pending" | "Approved" | "Denied";
  requestDate: string;
  notes?: string;
}

const mockServices: AccessibilityService[] = [
  { id: "SVC-001", name: "Wheelchair Accessible Seating", description: "Designated wheelchair spaces with companion seating", available: true, requiresRequest: false },
  { id: "SVC-002", name: "ASL Interpretation", description: "American Sign Language interpreters for performances", available: true, requiresRequest: true, leadTime: "7 days" },
  { id: "SVC-003", name: "Audio Description", description: "Live audio description of visual elements", available: true, requiresRequest: true, leadTime: "5 days" },
  { id: "SVC-004", name: "Assistive Listening Devices", description: "FM receivers and headsets available at venue", available: true, requiresRequest: false },
  { id: "SVC-005", name: "Service Animal Accommodation", description: "Service animals welcome at all events", available: true, requiresRequest: false },
  { id: "SVC-006", name: "Sensory-Friendly Performance", description: "Modified lighting and sound levels", available: false, requiresRequest: true },
  { id: "SVC-007", name: "Large Print Programs", description: "Event programs in large print format", available: true, requiresRequest: true, leadTime: "3 days" },
  { id: "SVC-008", name: "Accessible Parking", description: "Reserved accessible parking spaces near entrance", available: true, requiresRequest: false },
];

const mockAgeRestriction: AgeRestriction = {
  type: "21+",
  description: "This event is 21+ only. Valid government-issued photo ID required for entry.",
  idRequired: true,
  guardianRequired: false,
};

const mockRequests: AccessibilityRequest[] = [
  { id: "REQ-001", type: "ASL Interpretation", status: "Approved", requestDate: "2024-11-15", notes: "Interpreter confirmed for main stage" },
  { id: "REQ-002", type: "Wheelchair Seating", status: "Approved", requestDate: "2024-11-18" },
];

export default function AccessibilityPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState("services");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AccessibilityService | null>(null);

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>ACCESSIBILITY & AGE POLICY</H1>
            <Body className="text-gray-600">Event accessibility services and age restrictions</Body>
          </Stack>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={2}>
                  <H3>AGE RESTRICTION</H3>
                  <Badge variant="solid" className="text-lg px-4 py-2">{mockAgeRestriction.type}</Badge>
                </Stack>
                {mockAgeRestriction.idRequired && (
                  <Alert variant="warning" className="w-auto">ID Required</Alert>
                )}
              </Stack>
              <Body className="text-gray-600">{mockAgeRestriction.description}</Body>
              <Grid cols={2} gap={4}>
                <Card className="p-3 bg-gray-50 border border-gray-200">
                  <Stack direction="horizontal" gap={2}>
                    <Label className={mockAgeRestriction.idRequired ? "text-green-600" : "text-gray-400"}>
                      {mockAgeRestriction.idRequired ? "✓" : "○"}
                    </Label>
                    <Label>Photo ID Required</Label>
                  </Stack>
                </Card>
                <Card className="p-3 bg-gray-50 border border-gray-200">
                  <Stack direction="horizontal" gap={2}>
                    <Label className={mockAgeRestriction.guardianRequired ? "text-green-600" : "text-gray-400"}>
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
              <Tab active={activeTab === "services"} onClick={() => setActiveTab("services")}>Accessibility Services</Tab>
              <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>My Requests</Tab>
              <Tab active={activeTab === "venue"} onClick={() => setActiveTab("venue")}>Venue Info</Tab>
            </TabsList>

            <TabPanel active={activeTab === "services"}>
              <Grid cols={2} gap={4}>
                {mockServices.map((service) => (
                  <Card key={service.id} className={`border-2 p-4 ${service.available ? "border-black" : "border-gray-300 opacity-60"}`}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Body className="font-bold">{service.name}</Body>
                        <Badge variant={service.available ? "solid" : "outline"}>
                          {service.available ? "Available" : "Not Available"}
                        </Badge>
                      </Stack>
                      <Body className="text-gray-600 text-sm">{service.description}</Body>
                      {service.requiresRequest && service.leadTime && (
                        <Label size="xs" className="text-gray-500">Requires {service.leadTime} advance notice</Label>
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

            <TabPanel active={activeTab === "requests"}>
              {mockRequests.length > 0 ? (
                <Stack gap={4}>
                  {mockRequests.map((request) => (
                    <Card key={request.id} className="border-2 border-black p-4">
                      <Grid cols={4} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-bold">{request.type}</Body>
                          <Label size="xs" className="text-gray-500">Requested {request.requestDate}</Label>
                        </Stack>
                        <Badge variant={request.status === "Approved" ? "solid" : "outline"}>
                          {request.status}
                        </Badge>
                        <Label className="text-gray-600">{request.notes || "-"}</Label>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card className="border-2 border-black p-8 text-center">
                  <Stack gap={4}>
                    <Label className="text-gray-500">No accessibility requests submitted</Label>
                    <Button variant="solid" onClick={() => setActiveTab("services")}>Browse Services</Button>
                  </Stack>
                </Card>
              )}
            </TabPanel>

            <TabPanel active={activeTab === "venue"}>
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
                          <Label className={item.available ? "text-green-600" : "text-gray-400"}>
                            {item.available ? "✓" : "○"}
                          </Label>
                          <Label className={item.available ? "" : "text-gray-400"}>{item.feature}</Label>
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
                        <Label size="xs" className="text-gray-500">Accessibility Coordinator</Label>
                        <Body>accessibility@venue.com</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-gray-500">Phone (TTY Available)</Label>
                        <Body>+1 (555) 123-4567</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-gray-500">Hours</Label>
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
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="solid" onClick={() => setShowRequestModal(true)}>Request Accommodation</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showRequestModal} onClose={() => { setShowRequestModal(false); setSelectedService(null); }}>
        <ModalHeader><H3>Request Accessibility Service</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            {selectedService ? (
              <Card className="p-3 bg-gray-50 border border-gray-200">
                <Body className="font-bold">{selectedService.name}</Body>
                <Label className="text-gray-600 text-sm">{selectedService.description}</Label>
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
    </UISection>
  );
}
