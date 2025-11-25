"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface CalendarEvent {
  id: string;
  title: string;
  type: "Meeting" | "Call" | "Task" | "Reminder";
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  linkedContact?: string;
  linkedDeal?: string;
  location?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

const mockEvents: CalendarEvent[] = [
  { id: "EVT-001", title: "Client Discovery Call", type: "Call", date: "2024-11-25", time: "10:00 AM", duration: "30 min", attendees: ["John Smith", "Client Rep"], linkedContact: "Festival Productions", linkedDeal: "Summer Fest 2025", status: "Scheduled" },
  { id: "EVT-002", title: "Site Visit - Grand Arena", type: "Meeting", date: "2024-11-25", time: "2:00 PM", duration: "2 hrs", attendees: ["John Smith", "Sarah Johnson", "Venue Manager"], linkedContact: "Grand Arena", location: "123 Arena Blvd", status: "Scheduled" },
  { id: "EVT-003", title: "Proposal Review", type: "Meeting", date: "2024-11-26", time: "11:00 AM", duration: "1 hr", attendees: ["Sales Team"], linkedDeal: "Corporate Gala 2024", status: "Scheduled" },
  { id: "EVT-004", title: "Follow-up: Tech Corp", type: "Task", date: "2024-11-26", time: "3:00 PM", duration: "15 min", attendees: ["John Smith"], linkedContact: "Tech Corp", status: "Scheduled" },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarIntegrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const todayEvents = mockEvents.filter(e => e.date === "2024-11-25").length;
  const upcomingMeetings = mockEvents.filter(e => e.type === "Meeting").length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Meeting": return "👥";
      case "Call": return "📞";
      case "Task": return "✅";
      case "Reminder": return "🔔";
      default: return "📅";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Meeting": return "bg-blue-900/30 border-blue-800";
      case "Call": return "bg-green-900/30 border-green-800";
      case "Task": return "bg-yellow-900/30 border-yellow-800";
      case "Reminder": return "bg-purple-900/30 border-purple-800";
      default: return "bg-ink-800 border-ink-700";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Calendar Integration</H1>
            <Label className="text-ink-400">Sync calendars and schedule meetings with contacts</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Today's Events" value={todayEvents} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="This Week" value={mockEvents.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Meetings" value={upcomingMeetings} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Synced Calendars" value={2} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "week"} onClick={() => setActiveTab("week")}>Week</Tab>
                <Tab active={activeTab === "list"} onClick={() => setActiveTab("list")}>List</Tab>
                <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>+ Schedule Meeting</Button>
          </Stack>

          <TabPanel active={activeTab === "week"}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
              <Grid cols={6} gap={0}>
                {weekDays.slice(1).map((day, idx) => (
                  <Card key={day} className="p-3 border-r border-b border-ink-800 last:border-r-0">
                    <Stack gap={1} className="text-center">
                      <Label className="text-ink-400">{day}</Label>
                      <Label className="text-white text-lg">{25 + idx}</Label>
                    </Stack>
                  </Card>
                ))}
                {weekDays.slice(1).map((day, dayIdx) => (
                  <Card key={`events-${day}`} className="p-2 border-r border-ink-800 last:border-r-0 min-h-48">
                    <Stack gap={2}>
                      {mockEvents.filter(e => {
                        const eventDay = parseInt(e.date.split("-")[2]);
                        return eventDay === 25 + dayIdx;
                      }).map((event) => (
                        <Card key={event.id} className={`p-2 border ${getTypeColor(event.type)} cursor-pointer`} onClick={() => setSelectedEvent(event)}>
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-400">{event.time}</Label>
                            <Label size="xs" className="text-white">{event.title}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Card>
          </TabPanel>

          <TabPanel active={activeTab === "list"}>
            <Stack gap={4}>
              {mockEvents.map((event) => (
                <Card key={event.id} className={`border-2 ${getTypeColor(event.type)} p-4 cursor-pointer`} onClick={() => setSelectedEvent(event)}>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-2xl">{getTypeIcon(event.type)}</Label>
                      <Stack gap={1}>
                        <Label className="text-white">{event.title}</Label>
                        <Badge variant="outline">{event.type}</Badge>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-400">{event.date}</Label>
                      <Label className="text-white">{event.time}</Label>
                    </Stack>
                    <Label className="text-ink-400">{event.duration}</Label>
                    <Stack direction="horizontal" gap={1}>
                      {event.attendees.slice(0, 2).map((a, idx) => (
                        <Card key={idx} className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center">
                          <Label size="xs">{a.split(" ").map(n => n[0]).join("")}</Label>
                        </Card>
                      ))}
                      {event.attendees.length > 2 && <Label size="xs" className="text-ink-500">+{event.attendees.length - 2}</Label>}
                    </Stack>
                    {event.linkedDeal && <Badge variant="solid">{event.linkedDeal}</Badge>}
                    <Button variant="ghost" size="sm">Details</Button>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel active={activeTab === "settings"}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={6}>
                <H3>Connected Calendars</H3>
                <Stack gap={4}>
                  {[{ name: "Google Calendar", email: "john@company.com", icon: "📅" }, { name: "Outlook", email: "john@company.com", icon: "📆" }].map((cal, idx) => (
                    <Card key={idx} className="p-4 border border-ink-700">
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={3}>
                          <Label className="text-2xl">{cal.icon}</Label>
                          <Stack gap={0}>
                            <Label className="text-white">{cal.name}</Label>
                            <Label size="xs" className="text-ink-400">{cal.email}</Label>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Label className="text-green-400">Connected</Label>
                          <Button variant="ghost" size="sm" className="text-red-400">Disconnect</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
                <Button variant="outlineWhite">+ Connect Calendar</Button>
              </Stack>
            </Card>
          </TabPanel>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/contacts")}>Contacts</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/deals")}>Deals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <ModalHeader><H3>{selectedEvent?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedEvent && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className="text-2xl">{getTypeIcon(selectedEvent.type)}</Label>
                <Badge variant="outline">{selectedEvent.type}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Date</Label><Label className="text-white">{selectedEvent.date}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Time</Label><Label className="text-white">{selectedEvent.time}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Duration</Label><Label className="text-white">{selectedEvent.duration}</Label></Stack>
              {selectedEvent.location && <Stack gap={1}><Label className="text-ink-400">Location</Label><Label className="text-white">{selectedEvent.location}</Label></Stack>}
              <Stack gap={2}>
                <Label className="text-ink-400">Attendees</Label>
                <Stack direction="horizontal" gap={2}>
                  {selectedEvent.attendees.map((a, idx) => <Badge key={idx} variant="outline">{a}</Badge>)}
                </Stack>
              </Stack>
              {(selectedEvent.linkedContact || selectedEvent.linkedDeal) && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Linked Records</Label>
                  <Stack direction="horizontal" gap={2}>
                    {selectedEvent.linkedContact && <Badge variant="outline">{selectedEvent.linkedContact}</Badge>}
                    {selectedEvent.linkedDeal && <Badge variant="solid">{selectedEvent.linkedDeal}</Badge>}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
          <Button variant="outline">Edit</Button>
          <Button variant="solid">Join Meeting</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Schedule Meeting</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Meeting Title" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Type...</option>
              <option value="Meeting">Meeting</option>
              <option value="Call">Call</option>
              <option value="Task">Task</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-ink-700 bg-black text-white" />
              <Input type="time" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Duration...</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </Select>
            <Input placeholder="Location (optional)" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Notes..." rows={2} className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Schedule</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
