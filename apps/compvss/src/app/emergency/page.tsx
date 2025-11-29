"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: number;
  category: "Production" | "Venue" | "Medical" | "Security" | "Fire" | "Police" | "Management";
  available: boolean;
}

interface EmergencyProcedure {
  id: string;
  type: "Fire" | "Medical" | "Weather" | "Security" | "Evacuation" | "Power Failure" | "Crowd Control";
  title: string;
  steps: string[];
  contacts: string[];
  lastUpdated: string;
}

const mockContacts: EmergencyContact[] = [
  { id: "EC-001", name: "John Martinez", role: "Production Manager", phone: "+1 555-0101", email: "john@company.com", priority: 1, category: "Production", available: true },
  { id: "EC-002", name: "Sarah Chen", role: "Stage Manager", phone: "+1 555-0102", priority: 2, category: "Production", available: true },
  { id: "EC-003", name: "Mike Thompson", role: "Technical Director", phone: "+1 555-0103", priority: 3, category: "Production", available: true },
  { id: "EC-004", name: "Venue Security", role: "Security Lead", phone: "+1 555-0200", priority: 1, category: "Security", available: true },
  { id: "EC-005", name: "On-Site Medical", role: "EMT Team Lead", phone: "+1 555-0300", priority: 1, category: "Medical", available: true },
  { id: "EC-006", name: "Tampa Fire Dept", role: "Fire Marshal", phone: "911", priority: 1, category: "Fire", available: true },
  { id: "EC-007", name: "Tampa PD", role: "Event Liaison", phone: "+1 555-0400", priority: 1, category: "Police", available: true },
  { id: "EC-008", name: "Venue Manager", role: "Facility Contact", phone: "+1 555-0500", priority: 1, category: "Venue", available: true },
];

const mockProcedures: EmergencyProcedure[] = [
  { id: "EP-001", type: "Fire", title: "Fire Emergency Response", steps: ["Activate fire alarm", "Call 911 immediately", "Notify Production Manager", "Begin evacuation per venue plan", "Account for all crew members", "Meet at designated assembly point"], contacts: ["Fire Marshal", "Production Manager", "Venue Manager"], lastUpdated: "2024-11-01" },
  { id: "EP-002", type: "Medical", title: "Medical Emergency Response", steps: ["Call for on-site medical team", "Do not move injured person unless danger", "Clear area around patient", "Notify Production Manager", "Document incident details", "Follow up with incident report"], contacts: ["EMT Team Lead", "Production Manager"], lastUpdated: "2024-11-01" },
  { id: "EP-003", type: "Weather", title: "Severe Weather Protocol", steps: ["Monitor weather alerts continuously", "Notify all department heads at warning", "Prepare for show hold at watch", "Evacuate outdoor areas if lightning within 8 miles", "Resume 30 minutes after last lightning"], contacts: ["Production Manager", "Venue Manager", "Security Lead"], lastUpdated: "2024-11-01" },
  { id: "EP-004", type: "Evacuation", title: "Full Venue Evacuation", steps: ["Announce evacuation via PA", "Stop show immediately", "House lights to full", "Open all exit doors", "Direct crowd to nearest exits", "Account for all personnel"], contacts: ["Production Manager", "Security Lead", "Venue Manager"], lastUpdated: "2024-11-01" },
  { id: "EP-005", type: "Power Failure", title: "Power Failure Response", steps: ["Remain calm - emergency lights will activate", "Notify Technical Director", "Check generator status", "Assess scope of outage", "Communicate status to all departments", "Prepare for show hold or cancellation"], contacts: ["Technical Director", "Venue Manager", "Production Manager"], lastUpdated: "2024-11-01" },
];

export default function EmergencyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("contacts");
  const [selectedProcedure, setSelectedProcedure] = useState<EmergencyProcedure | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Emergency Procedures"
        subtitle="Contact tree, emergency protocols, and response procedures"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Emergency' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Emergency Alert */}
            <Alert variant="warning">
              In case of life-threatening emergency, call 911 immediately
            </Alert>

            {/* Quick Access Cards */}
            <Grid cols={3} gap={4}>
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Medical") || null)}>
                <Stack gap={2} className="text-center">
                  <Body className="text-h5-md">🚑</Body>
                  <Body className="font-display">MEDICAL</Body>
                  <Body className="text-body-sm">Tap for procedure</Body>
                </Stack>
              </Card>
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Fire") || null)}>
                <Stack gap={2} className="text-center">
                  <Body className="text-h5-md">🔥</Body>
                  <Body className="font-display">FIRE</Body>
                  <Body className="text-body-sm">Tap for procedure</Body>
                </Stack>
              </Card>
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Evacuation") || null)}>
                <Stack gap={2} className="text-center">
                  <Body className="text-h5-md">🚨</Body>
                  <Body className="font-display">EVACUATION</Body>
                  <Body className="text-body-sm">Tap for procedure</Body>
                </Stack>
              </Card>
            </Grid>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")}>Contact Tree</Tab>
                  <Tab active={activeTab === "procedures"} onClick={() => setActiveTab("procedures")}>All Procedures</Tab>
                  <Tab active={activeTab === "assembly"} onClick={() => setActiveTab("assembly")}>Assembly Points</Tab>
                </TabsList>

                <TabPanel active={activeTab === "contacts"}>
                  <Stack gap={4} className="mt-6">
                    {["Production", "Medical", "Security", "Fire", "Police", "Venue"].map((category) => (
                      <Card key={category} className="p-4">
                        <Stack gap={3}>
                          <H3>{category}</H3>
                          <Grid cols={2} gap={3}>
                            {mockContacts.filter(c => c.category === category).sort((a, b) => a.priority - b.priority).map((contact) => (
                              <Card key={contact.id} className="p-3">
                                <Stack direction="horizontal" className="items-start justify-between">
                                  <Stack gap={1}>
                                    <Body className="font-display">{contact.name}</Body>
                                    <Body className="text-body-sm">{contact.role}</Body>
                                    <Body className="text-body-sm">{contact.phone}</Body>
                                  </Stack>
                                  <Stack gap={2}>
                                    <Badge variant={contact.available ? "solid" : "outline"}>
                                      {contact.available ? "Available" : "Unavailable"}
                                    </Badge>
                                    <Button variant="outline" size="sm" onClick={() => { setSelectedContact(contact); setShowCallModal(true); }}>
                                      Call
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Card>
                            ))}
                          </Grid>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel active={activeTab === "procedures"}>
                  <Grid cols={2} gap={4} className="mt-6">
                    {mockProcedures.map((procedure) => (
                      <Card key={procedure.id} className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedure)}>
                        <Stack gap={3}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <Badge variant="outline">{procedure.type}</Badge>
                              <Body className="font-display">{procedure.title}</Body>
                            </Stack>
                          </Stack>
                          <Body className="text-body-sm">{procedure.steps.length} steps • Updated {procedure.lastUpdated}</Body>
                          <Button variant="outline" size="sm">View Procedure</Button>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel active={activeTab === "assembly"}>
                  <Card className="mt-6 p-6">
                    <Stack gap={4}>
                      <H3>Emergency Assembly Points</H3>
                      <Grid cols={2} gap={4}>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="solid">Primary</Badge>
                            <Body className="font-display">North Parking Lot - Section A</Body>
                            <Body className="text-body-sm">Main assembly point for all personnel</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Secondary</Badge>
                            <Body className="font-display">South Plaza - Near Loading Dock</Body>
                            <Body className="text-body-sm">Alternate if primary is inaccessible</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Medical Staging</Badge>
                            <Body className="font-display">East Entrance - Ambulance Bay</Body>
                            <Body className="text-body-sm">Medical emergencies and triage</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Command Post</Badge>
                            <Body className="font-display">Production Office - Room 101</Body>
                            <Body className="text-body-sm">Emergency coordination center</Body>
                          </Stack>
                        </Card>
                      </Grid>
                    </Stack>
                  </Card>
                </TabPanel>
              </Tabs>
            </Card>

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="solid">Download Emergency Plan</Button>
              <Button variant="outline">Print Contact Cards</Button>
              <Button variant="outline" onClick={() => router.push("/safety")}>Safety Protocols</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      {/* Procedure Modal */}
      <Modal open={!!selectedProcedure} onClose={() => setSelectedProcedure(null)}>
        <ModalHeader><H3>{selectedProcedure?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedProcedure && (
            <Stack gap={4}>
              <Badge variant="solid">{selectedProcedure.type} Emergency</Badge>
              <Stack gap={2}>
                <Body className="font-display">Response Steps:</Body>
                {selectedProcedure.steps.map((step, idx) => (
                  <Card key={idx} className="p-3">
                    <Stack direction="horizontal" gap={3}>
                      <Badge variant="solid">{idx + 1}</Badge>
                      <Body>{step}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Key Contacts:</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedProcedure.contacts.map((contact) => (
                    <Badge key={contact} variant="outline">{contact}</Badge>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProcedure(null)}>Close</Button>
          <Button variant="solid">Print Procedure</Button>
        </ModalFooter>
      </Modal>

      {/* Call Modal */}
      <Modal open={showCallModal} onClose={() => setShowCallModal(false)}>
        <ModalHeader><H3>Contact</H3></ModalHeader>
        <ModalBody>
          {selectedContact && (
            <Stack gap={4} className="text-center">
              <Body className="text-h6-md font-display">{selectedContact.name}</Body>
              <Body className="text-body-sm">{selectedContact.role}</Body>
              <Card className="p-4">
                <Body className="text-h5-md">{selectedContact.phone}</Body>
              </Card>
              <Button variant="solid" className="w-full">Call Now</Button>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCallModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
