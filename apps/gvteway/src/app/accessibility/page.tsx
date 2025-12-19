"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, PhoneInput, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert, EmptyState,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";
import { useAccessibilityRequestsData, type AccessibilityRequest } from "@/hooks/useAccessibilityRequests";

// Static services configuration (these don't change frequently)
const accessibilityServices = [
  { id: "svc-1", name: "Wheelchair Access", description: "Reserved accessible seating", icon: "♿", available: true },
  { id: "svc-2", name: "Sign Language", description: "ASL interpreters available", icon: "👐", available: true },
  { id: "svc-3", name: "Audio Description", description: "Live audio descriptions", icon: "🎧", available: true },
  { id: "svc-4", name: "Service Animals", description: "Service animal accommodations", icon: "🐕", available: true },
  { id: "svc-5", name: "Accessible Parking", description: "Reserved accessible parking", icon: "🅿️", available: true },
  { id: "svc-6", name: "Sensory Room", description: "Quiet space for sensory breaks", icon: "🤫", available: false },
  { id: "svc-7", name: "Mobility Assistance", description: "Staff assistance available", icon: "🚶", available: true },
  { id: "svc-8", name: "Large Print", description: "Large print programs", icon: "📄", available: true },
];

function AccessibilityPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'services',
    validTabs: ['services', 'requests', 'info'],
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessibilityRequest | null>(null);

  const { requests, isLoading, error, refetch } = useAccessibilityRequestsData();
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading accessibility services..." />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EmptyState
          title="Error Loading Services"
          description="Unable to load accessibility services. Please try again."
          action={{ label: "Retry", onClick: () => refetch() }}
          inverted
        />
      </GvtewayAppLayout>
    );
  }

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
            <StatCard label="Services Available" value={accessibilityServices.filter(s => s.available).length.toString()} inverted />
            <StatCard label="Active Requests" value={requests.length.toString()} inverted />
            <StatCard label="Pending Review" value={pendingRequests.toString()} inverted />
            <StatCard label="Satisfaction" value="98%" inverted />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('services')} onClick={() => setActiveTab('services')}>Available Services</Tab>
                <Tab active={isActive('requests')} onClick={() => setActiveTab('requests')}>My Requests</Tab>
                <Tab active={isActive('info')} onClick={() => setActiveTab('info')}>Venue Info</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowRequestModal(true)}>Request Accommodation</Button>
          </Stack>

          <TabPanel active={isActive('services')}>
            <Grid cols={4} gap={4}>
              {accessibilityServices.map((service) => (
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

          <TabPanel active={isActive('requests')}>
            <Stack gap={4}>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id} inverted className="p-4">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{request.event_title}</Body>
                        <Label className="text-on-dark-disabled">{new Date(request.created_at).toLocaleDateString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-on-dark-disabled">Type</Label>
                        <Badge variant="outline">{request.request_type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-on-dark-disabled">Event Date</Label>
                        <Label className="text-white">{new Date(request.event_date).toLocaleDateString()}</Label>
                      </Stack>
                      <Label className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Label>
                      <Button variant="outlineInk" size="sm" onClick={() => setSelectedRequest(request)}>Details</Button>
                    </Grid>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="No Requests Yet"
                  description="You haven't submitted any accessibility requests."
                  action={{ label: "Request Accommodation", onClick: () => setShowRequestModal(true) }}
                  inverted
                />
              )}
            </Stack>
          </TabPanel>

          <TabPanel active={isActive('info')}>
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
            <PhoneInput placeholder="Phone number" fullWidth />
            <Stack gap={2}>
              <Label>Services Needed (select all that apply)</Label>
              <Grid cols={2} gap={2}>
                {accessibilityServices.slice(0, 6).map(service => (
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
              <Body className="font-display">{selectedRequest.event_title}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-on-light-muted">Event Date</Label><Label>{new Date(selectedRequest.event_date).toLocaleDateString()}</Label></Stack>
                <Stack gap={1}><Label className="text-on-light-muted">Status</Label><Label className={getStatusColor(selectedRequest.status)}>{selectedRequest.status.toUpperCase()}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-on-light-muted">Requested Service</Label>
                <Badge variant="outline">{selectedRequest.request_type}</Badge>
              </Stack>
              {selectedRequest.notes && (
                <Stack gap={1}><Label className="text-on-light-muted">Notes</Label><Label>{selectedRequest.notes}</Label></Stack>
              )}
              <Stack gap={1}><Label className="text-on-light-muted">Submitted</Label><Label>{new Date(selectedRequest.created_at).toLocaleDateString()}</Label></Stack>
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

export default function AccessibilityPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading accessibility services..." />}>
      <AccessibilityPageContent />
    </Suspense>
  );
}
