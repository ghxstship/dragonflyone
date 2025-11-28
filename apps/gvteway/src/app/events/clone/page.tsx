"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, LoadingSpinner,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface EventTemplate {
  id: string;
  name: string;
  type: "Concert" | "Festival" | "Corporate" | "Theater" | "Sports" | "Custom";
  description: string;
  lastUsed?: string;
  timesUsed: number;
  sections: string[];
}

interface RecentEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  type: string;
}

const mockTemplates: EventTemplate[] = [
  { id: "TPL-001", name: "Standard Concert", type: "Concert", description: "Single artist concert with GA and reserved seating", timesUsed: 45, lastUsed: "2024-11-20", sections: ["Event Info", "Ticketing", "Seating", "Marketing"] },
  { id: "TPL-002", name: "Multi-Day Festival", type: "Festival", description: "Multi-day outdoor festival with multiple stages", timesUsed: 12, lastUsed: "2024-10-15", sections: ["Event Info", "Ticketing", "Lineup", "Camping", "Vendors", "Marketing"] },
  { id: "TPL-003", name: "Corporate Conference", type: "Corporate", description: "Business conference with sessions and networking", timesUsed: 28, lastUsed: "2024-11-18", sections: ["Event Info", "Registration", "Sessions", "Sponsors", "Networking"] },
  { id: "TPL-004", name: "Theater Production", type: "Theater", description: "Theatrical performance with assigned seating", timesUsed: 15, lastUsed: "2024-11-10", sections: ["Event Info", "Ticketing", "Seating", "Cast", "Marketing"] },
  { id: "TPL-005", name: "Sporting Event", type: "Sports", description: "Sports event with tiered seating and concessions", timesUsed: 8, lastUsed: "2024-09-25", sections: ["Event Info", "Ticketing", "Seating", "Teams", "Concessions"] },
];

const mockRecentEvents: RecentEvent[] = [
  { id: "EVT-001", name: "Summer Music Festival 2024", date: "2024-08-15", venue: "Central Park", type: "Festival" },
  { id: "EVT-002", name: "Tech Conference 2024", date: "2024-10-20", venue: "Convention Center", type: "Corporate" },
  { id: "EVT-003", name: "Rock Concert Tour", date: "2024-11-05", venue: "Madison Square Garden", type: "Concert" },
  { id: "EVT-004", name: "Holiday Gala", date: "2024-12-15", venue: "Grand Ballroom", type: "Corporate" },
];

function EventCloneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<RecentEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Concert": return "🎵";
      case "Festival": return "🎪";
      case "Corporate": return "💼";
      case "Theater": return "🎭";
      case "Sports": return "⚽";
      case "Custom": return "✨";
      default: return "📅";
    }
  };

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Events">
        <FooterLink href="/events">Events</FooterLink>
        <FooterLink href="/events/clone">Create Event</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Create Event</H2>
              <Body className="text-on-dark-muted">Clone from template or existing event</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Templates" value={mockTemplates.length} className="border-2 border-black" />
            <StatCard label="Recent Events" value={mockRecentEvents.length} className="border-2 border-black" />
            <StatCard label="Most Used" value="Concert" className="border-2 border-black" />
            <StatCard label="Events Created" value={108} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "templates"} onClick={() => setActiveTab("templates")}>Templates</Tab>
              <Tab active={activeTab === "clone"} onClick={() => setActiveTab("clone")}>Clone Event</Tab>
              <Tab active={activeTab === "blank"} onClick={() => setActiveTab("blank")}>Start Blank</Tab>
            </TabsList>

            <TabPanel active={activeTab === "templates"}>
              <Grid cols={3} gap={4}>
                {mockTemplates.map((template) => (
                  <Card key={template.id} className="border-2 border-black p-6 cursor-pointer hover:bg-ink-50" onClick={() => setSelectedTemplate(template)}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-h4-md">{getTypeIcon(template.type)}</Label>
                        <Badge variant="outline">{template.type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="font-bold">{template.name}</Body>
                        <Label className="text-ink-500">{template.description}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Label size="xs" className="text-ink-600">Used {template.timesUsed} times</Label>
                        {template.lastUsed && <Label size="xs" className="text-ink-600">Last: {template.lastUsed}</Label>}
                      </Stack>
                      <Button variant="solid" size="sm">Use Template</Button>
                    </Stack>
                  </Card>
                ))}
                <Card className="border-2 border-dashed border-ink-300 p-6 cursor-pointer hover:border-black" onClick={() => setShowCreateModal(true)}>
                  <Stack gap={4} className="items-center justify-center h-full">
                    <Label className="text-h3-md">➕</Label>
                    <Body className="text-ink-500">Create Custom Template</Body>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "clone"}>
              <Stack gap={4}>
                <Input type="search" placeholder="Search past events..." className="border-2 border-black" />
                {mockRecentEvents.map((event) => (
                  <Card key={event.id} className="border-2 border-black p-4 cursor-pointer hover:bg-ink-50" onClick={() => setSelectedEvent(event)}>
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-h5-md">{getTypeIcon(event.type)}</Label>
                        <Stack gap={1}>
                          <Body className="font-bold">{event.name}</Body>
                          <Badge variant="outline">{event.type}</Badge>
                        </Stack>
                      </Stack>
                      <Label className="text-ink-600">{event.venue}</Label>
                      <Label className="text-ink-500">{event.date}</Label>
                      <Button variant="outline" size="sm">Clone</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "blank"}>
              <Card className="border-2 border-black p-8">
                <Stack gap={6}>
                  <H3>Start from Scratch</H3>
                  <Body className="text-ink-600">Create a new event without using a template. You will configure all settings manually.</Body>
                  <Grid cols={2} gap={4}>
                    <Input placeholder="Event Name" className="border-2 border-black" />
                    <Select className="border-2 border-black">
                      <option value="">Event Type...</option>
                      <option value="concert">Concert</option>
                      <option value="festival">Festival</option>
                      <option value="corporate">Corporate</option>
                      <option value="theater">Theater</option>
                      <option value="sports">Sports</option>
                    </Select>
                  </Grid>
                  <Grid cols={2} gap={4}>
                    <Input type="date" className="border-2 border-black" />
                    <Select className="border-2 border-black">
                      <option value="">Select Venue...</option>
                      <option value="v1">Madison Square Garden</option>
                      <option value="v2">Central Park</option>
                      <option value="v3">Convention Center</option>
                    </Select>
                  </Grid>
                  <Button variant="solid">Create Event</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/events")}>Back to Events</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>Use Template</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getTypeIcon(selectedTemplate.type)}</Label>
                <Stack gap={1}>
                  <Body className="font-bold">{selectedTemplate.name}</Body>
                  <Badge variant="outline">{selectedTemplate.type}</Badge>
                </Stack>
              </Stack>
              <Body className="text-ink-600">{selectedTemplate.description}</Body>
              <Stack gap={2}>
                <Label className="text-ink-500">Included Sections</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedTemplate.sections.map((section, idx) => (
                    <Badge key={idx} variant="outline">{section}</Badge>
                  ))}
                </Stack>
              </Stack>
              <Input placeholder="New Event Name" className="border-2 border-black" />
              <Grid cols={2} gap={4}>
                <Input type="date" className="border-2 border-black" />
                <Select className="border-2 border-black">
                  <option value="">Select Venue...</option>
                  <option value="v1">Madison Square Garden</option>
                  <option value="v2">Central Park</option>
                </Select>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setSelectedTemplate(null); router.push("/events/create"); }}>Create Event</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <ModalHeader><H3>Clone Event</H3></ModalHeader>
        <ModalBody>
          {selectedEvent && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getTypeIcon(selectedEvent.type)}</Label>
                <Stack gap={1}>
                  <Body className="font-bold">{selectedEvent.name}</Body>
                  <Badge variant="outline">{selectedEvent.type}</Badge>
                </Stack>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Original Date</Label><Label>{selectedEvent.date}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Venue</Label><Label>{selectedEvent.venue}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-500">What to copy</Label>
                <Stack gap={1}>
                  {["Event Details", "Ticket Types", "Seating Layout", "Marketing Content", "Team Members"].map((item, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2}>
                      <Input type="checkbox" defaultChecked className="w-4 h-4" />
                      <Label>{item}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
              <Input placeholder="New Event Name" defaultValue={`${selectedEvent.name} (Copy)`} className="border-2 border-black" />
              <Input type="date" className="border-2 border-black" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedEvent(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setSelectedEvent(null); router.push("/events/create"); }}>Clone Event</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Template</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Template Name" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Event Type...</option>
              <option value="concert">Concert</option>
              <option value="festival">Festival</option>
              <option value="corporate">Corporate</option>
              <option value="theater">Theater</option>
              <option value="sports">Sports</option>
              <option value="custom">Custom</option>
            </Select>
            <Textarea placeholder="Description..." rows={2} className="border-2 border-black" />
            <Stack gap={2}>
              <Label className="text-ink-500">Include Sections</Label>
              <Grid cols={2} gap={2}>
                {["Event Info", "Ticketing", "Seating", "Marketing", "Sponsors", "Lineup"].map((section, idx) => (
                  <Stack key={idx} direction="horizontal" gap={2}>
                    <Input type="checkbox" className="w-4 h-4" />
                    <Label>{section}</Label>
                  </Stack>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Template</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}

export default function EventClonePage() {
  return (
    <Suspense fallback={
      <Section background="black" className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    }>
      <EventCloneContent />
    </Suspense>
  );
}
