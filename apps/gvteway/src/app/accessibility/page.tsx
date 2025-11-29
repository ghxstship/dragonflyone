"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

interface AccessibilityRequest {
  id: string;
  eventName: string;
  eventId: string;
  guestName: string;
  email: string;
  requestType: string[];
  status: "Pending" | "Approved" | "Confirmed" | "Completed";
  submittedDate: string;
  notes?: string;
}

interface AccessibilityService {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

const mockRequests: AccessibilityRequest[] = [
  { id: "ACC-001", eventName: "Summer Fest 2024", eventId: "EVT-001", guestName: "Robert Johnson", email: "robert@email.com", requestType: ["Wheelchair Seating", "Companion Seat"], status: "Confirmed", submittedDate: "2024-11-20", notes: "Section A, Row 1" },
  { id: "ACC-002", eventName: "Summer Fest 2024", eventId: "EVT-001", guestName: "Maria Garcia", email: "maria@email.com", requestType: ["ASL Interpreter"], status: "Approved", submittedDate: "2024-11-22" },
  { id: "ACC-003", eventName: "Fall Concert", eventId: "EVT-002", guestName: "James Wilson", email: "james@email.com", requestType: ["Assistive Listening Device"], status: "Pending", submittedDate: "2024-11-24" },
];

const mockServices: AccessibilityService[] = [
  { id: "SVC-001", name: "Wheelchair Accessible Seating", description: "Designated wheelchair spaces with companion seating", icon: "♿", available: true },
  { id: "SVC-002", name: "ASL Interpretation", description: "American Sign Language interpreters for performances", icon: "🤟", available: true },
  { id: "SVC-003", name: "Assistive Listening Devices", description: "Personal amplification devices available at venue", icon: "🎧", available: true },
  { id: "SVC-004", name: "Audio Description", description: "Live audio description of visual elements", icon: "🔊", available: true },
  { id: "SVC-005", name: "Service Animal Accommodations", description: "Relief areas and water stations for service animals", icon: "🐕", available: true },
  { id: "SVC-006", name: "Sensory-Friendly Viewing", description: "Quiet areas with reduced sensory stimulation", icon: "🧘", available: true },
  { id: "SVC-007", name: "Accessible Parking", description: "Reserved accessible parking spaces near entrance", icon: "🅿️", available: true },
  { id: "SVC-008", name: "Mobility Assistance", description: "Wheelchair and mobility device rentals", icon: "🦽", available: true },
];

export default function AccessibilityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("services");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessibilityRequest | null>(null);

  const pendingRequests = mockRequests.filter(r => r.status === "Pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": case "Completed": return "text-success-600";
      case "Approved": return "text-info-600";
      case "Pending": return "text-warning-600";
      default: return "text-ink-600";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Inclusive Experience</Kicker>
              <H2 size="lg" className="text-white">Accessibility Services</H2>
              <Body className="text-on-dark-muted">ADA accommodations and accessibility support for all guests</Body>
            </Stack>

            <Alert variant="info">
              We are committed to providing an inclusive experience for all guests. Please submit your accessibility requests at least 7 days before the event.
            </Alert>

          <Grid cols={4} gap={6}>
            <StatCard label="Services Available" value={mockServices.filter(s => s.available).length.toString()} inverted />
            <StatCard label="Active Requests" value={mockRequests.length.toString()} inverted />
            <StatCard label="Pending Review" value={pendingRequests.toString()} inverted />
            <StatCard label="Satisfaction" value="98%" inverted />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "services"} onClick={() => setActiveTab("services")}>Available Services</Tab>
                <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>My Requests</Tab>
                <Tab active={activeTab === "info"} onClick={() => setActiveTab("info")}>Venue Info</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowRequestModal(true)}>Request Accommodation</Button>
          </Stack>

          <TabPanel active={activeTab === "services"}>
            <Grid cols={4} gap={4}>
              {mockServices.map((service) => (
                <Card key={service.id} inverted interactive className="p-4">
                  <Stack gap={3} className="text-center">
                    <Label className="text-h3-md">{service.icon}</Label>
                    <Body className="font-display text-white">{service.name}</Body>
                    <Label className="text-on-dark-muted">{service.description}</Label>
                    <Badge variant={service.available ? "solid" : "outline"}>
                      {service.available ? "Available" : "Limited"}
                    </Badge>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === "requests"}>
            <Stack gap={4}>
              {mockRequests.map((request) => (
                <Card key={request.id} inverted className="p-4">
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{request.eventName}</Body>
                      <Label className="text-on-dark-disabled">{request.submittedDate}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-disabled">Guest</Label>
                      <Label className="text-white">{request.guestName}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="col-span-2 flex-wrap">
                      {request.requestType.map(type => <Badge key={type} variant="outline">{type}</Badge>)}
                    </Stack>
                    <Label className={getStatusColor(request.status)}>{request.status}</Label>
                    <Button variant="outlineInk" size="sm" onClick={() => setSelectedRequest(request)}>Details</Button>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel active={activeTab === "info"}>
            <Grid cols={2} gap={6}>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Venue Accessibility Features</H3>
                  <Stack gap={2}>
                    {[
                      "Wheelchair accessible entrances on all sides",
                      "Elevator access to all levels",
                      "Accessible restrooms on every floor",
                      "Tactile signage and braille throughout",
                      "Lowered counters at concessions",
                      "Accessible seating in all price tiers",
                    ].map((feature, idx) => (
                      <Stack key={idx} direction="horizontal" gap={2}>
                        <Label className="text-success-400">✓</Label>
                        <Label className="text-on-dark-muted">{feature}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Contact Information</H3>
                  <Stack gap={3}>
                    <Stack gap={1}>
                      <Label className="text-on-dark-disabled">Accessibility Hotline</Label>
                      <Body className="font-display text-white">1-800-555-ADA1</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-disabled">Email</Label>
                      <Body className="text-white">accessibility@venue.com</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-disabled">Hours</Label>
                      <Label className="text-on-dark-muted">Mon-Fri 9am-6pm, Sat 10am-4pm</Label>
                    </Stack>
                  </Stack>
                  <Button variant="outlineInk">Download Accessibility Guide (PDF)</Button>
                </Stack>
              </Card>
            </Grid>
          </TabPanel>

            <Button variant="outlineInk" inverted onClick={() => router.push("/events")}>Back to Events</Button>
          </Stack>

      <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)}>
        <ModalHeader><H3>Request Accommodation</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Fall Concert</option>
            </Select>
            <Input placeholder="Your Name" className="border-2 border-black" />
            <Input type="email" placeholder="Email Address" className="border-2 border-black" />
            <Input type="tel" placeholder="Phone Number" className="border-2 border-black" />
            <Stack gap={2}>
              <Label>Services Needed (select all that apply)</Label>
              <Grid cols={2} gap={2}>
                {mockServices.slice(0, 6).map(service => (
                  <Card key={service.id} className="cursor-pointer border-2 border-ink-200 p-2 hover:border-black">
                    <Stack direction="horizontal" gap={2}>
                      <Label>{service.icon}</Label>
                      <Label size="xs">{service.name}</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
            <Textarea placeholder="Additional details or special requirements..." rows={3} className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowRequestModal(false)}>Submit Request</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
        <ModalHeader><H3>Request Details</H3></ModalHeader>
        <ModalBody>
          {selectedRequest && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRequest.eventName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-on-light-muted">Guest</Label><Label>{selectedRequest.guestName}</Label></Stack>
                <Stack gap={1}><Label className="text-on-light-muted">Status</Label><Label className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-on-light-muted">Requested Services</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedRequest.requestType.map(type => <Badge key={type} variant="outline">{type}</Badge>)}
                </Stack>
              </Stack>
              {selectedRequest.notes && (
                <Stack gap={1}><Label className="text-on-light-muted">Notes</Label><Label>{selectedRequest.notes}</Label></Stack>
              )}
              <Stack gap={1}><Label className="text-on-light-muted">Submitted</Label><Label>{selectedRequest.submittedDate}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          <Button variant="outline">Modify Request</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
