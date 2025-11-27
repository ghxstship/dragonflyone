"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface ExclusiveWindow {
  id: string;
  eventName: string;
  windowName: string;
  tier: "Platinum" | "Gold" | "Silver" | "All Members";
  startDate: string;
  endDate: string;
  ticketsAllocated: number;
  ticketsClaimed: number;
  status: "Upcoming" | "Active" | "Ended";
}

interface FanClubTier {
  name: string;
  members: number;
  benefits: string[];
  accessWindow: string;
  color: string;
}

const mockWindows: ExclusiveWindow[] = [
  { id: "EW-001", eventName: "Summer Music Festival 2025", windowName: "Platinum Presale", tier: "Platinum", startDate: "2024-12-01 10:00", endDate: "2024-12-02 10:00", ticketsAllocated: 200, ticketsClaimed: 0, status: "Upcoming" },
  { id: "EW-002", eventName: "Summer Music Festival 2025", windowName: "Gold Presale", tier: "Gold", startDate: "2024-12-02 10:00", endDate: "2024-12-03 10:00", ticketsAllocated: 500, ticketsClaimed: 0, status: "Upcoming" },
  { id: "EW-003", eventName: "Summer Music Festival 2025", windowName: "Member Presale", tier: "All Members", startDate: "2024-12-03 10:00", endDate: "2024-12-05 10:00", ticketsAllocated: 1000, ticketsClaimed: 0, status: "Upcoming" },
  { id: "EW-004", eventName: "New Year Gala", windowName: "VIP Access", tier: "Platinum", startDate: "2024-11-15 10:00", endDate: "2024-11-16 10:00", ticketsAllocated: 100, ticketsClaimed: 87, status: "Ended" },
];

const mockTiers: FanClubTier[] = [
  { name: "Platinum", members: 245, benefits: ["48-hour early access", "Meet & greet priority", "Exclusive merch", "VIP lounge access"], accessWindow: "48 hours", color: "bg-purple-100 border-purple-500" },
  { name: "Gold", members: 1250, benefits: ["24-hour early access", "Priority entry", "Member discounts", "Exclusive content"], accessWindow: "24 hours", color: "bg-warning-100 border-warning-500" },
  { name: "Silver", members: 4520, benefits: ["12-hour early access", "Member discounts", "Newsletter"], accessWindow: "12 hours", color: "bg-ink-100 border-ink-400" },
];

export default function ExclusiveAccessPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("windows");
  const [selectedWindow, setSelectedWindow] = useState<ExclusiveWindow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const upcomingWindows = mockWindows.filter(w => w.status === "Upcoming").length;
  const totalMembers = mockTiers.reduce((s, t) => s + t.members, 0);
  const totalClaimed = mockWindows.reduce((s, w) => s + w.ticketsClaimed, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Upcoming": return "text-info-600";
      case "Ended": return "text-ink-600";
      default: return "text-ink-600";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "bg-purple-100 text-purple-800";
      case "Gold": return "bg-warning-100 text-warning-800";
      case "Silver": return "bg-ink-100 text-ink-800";
      default: return "bg-info-100 text-info-800";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>EXCLUSIVE ACCESS</H1>
            <Body className="text-ink-600">Fan club presale windows and member benefits</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Upcoming Windows" value={upcomingWindows} className="border-2 border-black" />
            <StatCard label="Tickets Claimed" value={totalClaimed} className="border-2 border-black" />
            <StatCard label="Member Tiers" value={mockTiers.length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "windows"} onClick={() => setActiveTab("windows")}>Access Windows</Tab>
              <Tab active={activeTab === "tiers"} onClick={() => setActiveTab("tiers")}>Member Tiers</Tab>
              <Tab active={activeTab === "benefits"} onClick={() => setActiveTab("benefits")}>Benefits</Tab>
            </TabsList>

            <TabPanel active={activeTab === "windows"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Window</Button>
                </Stack>
                {mockWindows.map((window) => (
                  <Card key={window.id} className="border-2 border-black p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-bold">{window.eventName}</Body>
                        <Label className="text-ink-500">{window.windowName}</Label>
                      </Stack>
                      <Badge className={getTierColor(window.tier)}>{window.tier}</Badge>
                      <Stack gap={1}>
                        <Label className="text-ink-500">Window</Label>
                        <Label>{window.startDate.split(" ")[0]}</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-ink-500">Claimed</Label>
                          <Label>{window.ticketsClaimed} / {window.ticketsAllocated}</Label>
                        </Stack>
                        <ProgressBar value={(window.ticketsClaimed / window.ticketsAllocated) * 100} className="h-2" />
                      </Stack>
                      <Label className={getStatusColor(window.status)}>{window.status}</Label>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWindow(window)}>Manage</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "tiers"}>
              <Grid cols={3} gap={4}>
                {mockTiers.map((tier) => (
                  <Card key={tier.name} className={`border-2 ${tier.color} p-6`}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <H3>{tier.name}</H3>
                        <Label className="font-mono">{tier.members.toLocaleString()} members</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-ink-500">Early Access Window</Label>
                        <Label className="font-bold">{tier.accessWindow} before public</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="text-ink-500">Benefits</Label>
                        <Stack gap={1}>
                          {tier.benefits.map((benefit, idx) => (
                            <Label key={idx}>✓ {benefit}</Label>
                          ))}
                        </Stack>
                      </Stack>
                      <Button variant="outline" size="sm">Edit Tier</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "benefits"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Member Benefits Configuration</H3>
                  <Grid cols={2} gap={4}>
                    {[
                      { benefit: "Early Ticket Access", description: "Priority access to ticket sales", enabled: true },
                      { benefit: "Exclusive Merch", description: "Member-only merchandise", enabled: true },
                      { benefit: "Meet & Greet Priority", description: "First access to M&G packages", enabled: true },
                      { benefit: "VIP Lounge Access", description: "Access to member lounges at events", enabled: false },
                      { benefit: "Member Discounts", description: "Percentage off ticket purchases", enabled: true },
                      { benefit: "Exclusive Content", description: "Behind-the-scenes and exclusive videos", enabled: true },
                    ].map((item, idx) => (
                      <Card key={idx} className="p-4 border border-ink-200">
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Stack gap={1}>
                            <Label className="font-bold">{item.benefit}</Label>
                            <Label className="text-ink-500">{item.description}</Label>
                          </Stack>
                          <Button variant={item.enabled ? "solid" : "outline"} size="sm">
                            {item.enabled ? "Enabled" : "Disabled"}
                          </Button>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/fan-club")}>Back to Fan Club</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedWindow} onClose={() => setSelectedWindow(null)}>
        <ModalHeader><H3>Manage Access Window</H3></ModalHeader>
        <ModalBody>
          {selectedWindow && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedWindow.eventName}</Body>
              <Input defaultValue={selectedWindow.windowName} placeholder="Window Name" className="border-2 border-black" />
              <Select defaultValue={selectedWindow.tier} className="border-2 border-black">
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="All Members">All Members</option>
              </Select>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Start</Label>
                  <Input type="datetime-local" defaultValue={selectedWindow.startDate.replace(" ", "T")} className="border-2 border-black" />
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">End</Label>
                  <Input type="datetime-local" defaultValue={selectedWindow.endDate.replace(" ", "T")} className="border-2 border-black" />
                </Stack>
              </Grid>
              <Input type="number" defaultValue={selectedWindow.ticketsAllocated} placeholder="Tickets Allocated" className="border-2 border-black" />
              <Stack gap={2}>
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-ink-500">Tickets Claimed</Label>
                  <Label>{selectedWindow.ticketsClaimed} / {selectedWindow.ticketsAllocated}</Label>
                </Stack>
                <ProgressBar value={(selectedWindow.ticketsClaimed / selectedWindow.ticketsAllocated) * 100} className="h-3" />
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedWindow(null)}>Cancel</Button>
          <Button variant="outline" className="text-error-600">Delete</Button>
          <Button variant="solid" onClick={() => setSelectedWindow(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Access Window</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="e1">Summer Music Festival 2025</option>
              <option value="e2">Tech Conference 2025</option>
            </Select>
            <Input placeholder="Window Name (e.g., Platinum Presale)" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Member Tier...</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="All Members">All Members</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="datetime-local" placeholder="Start" className="border-2 border-black" />
              <Input type="datetime-local" placeholder="End" className="border-2 border-black" />
            </Grid>
            <Input type="number" placeholder="Tickets Allocated" className="border-2 border-black" />
            <Stack direction="horizontal" gap={2}>
              <Input type="checkbox" className="w-4 h-4" />
              <Label>Send notification to eligible members</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Window</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
