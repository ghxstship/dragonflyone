"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
import { Ambulance, Flame, AlertTriangle } from "lucide-react";
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

import {
  useEmergencyContacts,
  useEmergencyProcedures,
  type EmergencyContact,
  type EmergencyProcedure,
} from "../../hooks/useEmergency";

export default function EmergencyPage() {
  const router = useRouter();
  
  // Fetch emergency data from API
  const { data: contacts = [] } = useEmergencyContacts();
  const { data: procedures = [] } = useEmergencyProcedures();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'contacts',
    validTabs: ['contacts', 'procedures', 'assembly'],
  });
  const [selectedProcedure, setSelectedProcedure] = useState<EmergencyProcedure | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Emergency Procedures"
        subtitle="Contact tree, emergency protocols, and response procedures"


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
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Medical") || null)}>
                <Stack gap={2} className="text-center">
                  <Ambulance className="size-8 mx-auto" />
                  <Body className="font-display">MEDICAL</Body>
                  <Body size="sm" className="">Tap for procedure</Body>
                </Stack>
              </Card>
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Fire") || null)}>
                <Stack gap={2} className="text-center">
                  <Flame className="size-8 mx-auto" />
                  <Body className="font-display">FIRE</Body>
                  <Body size="sm" className="">Tap for procedure</Body>
                </Stack>
              </Card>
              <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Evacuation") || null)}>
                <Stack gap={2} className="text-center">
                  <AlertTriangle className="size-8 mx-auto" />
                  <Body className="font-display">EVACUATION</Body>
                  <Body size="sm" className="">Tap for procedure</Body>
                </Stack>
              </Card>
            </Grid>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('contacts')} onClick={() => setActiveTab('contacts')}>Contact Tree</Tab>
                  <Tab active={isActive('procedures')} onClick={() => setActiveTab('procedures')}>All Procedures</Tab>
                  <Tab active={isActive('assembly')} onClick={() => setActiveTab('assembly')}>Assembly Points</Tab>
                </TabsList>

                <TabPanel active={isActive('contacts')}>
                  <Stack gap={4} className="mt-6">
                    {["Production", "Medical", "Security", "Fire", "Police", "Venue"].map((category) => (
                      <Card key={category} className="p-4">
                        <Stack gap={3}>
                          <H3>{category}</H3>
                          <Grid cols={2} gap={3}>
                            {contacts.filter(c => c.category === category).sort((a, b) => a.priority - b.priority).map((contact) => (
                              <Card key={contact.id} className="p-3">
                                <Stack direction="horizontal" className="items-start justify-between">
                                  <Stack gap={1}>
                                    <Body className="font-display">{contact.name}</Body>
                                    <Body size="sm" className="">{contact.role}</Body>
                                    <Body size="sm" className="">{contact.phone}</Body>
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

                <TabPanel active={isActive('procedures')}>
                  <Grid cols={2} gap={4} className="mt-6">
                    {procedures.map((procedure) => (
                      <Card key={procedure.id} className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedure)}>
                        <Stack gap={3}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <Badge variant="outline">{procedure.type}</Badge>
                              <Body className="font-display">{procedure.title}</Body>
                            </Stack>
                          </Stack>
                          <Body size="sm" className="">{procedure.steps.length} steps • Updated {procedure.lastUpdated}</Body>
                          <Button variant="outline" size="sm">View Procedure</Button>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel active={isActive('assembly')}>
                  <Card className="mt-6 p-6">
                    <Stack gap={4}>
                      <H3>Emergency Assembly Points</H3>
                      <Grid cols={2} gap={4}>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="solid">Primary</Badge>
                            <Body className="font-display">North Parking Lot - Section A</Body>
                            <Body size="sm" className="">Main assembly point for all personnel</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Secondary</Badge>
                            <Body className="font-display">South Plaza - Near Loading Dock</Body>
                            <Body size="sm" className="">Alternate if primary is inaccessible</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Medical Staging</Badge>
                            <Body className="font-display">East Entrance - Ambulance Bay</Body>
                            <Body size="sm" className="">Medical emergencies and triage</Body>
                          </Stack>
                        </Card>
                        <Card className="p-4">
                          <Stack gap={2}>
                            <Badge variant="outline">Command Post</Badge>
                            <Body className="font-display">Production Office - Room 101</Body>
                            <Body size="sm" className="">Emergency coordination center</Body>
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
              <Body size="sm" className="">{selectedContact.role}</Body>
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
