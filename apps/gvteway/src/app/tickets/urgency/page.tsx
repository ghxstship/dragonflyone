"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Kicker,
} from "@ghxstship/ui";

interface UrgencyTactic {
  id: string;
  eventName: string;
  type: "Countdown" | "Low Inventory" | "Price Increase" | "Last Chance";
  message: string;
  status: "Active" | "Scheduled" | "Ended";
  startDate?: string;
  endDate?: string;
  threshold?: number;
  currentValue?: number;
  conversions: number;
}

const mockTactics: UrgencyTactic[] = [
  { id: "UT-001", eventName: "Summer Music Festival 2025", type: "Countdown", message: "Early bird pricing ends in", status: "Active", endDate: "2024-12-15", conversions: 156 },
  { id: "UT-002", eventName: "Summer Music Festival 2025", type: "Low Inventory", message: "Only {count} VIP tickets left!", status: "Active", threshold: 50, currentValue: 23, conversions: 89 },
  { id: "UT-003", eventName: "New Year Gala", type: "Price Increase", message: "Price increases by $25 in", status: "Scheduled", startDate: "2024-12-01", endDate: "2024-12-10", conversions: 0 },
  { id: "UT-004", eventName: "Tech Conference 2025", type: "Last Chance", message: "Final tickets available!", status: "Active", threshold: 20, currentValue: 12, conversions: 45 },
];

export default function UrgencyTacticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedTactic, setSelectedTactic] = useState<UrgencyTactic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countdown, setCountdown] = useState({ days: 20, hours: 14, minutes: 32, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTactics = mockTactics.filter(t => t.status === "Active").length;
  const totalConversions = mockTactics.reduce((s, t) => s + t.conversions, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Scheduled": return "text-info-600";
      case "Ended": return "text-ink-600";
      default: return "text-ink-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Countdown": return "⏰";
      case "Low Inventory": return "🔥";
      case "Price Increase": return "📈";
      case "Last Chance": return "⚡";
      default: return "📊";
    }
  };

  const filteredTactics = activeTab === "all" ? mockTactics :
    mockTactics.filter(t => t.status.toLowerCase() === activeTab);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Marketing</Kicker>
              <H2 size="lg" className="text-white">Urgency Tactics</H2>
              <Body className="text-on-dark-muted">Countdown timers and low inventory alerts</Body>
            </Stack>

          <Card className="border-2 border-error-500 p-6 bg-error-50">
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <Stack gap={1}>
                  <Label className="text-error-600 font-bold">🔥 EARLY BIRD ENDS SOON</Label>
                  <Body>Summer Music Festival 2025 - Save $50 on tickets</Body>
                </Stack>
                <Button variant="solid">Get Tickets</Button>
              </Stack>
              <Grid cols={4} gap={4}>
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <Card key={item.label} className="p-3 border-2 border-error-300 text-center bg-white">
                    <Label className="font-mono text-h4-md text-error-600">{String(item.value).padStart(2, "0")}</Label>
                    <Label className="text-ink-500">{item.label}</Label>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Tactics" value={activeTactics} className="border-2 border-black" />
            <StatCard label="Total Conversions" value={totalConversions} className="border-2 border-black" />
            <StatCard label="Avg Lift" value="+23%" trend="up" className="border-2 border-black" />
            <StatCard label="Events Using" value={3} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
                <Tab active={activeTab === "scheduled"} onClick={() => setActiveTab("scheduled")}>Scheduled</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Tactic</Button>
          </Stack>

          <Stack gap={4}>
            {filteredTactics.map((tactic) => (
              <Card key={tactic.id} className="border-2 border-black p-6">
                <Grid cols={6} gap={4} className="items-center">
                  <Stack direction="horizontal" gap={3}>
                    <Label className="text-h5-md">{getTypeIcon(tactic.type)}</Label>
                    <Stack gap={1}>
                      <Body className="font-bold">{tactic.eventName}</Body>
                      <Badge variant="outline">{tactic.type}</Badge>
                    </Stack>
                  </Stack>
                  <Stack gap={1} className="col-span-2">
                    <Label className="text-ink-500">Message</Label>
                    <Label>{tactic.message}</Label>
                  </Stack>
                  {tactic.threshold && (
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-ink-500">Inventory</Label>
                        <Label className={tactic.currentValue && tactic.currentValue < 25 ? "text-error-600" : ""}>{tactic.currentValue} / {tactic.threshold}</Label>
                      </Stack>
                      <ProgressBar value={((tactic.currentValue || 0) / tactic.threshold) * 100} className="h-2" />
                    </Stack>
                  )}
                  {!tactic.threshold && <Label className="text-ink-500">{tactic.endDate}</Label>}
                  <Stack gap={1}>
                    <Label className={getStatusColor(tactic.status)}>{tactic.status}</Label>
                    <Label className="text-ink-500">{tactic.conversions} conversions</Label>
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTactic(tactic)}>Configure</Button>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <H3>Low Inventory Alert Preview</H3>
              <Grid cols={2} gap={4}>
                <Card className="p-4 border-2 border-warning-500 bg-warning-50">
                  <Stack direction="horizontal" gap={3}>
                    <Label className="text-h5-md">🔥</Label>
                    <Stack gap={1}>
                      <Label className="font-bold text-warning-600">Only 23 VIP tickets left!</Label>
                      <Label className="text-ink-600">High demand - selling fast</Label>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="p-4 border-2 border-error-500 bg-error-50">
                  <Stack direction="horizontal" gap={3}>
                    <Label className="text-h5-md">⚡</Label>
                    <Stack gap={1}>
                      <Label className="font-bold text-error-600">Final 12 tickets available!</Label>
                      <Label className="text-ink-600">Last chance to attend</Label>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Button variant="outlineInk" onClick={() => router.push("/tickets")}>Back to Tickets</Button>
          </Stack>
      <Modal open={!!selectedTactic} onClose={() => setSelectedTactic(null)}>
        <ModalHeader><H3>Configure Tactic</H3></ModalHeader>
        <ModalBody>
          {selectedTactic && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h5-md">{getTypeIcon(selectedTactic.type)}</Label>
                <Stack gap={1}>
                  <Body className="font-bold">{selectedTactic.eventName}</Body>
                  <Badge variant="outline">{selectedTactic.type}</Badge>
                </Stack>
              </Stack>
              <Input defaultValue={selectedTactic.message} placeholder="Message" className="border-2 border-black" />
              {selectedTactic.type === "Countdown" && (
                <Grid cols={2} gap={4}>
                  <Input type="datetime-local" placeholder="Start" className="border-2 border-black" />
                  <Input type="datetime-local" defaultValue={selectedTactic.endDate} placeholder="End" className="border-2 border-black" />
                </Grid>
              )}
              {(selectedTactic.type === "Low Inventory" || selectedTactic.type === "Last Chance") && (
                <Input type="number" defaultValue={selectedTactic.threshold} placeholder="Threshold" className="border-2 border-black" />
              )}
              <Stack gap={2}>
                <Label className="text-ink-500">Display Options</Label>
                <Stack gap={1}>
                  {["Show on event page", "Show in checkout", "Show in email", "Show in app notifications"].map((opt, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2}>
                      <Input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4" />
                      <Label>{opt}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-500">Performance</Label>
                <Label className="font-mono">{selectedTactic.conversions} conversions attributed</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTactic(null)}>Cancel</Button>
          {selectedTactic?.status === "Active" && <Button variant="outline" className="text-error-600">Deactivate</Button>}
          <Button variant="solid" onClick={() => setSelectedTactic(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Urgency Tactic</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="summer">Summer Music Festival 2025</option>
              <option value="gala">New Year Gala</option>
              <option value="tech">Tech Conference 2025</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Tactic Type...</option>
              <option value="countdown">⏰ Countdown Timer</option>
              <option value="inventory">🔥 Low Inventory Alert</option>
              <option value="price">📈 Price Increase Warning</option>
              <option value="last">⚡ Last Chance</option>
            </Select>
            <Input placeholder="Message (use {count} for inventory)" className="border-2 border-black" />
            <Grid cols={2} gap={4}>
              <Input type="datetime-local" placeholder="Start" className="border-2 border-black" />
              <Input type="datetime-local" placeholder="End" className="border-2 border-black" />
            </Grid>
            <Input type="number" placeholder="Threshold (for inventory tactics)" className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
