"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Kicker,
} from "@ghxstship/ui";

import { DEMO_EVENT_TEMPLATES } from "@/lib/demo-data";

interface EventTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  settings: { ticketTypes: number; sections: number; addOns: number };
}

const mockTemplates: EventTemplate[] = DEMO_EVENT_TEMPLATES.map(t => ({
  id: t.id,
  name: t.name,
  type: t.type,
  description: t.description,
  usageCount: t.timesUsed,
  lastUsed: t.lastUsed,
  createdBy: 'System',
  settings: { ticketTypes: 3, sections: t.sections.length, addOns: 4 },
}));

export default function EventTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Event Templates</H2>
              <Body className="text-on-dark-muted">Create events faster with pre-configured templates</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Templates" value={mockTemplates.length} className="border-2 border-black" />
            <StatCard label="Total Uses" value={mockTemplates.reduce((s, t) => s + t.usageCount, 0)} className="border-2 border-black" />
            <StatCard label="Event Types" value={new Set(mockTemplates.map(t => t.type)).size} className="border-2 border-black" />
            <StatCard label="Time Saved" value="85%" className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Input type="search" placeholder="Search templates..." className="border-2 border-black w-64" />
            <Button variant="solid" onClick={() => router.push("/events/create")}>Create Template</Button>
          </Stack>

          <Grid cols={2} gap={4}>
            {mockTemplates.map((template) => (
              <Card key={template.id} className="border-2 border-black p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="font-weight-bold">{template.name}</Body>
                    <Badge variant="outline">{template.type}</Badge>
                  </Stack>
                  <Label className="text-ink-500">{template.description}</Label>
                  <Grid cols={3} gap={4}>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Ticket Types</Label><Label className="font-mono">{template.settings.ticketTypes}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Sections</Label><Label className="font-mono">{template.settings.sections}</Label></Stack>
                    <Stack gap={1}><Label size="xs" className="text-ink-600">Add-ons</Label><Label className="font-mono">{template.settings.addOns}</Label></Stack>
                  </Grid>
                  <Stack direction="horizontal" className="justify-between">
                    <Label size="xs" className="text-ink-600">Used {template.usageCount} times</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>Preview</Button>
                      <Button variant="solid" size="sm" onClick={() => { setSelectedTemplate(template); setShowCloneModal(true); }}>Use Template</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outlineInk" onClick={() => router.push("/events")}>Back to Events</Button>
          </Stack>

      <Modal open={!!selectedTemplate && !showCloneModal} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>{selectedTemplate?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedTemplate.type}</Badge>
              <Body>{selectedTemplate.description}</Body>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label className="text-ink-600">Ticket Types</Label><Label className="font-mono text-h6-md">{selectedTemplate.settings.ticketTypes}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-600">Sections</Label><Label className="font-mono text-h6-md">{selectedTemplate.settings.sections}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-600">Add-ons</Label><Label className="font-mono text-h6-md">{selectedTemplate.settings.addOns}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-600">Created By</Label><Label>{selectedTemplate.createdBy}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="solid" onClick={() => setShowCloneModal(true)}>Use Template</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCloneModal} onClose={() => { setShowCloneModal(false); setSelectedTemplate(null); }}>
        <ModalHeader><H3>Create Event from Template</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Label className="text-ink-500">Template: {selectedTemplate?.name}</Label>
            <Input placeholder="Event Name" className="border-2 border-black" />
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-2 border-black" />
              <Input type="time" className="border-2 border-black" />
            </Grid>
            <Select className="border-2 border-black">
              <option value="">Select Venue...</option>
              <option value="VEN-001">Main Arena</option>
              <option value="VEN-002">Outdoor Stage</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowCloneModal(false); setSelectedTemplate(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => router.push("/events/create")}>Create Event</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
