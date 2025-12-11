"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_EXCLUSIVE_WINDOWS,
  DEMO_FAN_CLUB_TIERS,
  type DemoExclusiveWindow as ExclusiveWindow,
  type DemoFanClubTier as FanClubTier,
} from "@/lib/demo-data";

const mockWindows = DEMO_EXCLUSIVE_WINDOWS;
const mockTiers = DEMO_FAN_CLUB_TIERS;

function ExclusiveAccessPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'windows',
    validTabs: ['windows', 'tiers', 'benefits'],
  });
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
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Fan Club</Kicker>
              <H2 size="lg" className="text-white">Exclusive Access</H2>
              <Body className="text-on-dark-muted">Fan club presale windows and member benefits</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Upcoming Windows" value={upcomingWindows} className="border-2 border-black" />
            <StatCard label="Tickets Claimed" value={totalClaimed} className="border-2 border-black" />
            <StatCard label="Member Tiers" value={mockTiers.length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('windows')} onClick={() => setActiveTab('windows')}>Access Windows</Tab>
              <Tab active={isActive('tiers')} onClick={() => setActiveTab('tiers')}>Member Tiers</Tab>
              <Tab active={isActive('benefits')} onClick={() => setActiveTab('benefits')}>Benefits</Tab>
            </TabsList>

            <TabPanel active={isActive('windows')}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Window</Button>
                </Stack>
                {mockWindows.map((window) => (
                  <Card key={window.id} className="border-2 border-black p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-weight-bold">{window.eventName}</Body>
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

            <TabPanel active={isActive('tiers')}>
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
                        <Label className="font-weight-bold">{tier.accessWindow} before public</Label>
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

            <TabPanel active={isActive('benefits')}>
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
                      <Card key={idx} className="p-4 border-2 border-ink-200">
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Stack gap={1}>
                            <Label className="font-weight-bold">{item.benefit}</Label>
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

          <Button variant="outlineInk" onClick={() => router.push("/fan-club")}>Back to Fan Club</Button>
          </Stack>

      <Modal open={!!selectedWindow} onClose={() => setSelectedWindow(null)}>
        <ModalHeader><H3>Manage Access Window</H3></ModalHeader>
        <ModalBody>
          {selectedWindow && (
            <Stack gap={4}>
              <Body className="font-weight-bold">{selectedWindow.eventName}</Body>
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
    </GvtewayAppLayout>
  );
}

export default function ExclusiveAccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ExclusiveAccessPageContent />
    </Suspense>
  );
}
