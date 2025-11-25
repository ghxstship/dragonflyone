"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H2, H3, Body, Label, Grid, Stack, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select, Alert,
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Medical": return "text-red-400";
      case "Fire": return "text-orange-400";
      case "Security": return "text-yellow-400";
      case "Police": return "text-blue-400";
      case "Production": return "text-green-400";
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
            <H1>Emergency Procedures</H1>
            <Label className="text-ink-400">Contact tree, emergency protocols, and response procedures</Label>
          </Stack>

          <Alert variant="warning">
            In case of life-threatening emergency, call 911 immediately
          </Alert>

          <Grid cols={3} gap={4}>
            <Card className="border-2 border-red-800 bg-red-900/20 p-4 cursor-pointer hover:bg-red-900/30" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Medical") || null)}>
              <Stack gap={2} className="text-center">
                <Label className="text-red-400 text-2xl">🚑</Label>
                <Body className="font-bold text-white">MEDICAL</Body>
                <Label size="xs" className="text-red-300">Tap for procedure</Label>
              </Stack>
            </Card>
            <Card className="border-2 border-orange-800 bg-orange-900/20 p-4 cursor-pointer hover:bg-orange-900/30" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Fire") || null)}>
              <Stack gap={2} className="text-center">
                <Label className="text-orange-400 text-2xl">🔥</Label>
                <Body className="font-bold text-white">FIRE</Body>
                <Label size="xs" className="text-orange-300">Tap for procedure</Label>
              </Stack>
            </Card>
            <Card className="border-2 border-blue-800 bg-blue-900/20 p-4 cursor-pointer hover:bg-blue-900/30" onClick={() => setSelectedProcedure(mockProcedures.find(p => p.type === "Evacuation") || null)}>
              <Stack gap={2} className="text-center">
                <Label className="text-blue-400 text-2xl">🚨</Label>
                <Body className="font-bold text-white">EVACUATION</Body>
                <Label size="xs" className="text-blue-300">Tap for procedure</Label>
              </Stack>
            </Card>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")}>Contact Tree</Tab>
              <Tab active={activeTab === "procedures"} onClick={() => setActiveTab("procedures")}>All Procedures</Tab>
              <Tab active={activeTab === "assembly"} onClick={() => setActiveTab("assembly")}>Assembly Points</Tab>
            </TabsList>

            <TabPanel active={activeTab === "contacts"}>
              <Stack gap={4}>
                {["Production", "Medical", "Security", "Fire", "Police", "Venue"].map((category) => (
                  <Card key={category} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <H3 className={getCategoryColor(category)}>{category}</H3>
                      <Grid cols={2} gap={3}>
                        {mockContacts.filter(c => c.category === category).sort((a, b) => a.priority - b.priority).map((contact) => (
                          <Card key={contact.id} className="p-3 bg-ink-800 border border-ink-700">
                            <Stack direction="horizontal" className="justify-between items-start">
                              <Stack gap={1}>
                                <Body className="text-white font-display">{contact.name}</Body>
                                <Label size="xs" className="text-ink-400">{contact.role}</Label>
                                <Label className="font-mono text-white">{contact.phone}</Label>
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
              <Grid cols={2} gap={4}>
                {mockProcedures.map((procedure) => (
                  <Card key={procedure.id} className="border-2 border-ink-800 bg-ink-900/50 p-4 cursor-pointer hover:border-ink-600" onClick={() => setSelectedProcedure(procedure)}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Badge variant="outline">{procedure.type}</Badge>
                          <Body className="text-white font-display">{procedure.title}</Body>
                        </Stack>
                      </Stack>
                      <Label size="xs" className="text-ink-500">{procedure.steps.length} steps • Updated {procedure.lastUpdated}</Label>
                      <Button variant="outline" size="sm">View Procedure</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "assembly"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Emergency Assembly Points</H3>
                  <Grid cols={2} gap={4}>
                    <Card className="p-4 bg-ink-800 border border-ink-700">
                      <Stack gap={2}>
                        <Badge variant="solid">Primary</Badge>
                        <Body className="text-white">North Parking Lot - Section A</Body>
                        <Label className="text-ink-400">Main assembly point for all personnel</Label>
                      </Stack>
                    </Card>
                    <Card className="p-4 bg-ink-800 border border-ink-700">
                      <Stack gap={2}>
                        <Badge variant="outline">Secondary</Badge>
                        <Body className="text-white">South Plaza - Near Loading Dock</Body>
                        <Label className="text-ink-400">Alternate if primary is inaccessible</Label>
                      </Stack>
                    </Card>
                    <Card className="p-4 bg-ink-800 border border-ink-700">
                      <Stack gap={2}>
                        <Badge variant="outline">Medical Staging</Badge>
                        <Body className="text-white">East Entrance - Ambulance Bay</Body>
                        <Label className="text-ink-400">Medical emergencies and triage</Label>
                      </Stack>
                    </Card>
                    <Card className="p-4 bg-ink-800 border border-ink-700">
                      <Stack gap={2}>
                        <Badge variant="outline">Command Post</Badge>
                        <Body className="text-white">Production Office - Room 101</Body>
                        <Label className="text-ink-400">Emergency coordination center</Label>
                      </Stack>
                    </Card>
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite">Download Emergency Plan</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Print Contact Cards</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/safety")}>Safety Protocols</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedProcedure} onClose={() => setSelectedProcedure(null)}>
        <ModalHeader><H3>{selectedProcedure?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedProcedure && (
            <Stack gap={4}>
              <Badge variant="solid">{selectedProcedure.type} Emergency</Badge>
              <Stack gap={2}>
                <Label className="text-ink-400">Response Steps:</Label>
                {selectedProcedure.steps.map((step, idx) => (
                  <Card key={idx} className="p-3 bg-ink-800 border border-ink-700">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-white font-mono w-6">{idx + 1}.</Label>
                      <Body className="text-white">{step}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Key Contacts:</Label>
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

      <Modal open={showCallModal} onClose={() => setShowCallModal(false)}>
        <ModalHeader><H3>Contact</H3></ModalHeader>
        <ModalBody>
          {selectedContact && (
            <Stack gap={4} className="text-center">
              <Body className="text-white font-display text-xl">{selectedContact.name}</Body>
              <Label className="text-ink-400">{selectedContact.role}</Label>
              <Card className="p-4 bg-ink-800 border border-ink-700">
                <Label className="font-mono text-white text-2xl">{selectedContact.phone}</Label>
              </Card>
              <Button variant="solid" className="w-full">Call Now</Button>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCallModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
