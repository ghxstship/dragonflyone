"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_EVENT_TEMPLATES,
  DEMO_RECENT_EVENTS,
  type DemoEventTemplate as EventTemplate,
  type DemoRecentEvent as RecentEvent,
} from "@/lib/demo-data";

const mockTemplates = DEMO_EVENT_TEMPLATES;
const mockRecentEvents = DEMO_RECENT_EVENTS;

function EventCloneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template_id');
  const eventId = searchParams.get('event_id');
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: eventId ? 'recent' : 'templates',
    validTabs: ['templates', 'clone', 'blank'],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(
    templateId ? mockTemplates.find(t => t.id === templateId) || null : null
  );
  const [selectedEvent, setSelectedEvent] = useState<RecentEvent | null>(
    eventId ? mockRecentEvents.find(e => e.id === eventId) || null : null
  );
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

  return (
    <GvtewayAppLayout>
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
              <Tab active={isActive('templates')} onClick={() => setActiveTab('templates')}>Templates</Tab>
              <Tab active={isActive('clone')} onClick={() => setActiveTab('clone')}>Clone Event</Tab>
              <Tab active={isActive('blank')} onClick={() => setActiveTab('blank')}>Start Blank</Tab>
            </TabsList>

            <TabPanel active={isActive('templates')}>
              <Grid cols={3} gap={4}>
                {mockTemplates.map((template) => (
                  <Card key={template.id} className="border-2 border-black p-6 cursor-pointer hover:bg-ink-50" onClick={() => setSelectedTemplate(template)}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-h4-md">{getTypeIcon(template.type)}</Label>
                        <Badge variant="outline">{template.type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="font-weight-bold">{template.name}</Body>
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

            <TabPanel active={isActive('clone')}>
              <Stack gap={4}>
                <Input type="search" placeholder="Search past events..." className="border-2 border-black" />
                {mockRecentEvents.map((event) => (
                  <Card key={event.id} className="border-2 border-black p-4 cursor-pointer hover:bg-ink-50" onClick={() => setSelectedEvent(event)}>
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-h5-md">{getTypeIcon(event.type)}</Label>
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{event.name}</Body>
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

            <TabPanel active={isActive('blank')}>
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

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>Use Template</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getTypeIcon(selectedTemplate.type)}</Label>
                <Stack gap={1}>
                  <Body className="font-weight-bold">{selectedTemplate.name}</Body>
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
                  <Body className="font-weight-bold">{selectedEvent.name}</Body>
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
    </GvtewayAppLayout>
  );
}

export default function EventClonePage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout />}>
      <EventCloneContent />
    </Suspense>
  );
}
